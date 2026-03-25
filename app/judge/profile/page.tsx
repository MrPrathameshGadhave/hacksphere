"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Mail,
  Phone,
  Scale,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import EditProfileModal, {
  type EditProfileForm,
} from "@/components/modals/EditProfileModal";
import ProfileInfoCard from "@/components/cards/ProfileInfoCard";
import SecurityCard from "@/components/cards/SecurityCard";

type JudgeProfileData = {
  name: string;
  email: string;
  college: string;
  role: string;
  judgeStatus: "active" | "pending" | "blocked";
  isApproved: boolean;
  createdAt: string | null;
  phone: string;
  bio: string;
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "JU";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function formatDate(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatJudgeStatus(status: JudgeProfileData["judgeStatus"]) {
  if (status === "active") return "Active";
  if (status === "pending") return "Pending";
  return "Blocked";
}

function getJudgeRoleHeading(status: JudgeProfileData["judgeStatus"]) {
  if (status === "active") return "Active Reviewer";
  if (status === "pending") return "Pending Reviewer";
  return "Restricted Reviewer";
}

function getJudgeAccessText(status: JudgeProfileData["judgeStatus"]) {
  if (status === "active") {
    return "Access is limited to judge dashboard, assigned project reviews, leaderboard view, and personal profile.";
  }

  if (status === "pending") {
    return "Judge account exists, but review access may remain limited until admin approval is completed.";
  }

  return "Judge access is currently restricted by admin status. Review and platform actions may be blocked.";
}

function normalizeProfileResponse(payload: any): JudgeProfileData {
  const source = payload?.user ?? payload?.data ?? payload ?? {};

  return {
    name: source?.name ?? "",
    email: source?.email ?? "",
    college: source?.college ?? "",
    role: source?.role ?? "judge",
    judgeStatus: source?.judgeStatus ?? "active",
    isApproved: Boolean(source?.isApproved),
    createdAt: source?.createdAt ?? null,
    phone: source?.phone ?? "",
    bio: source?.bio ?? "",
  };
}

function ProfileSkeleton() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="h-10 w-32 animate-pulse rounded-full bg-white/15" />
            <div className="h-10 w-full max-w-[460px] animate-pulse rounded-2xl bg-white/15" />
            <div className="h-20 w-full max-w-[620px] animate-pulse rounded-2xl bg-white/10" />
          </div>

          <div className="flex items-center gap-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="h-20 w-20 animate-pulse rounded-3xl bg-white/80" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-7 w-44 animate-pulse rounded bg-white/20" />
              <div className="h-5 w-28 animate-pulse rounded bg-white/15" />
              <div className="h-10 w-36 animate-pulse rounded-2xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="space-y-3">
              <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-72 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 h-5 w-full animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-5 w-64 animate-pulse rounded bg-gray-100" />
            <div className="mt-6 h-28 animate-pulse rounded-[22px] bg-gray-100" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-5 w-72 animate-pulse rounded bg-gray-100" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[22px] bg-gray-100"
                />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[22px] bg-gray-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function JudgeProfilePage() {
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [profile, setProfile] = useState<JudgeProfileData>({
    name: "",
    email: "",
    college: "",
    role: "judge",
    judgeStatus: "active",
    isApproved: false,
    createdAt: null,
    phone: "",
    bio: "",
  });

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response
          .json()
          .catch(() => ({ message: "Failed to fetch profile." }));

        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch profile.");
        }

        if (ignore) return;

        setProfile((prev) => {
          const normalized = normalizeProfileResponse(result);

          return {
            ...normalized,
            phone: normalized.phone || prev.phone,
            bio: normalized.bio || prev.bio,
          };
        });
      } catch (err) {
        if (ignore) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the judge profile."
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const initialValues: EditProfileForm = useMemo(
    () => ({
      name: profile.name,
      email: profile.email,
      organization: profile.college,
      phone: profile.phone,
      bio: profile.bio,
    }),
    [profile]
  );

  const handleSaveProfile = async (values: EditProfileForm) => {
    try {
      setSaving(true);
      setSaveError("");

      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          college: values.organization,
            phone: values.phone,

        }),
      });

      const result = await response
        .json()
        .catch(() => ({ message: "Failed to update profile." }));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to update profile.");
      }

      const normalized = normalizeProfileResponse(result);

      setProfile((prev) => ({
        ...prev,
        ...normalized,
        phone: values.phone,
        bio: values.bio,
      }));

      setOpenEdit(false);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the judge profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  const initials = getInitials(profile.name);
  const joinedDate = formatDate(profile.createdAt);
  const judgeStatusLabel = formatJudgeStatus(profile.judgeStatus);
  const roleHeading = getJudgeRoleHeading(profile.judgeStatus);
  const accessText = getJudgeAccessText(profile.judgeStatus);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Judge Profile
            </div>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              Manage your judging identity and account details.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Keep your profile updated while reviewing projects, evaluating
              submissions, and contributing to the final rankings.
            </p>

            {error ? (
              <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-2xl font-bold text-[#A01C33]">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold">
                {profile.name || "Judge Account"}
              </h2>
              <p className="mt-1 text-white/80">
                Judge • {judgeStatusLabel}
              </p>

              <button
                onClick={() => setOpenEdit(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ProfileInfoCard
            title="Basic Information"
            subtitle="Your judging account and official information."
            fields={[
              { label: "Full Name", value: profile.name || "Not available" },
              { label: "Email", value: profile.email || "Not available" },
              {
                label: "Institution",
                value: profile.college || "Not available",
              },
              {
                label: "Phone",
                value: profile.phone || "Not added yet",
              },
              {
                label: "Judge Status",
                value: judgeStatusLabel,
              },
              { label: "Joined", value: joinedDate },
            ]}
          />

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">About</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Judge profile summary and review background.
            </p>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm leading-7 text-gray-600">
                {profile.bio ||
                  "This judge profile does not have a bio yet. You can still update visible profile details from the edit modal."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SecurityCard
            roleLabel={roleHeading}
            accessText={accessText}
          />

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">Quick Info</h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Contact Email",
                  value: profile.email || "Not available",
                  icon: Mail,
                },
                {
                  title: "Phone Number",
                  value: profile.phone || "Not added yet",
                  icon: Phone,
                },
                {
                  title: "Role",
                  value: "Judge",
                  icon: UserCircle2,
                },
                {
                  title: "Review Access",
                  value:
                    profile.judgeStatus === "active"
                      ? "Assigned Projects Only"
                      : profile.judgeStatus === "pending"
                      ? "Awaiting Active Review Access"
                      : "Restricted by Admin Status",
                  icon: Scale,
                },
                {
                  title: "Approval State",
                  value: profile.isApproved ? "Approved" : "Pending Approval",
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#3B3C3E]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={openEdit}
        onClose={() => {
          if (saving) return;
          setOpenEdit(false);
          setSaveError("");
        }}
        onSave={handleSaveProfile}
        saving={saving}
        error={saveError}
        title="Edit Judge Profile"
        organizationLabel="Institution"
        initialValues={initialValues}
      />
    </section>
  );
}