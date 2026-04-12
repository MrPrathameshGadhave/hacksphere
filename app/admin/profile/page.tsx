"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Edit3,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import EditProfileModal, {
  type EditProfileForm,
} from "@/components/modals/EditProfileModal";
import ProfileInfoCard from "@/components/cards/ProfileInfoCard";
import SecurityCard from "@/components/cards/SecurityCard";

type AdminProfileData = {
  name: string;
  email: string;
  college: string;
  role: string;
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

  if (parts.length === 0) return "AD";

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

function normalizeProfileResponse(payload: unknown): AdminProfileData {
  const source =
    typeof payload === "object" && payload !== null
      ? (payload as { user?: Record<string, unknown> }).user ??
        (payload as Record<string, unknown>)
      : {};

  return {
    name: typeof source.name === "string" ? source.name : "",
    email: typeof source.email === "string" ? source.email : "",
    college: typeof source.college === "string" ? source.college : "",
    role: typeof source.role === "string" ? source.role : "admin",
    isApproved: Boolean(source.isApproved ?? true),
    createdAt: typeof source.createdAt === "string" ? source.createdAt : null,
    phone: typeof source.phone === "string" ? source.phone : "",
    bio: typeof source.bio === "string" ? source.bio : "",
  };
}

function ProfileSkeleton() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="h-10 w-36 animate-pulse rounded-full bg-white/15" />
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
          <div className="h-64 animate-pulse rounded-[28px] bg-white" />
          <div className="h-52 animate-pulse rounded-[28px] bg-white" />
        </div>
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-[28px] bg-white" />
          <div className="h-60 animate-pulse rounded-[28px] bg-white" />
        </div>
      </div>
    </section>
  );
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [profile, setProfile] = useState<AdminProfileData>({
    name: "",
    email: "",
    college: "",
    role: "admin",
    isApproved: true,
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

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch profile.");
        }

        if (ignore) return;

        setProfile(normalizeProfileResponse(result));
      } catch (err) {
        if (ignore) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the admin profile."
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [router]);

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
          bio: values.bio,
        }),
      });

      const result = await response
        .json()
        .catch(() => ({ message: "Failed to update profile." }));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to update profile.");
      }

      setProfile(normalizeProfileResponse(result));
      setOpenEdit(false);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the admin profile."
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
  const roleLabel = "Administrator";
  const accessText =
    "Full organizer access includes participant, judge, team, problem, submission, leaderboard, certificate, announcement, and audit-log operations.";

  const quickInfo = [
    {
      title: "Admin Email",
      value: profile.email || "Not available",
      icon: Mail,
    },
    {
      title: "Phone Number",
      value: profile.phone || "Not added yet",
      icon: Phone,
    },
    {
      title: "Organization",
      value: profile.college || "Not added yet",
      icon: Building2,
    },
    {
      title: "Joined Platform",
      value: joinedDate,
      icon: CalendarDays,
    },
  ];

  const aboutText = profile.bio?.trim()
    ? profile.bio.trim()
    : `${profile.name} is part of the HackSphere organizer workspace and can coordinate approvals, submissions, leaderboard publishing, certificate readiness, and event-wide administration.`;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Organizer Identity
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Keep your admin profile accurate and platform-ready.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
              This workspace controls how you appear across admin operations and
              helps keep organizer contact details aligned for event management.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setOpenEdit(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] shadow-[0_16px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                Organizer Access Active
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-2xl font-black text-[#A01C33] shadow-[0_16px_34px_rgba(0,0,0,0.14)]">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-2xl font-bold">{profile.name || "Administrator"}</p>
                <p className="mt-1 text-sm text-white/75">{roleLabel}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Access Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <ProfileInfoCard
            title="Admin identity records"
            subtitle="These details are used across profile surfaces and organizer-facing account views."
            fields={[
              { label: "Full Name", value: profile.name || "Not available" },
              { label: "Email", value: profile.email || "Not available" },
              { label: "Organization", value: profile.college || "Not added yet" },
              { label: "Role", value: roleLabel },
              { label: "Joined", value: joinedDate },
              {
                label: "Account State",
                value: profile.isApproved === false ? "Pending" : "Active",
              },
            ]}
          />

          <div className="rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_58%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
              Profile Narrative
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
              About This Admin
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7b646c]">
              Use the bio to clarify responsibilities, organizer identity, or
              event ownership context for the internal team.
            </p>
            <div className="mt-6 rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5 shadow-[0_14px_30px_rgba(103,40,55,0.05)]">
              <p className="text-sm leading-7 text-[#4d3d43]">{aboutText}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_58%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
              Quick Reference
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
              Control Details
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7b646c]">
              Fast access to the identity details that matter during event operations.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {quickInfo.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5 shadow-[0_14px_30px_rgba(103,40,55,0.05)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#2e1f25]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <SecurityCard roleLabel={roleLabel} accessText={accessText} />
        </div>
      </div>

      <EditProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSave={handleSaveProfile}
        title="Edit Admin Profile"
        organizationLabel="Organization"
        initialValues={initialValues}
        saving={saving}
        error={saveError}
      />
    </section>
  );
}
