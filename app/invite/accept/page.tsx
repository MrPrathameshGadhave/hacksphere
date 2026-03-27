"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  UserPlus,
  Users,
} from "lucide-react";

type MeUser = {
  _id: string;
  name: string;
  email: string;
  role?: "participant" | "judge" | "admin";
};

type InvitePreview = {
  teamName: string;
  invitedEmail: string;
  expiresAt: string;
  status: string;
  isRegistered: boolean;
  inviterName: string;
};

type InvitePreviewResponse = {
  success: boolean;
  invite: InvitePreview;
  message?: string;
};

type AuthMeResponse = {
  success: boolean;
  user: MeUser;
  message?: string;
};

type AcceptInviteResponse = {
  success: boolean;
  message?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

async function tryGetCurrentUser() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    return null;
  }

  return data.user as MeUser;
}

async function sendJson<T>(
  url: string,
  method: "POST",
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = String(searchParams.get("token") || "").trim();

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [currentUser, setCurrentUser] = useState<MeUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error("Invite token is missing");
        }

        const [previewRes, meUser] = await Promise.all([
          fetchJson<InvitePreviewResponse>(
            `/api/teams/invite-preview?token=${encodeURIComponent(token)}`
          ),
          tryGetCurrentUser(),
        ]);

        if (!isMounted) return;

        setInvite(previewRes.invite);
        setCurrentUser(meUser);
      } catch (error) {
        if (!isMounted) return;
        setError(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const redirectTarget = `/invite/accept?token=${encodeURIComponent(token)}`;

  const emailMismatch = useMemo(() => {
    if (!invite || !currentUser) return false;

    return (
      String(currentUser.email || "").trim().toLowerCase() !==
      String(invite.invitedEmail || "").trim().toLowerCase()
    );
  }, [invite, currentUser]);

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError(null);

      await sendJson<AcceptInviteResponse>("/api/teams/accept-invite", "POST", {
        token,
      });

      router.replace("/participant/my-team");
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            Team Invitation • HackSphere
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
            Accept your team invitation
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            Join a HackSphere team securely using the invite sent to your email.
          </p>
        </div>

        <div className="mt-6 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : invite ? (
            <div className="space-y-5">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#A01C33]">Team Invitation</p>
                    <h2 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                      {invite.teamName}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-gray-500">
                      {invite.inviterName} invited <strong>{invite.invitedEmail}</strong> to join this team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                  <p className="text-sm font-medium text-gray-500">Invited Email</p>
                  <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                    {invite.invitedEmail}
                  </p>
                </div>

                <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                    {invite.isRegistered ? "Registered participant found" : "Registration required"}
                  </p>
                </div>
              </div>

              {currentUser ? (
                emailMismatch ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    This invitation was sent to <strong>{invite.invitedEmail}</strong>.
                    You are currently logged in as <strong>{currentUser.email}</strong>. Please login with the invited account.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                    Logged in as the invited account. You can accept and join now.
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-700">
                  Login or register first to continue with this team invitation.
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {!currentUser ? (
                  <>
                    <Link
                      href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                    >
                      <LockKeyhole className="h-4 w-4" />
                      Login to Join
                    </Link>

                    <Link
                      href={`/register?email=${encodeURIComponent(
                        invite.invitedEmail
                      )}&redirect=${encodeURIComponent(redirectTarget)}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                    >
                      <UserPlus className="h-4 w-4" />
                      Register to Join
                    </Link>
                  </>
                ) : emailMismatch ? (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                  >
                    <Mail className="h-4 w-4" />
                    Login with Invited Email
                  </Link>
                ) : (
                  <button
                    onClick={handleAccept}
                    disabled={accepting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {accepting ? "Joining Team..." : "Accept & Join Team"}
                  </button>
                )}

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  Back
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6]" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}