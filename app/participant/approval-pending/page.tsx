"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
};

function formatRegisteredDate(value?: string) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ApprovalPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectTarget = String(searchParams.get("redirect") || "").trim();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (data.user?.isApproved) {
          router.replace(redirectTarget || "/participant/dashboard");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        setError("Failed to check approval status");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkApprovalStatus();
    const interval = setInterval(checkApprovalStatus, 5000);

    return () => clearInterval(interval);
  }, [redirectTarget, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffdf8_0%,#fff6f3_55%,#f8f2f4_100%)] px-4">
        <div className="rounded-[28px] border border-[#eadfe3] bg-white/90 px-8 py-10 text-center shadow-[0_24px_70px_rgba(74,36,48,0.12)]">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#f0e6e8] border-t-[#A01C33]" />
          <p className="text-sm font-medium text-[#6f5b62]">
            Checking approval status...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffdf8_0%,#fff6f3_55%,#f8f2f4_100%)] px-4">
        <div className="max-w-lg rounded-[28px] border border-red-200 bg-[linear-gradient(135deg,#fff8f8_0%,#fff0f0_100%)] p-8 text-center shadow-[0_24px_70px_rgba(185,28,28,0.08)]">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#fff6f3_55%,#f8f2f4_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="relative overflow-hidden rounded-[34px] border border-[#ead8dd] bg-[linear-gradient(135deg,#fffdf9_0%,#fff3f1_52%,#fffaf6_100%)] p-8 shadow-[0_28px_80px_rgba(120,67,78,0.12)] sm:p-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#f8dde3] blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-[#fde6db] blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#ead7de] bg-white/80 px-4 py-2 text-sm font-medium text-[#8d5d6a] shadow-sm">
                Participant Approval
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#26161d] sm:text-4xl">
                Your account is in the final verification queue.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4d53] sm:text-base">
                Your registration has been received successfully. The organizing
                team is reviewing your profile before unlocking the full participant
                workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  <Clock className="h-4 w-4" />
                  Awaiting Admin Approval
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#eadfe3] bg-white/80 px-4 py-3 text-sm font-semibold text-[#6f5b62]">
                  <RefreshCcw className="h-4 w-4" />
                  Auto-refreshes every 5 seconds
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#eadfe3] bg-white/85 p-6 shadow-[0_18px_50px_rgba(74,36,48,0.08)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-amber-100 text-amber-700">
                <Clock className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#26161d]">
                Review in Progress
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6f5b62]">
                Most approvals are completed within 24 hours, depending on
                verification load and organizer review windows.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#eadfe3] bg-white/90 p-6 shadow-[0_18px_55px_rgba(74,36,48,0.08)] sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
                What Happens Next
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
                Approval roadmap
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Account created",
                    text: "Your participant account has been registered on the platform.",
                    icon: CheckCircle2,
                    tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
                  },
                  {
                    title: "Admin review underway",
                    text: "Your participant profile is being reviewed before workspace access is unlocked.",
                    icon: Clock,
                    tone: "text-amber-800 bg-amber-50 border-amber-200",
                  },
                  {
                    title: "Full workspace unlock",
                    text: "Once approved, you’ll be redirected into the participant dashboard automatically.",
                    icon: Sparkles,
                    tone: "text-[#A01C33] bg-[#fff4f6] border-[#ead7de]",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className={`rounded-[24px] border p-5 ${item.tone}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold">{item.title}</h3>
                          <p className="mt-2 text-sm leading-7 opacity-90">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {user ? (
              <div className="rounded-[30px] border border-[#eadfe3] bg-white/90 p-6 shadow-[0_18px_55px_rgba(74,36,48,0.08)] sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
                  Your Registration
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
                  Submitted account details
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Name", user.name],
                    ["Email", user.email],
                    ["Role", "Participant"],
                    ["Registered", formatRegisteredDate(user.createdAt)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[22px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
                        {label}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-[#2e1f25]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#eadfe3] bg-white/90 p-6 shadow-[0_18px_55px_rgba(74,36,48,0.08)] sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
                Support
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
                Need help while you wait?
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2e1f25]">Contact support</h3>
                      <p className="mt-2 text-sm leading-7 text-[#6f5b62]">
                        Reach the organizing team at{" "}
                        <a
                          href="mailto:support@hacksphere.com"
                          className="font-semibold text-[#A01C33] underline"
                        >
                          support@hacksphere.com
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-dashed border-[#d9b6c0] bg-[linear-gradient(135deg,rgba(160,28,51,0.04)_0%,rgba(255,255,255,0.9)_100%)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2e1f25]">
                        Keep this tab open if you want
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[#6f5b62]">
                        The page checks your approval status automatically and
                        moves you to the dashboard once access is granted.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#eadfe3] bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApprovalPendingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffdf8_0%,#fff6f3_55%,#f8f2f4_100%)] px-4">
      <div className="rounded-[28px] border border-[#eadfe3] bg-white/90 px-8 py-10 text-center shadow-[0_24px_70px_rgba(74,36,48,0.12)]">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#f0e6e8] border-t-[#A01C33]" />
        <p className="text-sm font-medium text-[#6f5b62]">
          Loading approval status...
        </p>
      </div>
    </div>
  );
}

export default function ApprovalPendingPage() {
  return (
    <Suspense fallback={<ApprovalPendingFallback />}>
      <ApprovalPendingContent />
    </Suspense>
  );
}
