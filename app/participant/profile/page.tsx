"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Download,
  Edit3,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";
import EditProfileModal, {
  EditProfileForm,
} from "@/components/modals/EditProfileModal";
import ProfileInfoCard from "@/components/cards/ProfileInfoCard";
import SecurityCard from "@/components/cards/SecurityCard";
import type { AdminCertificateItem, AdminCertificateMeta } from "@/lib/certificate-types";
import { formatCertificateDate } from "@/lib/certificate-types";

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  college?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role?: "participant" | "judge" | "admin";
  isApproved?: boolean;
  createdAt?: string;
};

type TeamProblemPreview = {
  id?: string;
  _id?: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  category?: string;
  difficulty?: string;
};

type TeamData = {
  _id: string;
  teamName: string;
  teamDescription?: string;
  leader: BasicUser;
  members: BasicUser[];
  maxSize: number;
  problemStatement: TeamProblemPreview | null;
  status: "active" | "pending" | "disqualified";
};

type AuthMeResponse = {
  success: boolean;
  user: BasicUser;
  message?: string;
};

type MyTeamResponse = {
  success: boolean;
  team: TeamData | null;
  message?: string;
};

type UpdateProfileResponse = {
  success: boolean;
  message?: string;
  user: BasicUser;
};

type ParticipantCertificateResponse = {
  success: boolean;
  published: boolean;
  available: boolean;
  item: AdminCertificateItem | null;
  meta: AdminCertificateMeta | null;
  message?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

async function sendJson<T>(
  url: string,
  method: "PATCH" | "POST",
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

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

function getInitials(name?: string) {
  if (!name) return "HS";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "HS";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function formatJoinedDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTeamStatusText(team: TeamData | null, user: BasicUser | null) {
  if (!team || !user) return "No Team";

  const isLeader = team.leader?._id === user._id;
  const base =
    team.status === "active"
      ? "Active"
      : team.status === "pending"
      ? "Pending"
      : "Disqualified";

  return `${base} | ${isLeader ? "Team Leader" : "Team Member"}`;
}

function getTeamAccessText(team: TeamData | null) {
  if (!team) return "Not Joined";
  if (team.status === "disqualified") return "Restricted";
  return "Enabled";
}

export default function ParticipantProfilePage() {
  const router = useRouter();

  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [certificate, setCertificate] =
    useState<ParticipantCertificateResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const [me, myTeam, myCertificate] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<MyTeamResponse>("/api/teams/my-team"),
          fetchJson<ParticipantCertificateResponse>("/api/participant/certificate"),
        ]);

        if (!isMounted) return;

        setUser(me.user);
        setTeam(myTeam.team);
        setCertificate(myCertificate);
      } catch (error) {
        const message = getErrorMessage(error);

        if (message === "UNAUTHORIZED") {
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setError(message);
        }
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
  }, [router]);

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  const approvalLabel = useMemo(() => {
    if (!user) return "Checking...";
    return user.isApproved === false ? "Pending Approval" : "Approved";
  }, [user]);

  const teamStatusLabel = useMemo(() => {
    return getTeamStatusText(team, user);
  }, [team, user]);

  const quickInfo = useMemo(
    () => [
      {
        title: "Contact Email",
        value: user?.email || "Not available",
        icon: Mail,
      },
        {
          title: "Phone Number",
          value: user?.phone || "Not added yet",
          icon: Phone,
        },
      {
        title: "Role",
        value: user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : "Participant",
        icon: UserCircle2,
      },
      {
        title: "Team Access",
        value: getTeamAccessText(team),
        icon: Users,
      },
    ],
    [user, team]
  );

  const aboutText = useMemo(() => {
    if (!user) {
      return "Loading your participant profile details...";
    }

    if (user.bio?.trim()) {
      return user.bio.trim();
    }

    if (!team) {
      return `${user.name} is registered as a HackSphere participant. You can create or join a team to continue with problem selection and project submission.`;
    }

    const isLeader = team.leader?._id === user._id;

    return `${user.name} is participating in HackSphere as ${
      isLeader ? "a team leader" : "a team member"
    } of "${team.teamName}". Current approval status is ${approvalLabel.toLowerCase()}, and your team is ${
      team.status === "active"
        ? "active"
        : team.status === "pending"
        ? "pending"
        : "disqualified"
    }.`;
  }, [user, team, approvalLabel]);

  const certificateStatus = useMemo(() => {
    if (!certificate) {
      return {
        tone:
          "border-[#e7dde1] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] text-[#5f4d53]",
        badge: "Checking",
        description: "We are checking whether your certificate is available.",
        note: "Certificate access depends on published leaderboard results.",
      };
    }

    if (!certificate.published) {
      return {
        tone:
          "border-amber-200 bg-[linear-gradient(135deg,#fff9eb_0%,#fff5dc_100%)] text-amber-900",
        badge: "Locked Until Publish",
        description:
          certificate.message ||
          "Certificate download unlocks after official leaderboard results are published.",
        note: "The download button stays disabled until the result goes live.",
      };
    }

    if (!certificate.available || !certificate.item) {
      return {
        tone:
          "border-[#e7dde1] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] text-[#5f4d53]",
        badge: "Not Available",
        description:
          certificate.message ||
          "No certificate is available for your account yet.",
        note: "Certificates are issued only for participants linked to official submission standings.",
      };
    }

    return {
      tone:
        "border-emerald-200 bg-[linear-gradient(135deg,#effdf5_0%,#ecfdf3_100%)] text-emerald-900",
      badge: certificate.item.awardLabel,
      description: `Your certificate is ready. It reflects team standing #${certificate.item.rank} and is issued on ${formatCertificateDate(
        certificate.item.issuedAt
      )}.`,
      note: `Certificate No. ${certificate.item.certificateNumber}`,
    };
  }, [certificate]);

  const canDownloadCertificate = Boolean(
    certificate?.published && certificate?.available && certificate?.item
  );

  const certificateStateLabel = useMemo(() => {
    if (!certificate) return "Checking";
    if (!certificate.published) return "Locked";
    if (certificate.available && certificate.item) return "Ready";
    return "Pending";
  }, [certificate]);

  const profileSignals = useMemo(
    () => [
      {
        label: "Approval",
        value: approvalLabel,
        note:
          user?.isApproved === false
            ? "Admin verification is still pending."
            : "Your participant workspace is active.",
        icon: ShieldCheck,
      },
      {
        label: "Team Mode",
        value: team?.teamName || "No Team Yet",
        note: team
          ? teamStatusLabel
          : "Create or join a team to unlock collaborative flows.",
        icon: Users,
      },
      {
        label: "Certificate",
        value: certificateStateLabel,
        note: canDownloadCertificate
          ? "Preview and download are available now."
          : certificate?.published
          ? "Waiting for an issued certificate record."
          : "Unlocked after official results are published.",
        icon: Award,
      },
    ],
    [
      approvalLabel,
      canDownloadCertificate,
      certificate,
      certificateStateLabel,
      team,
      teamStatusLabel,
      user?.isApproved,
    ]
  );

  const summaryBadges = useMemo(
    () => [
      {
        label: "Role",
        value: "Participant",
        icon: BadgeCheck,
      },
      {
        label: "Joined",
        value: formatJoinedDate(user?.createdAt),
        icon: CalendarDays,
      },
      {
        label: "Workspace",
        value: getTeamAccessText(team),
        icon: Sparkles,
      },
    ],
    [team, user?.createdAt]
  );

  const initialValues: EditProfileForm = {
    name: user?.name || "",
    email: user?.email || "",
    organization: user?.college || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  };

  const handleSaveProfile = async (values: EditProfileForm) => {
    try {
      setSavingProfile(true);
      setSaveError(null);

      const response = await sendJson<UpdateProfileResponse>(
        "/api/auth/profile",
        "PATCH",
        {
          name: values.name,
          email: values.email,
          college: values.organization,
          phone: values.phone,
          bio: values.bio,
        }
      );

      setUser(response.user);
      setOpenEdit(false);
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setSaveError(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!canDownloadCertificate) return;

    window.open("/participant/certificate?download=1", "_blank", "noopener,noreferrer");
  };

  const handlePreviewCertificate = () => {
    if (!canDownloadCertificate) return;

    window.open("/participant/certificate", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="space-y-8">
      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-[linear-gradient(135deg,#fff8f8_0%,#fff0f0_100%)] px-5 py-4 text-sm text-red-700 shadow-[0_10px_30px_rgba(185,28,28,0.08)]">
          {error}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[34px] border border-[#ead8dd] bg-[linear-gradient(135deg,#fffdf9_0%,#fff3f1_52%,#fffaf6_100%)] p-6 shadow-[0_28px_80px_rgba(120,67,78,0.12)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#f8dde3] blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-[#fde6db] blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.92fr] xl:items-start">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#ead7de] bg-white/80 px-4 py-2 text-sm font-medium text-[#8d5d6a] shadow-sm backdrop-blur-sm">
              Participant Profile
            </div>

            {loading ? (
              <>
                <SkeletonBlock className="mt-5 h-10 w-72 bg-[#eadfe3]" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-[#f0e6e8]" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-[#f0e6e8]" />

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-[#eadfe3] bg-white/80 p-4"
                    >
                      <SkeletonBlock className="h-10 w-10 rounded-2xl bg-[#f4e8eb]" />
                      <SkeletonBlock className="mt-4 h-5 w-24 bg-[#eadfe3]" />
                      <SkeletonBlock className="mt-2 h-4 w-full bg-[#f0e6e8]" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[#26161d] sm:text-4xl lg:text-[2.7rem]">
                  Keep your participant identity polished, current, and ready for
                  every stage of the hackathon.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4d53] sm:text-base">
                  This workspace brings together your verified profile data, team
                  identity, certificate access, and account controls in one clean
                  command center.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {profileSignals.map((signal) => {
                    const Icon = signal.icon;

                    return (
                      <div
                        key={signal.label}
                        className="group rounded-[24px] border border-[#eadfe3] bg-white/80 p-4 shadow-[0_14px_36px_rgba(103,40,55,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(103,40,55,0.1)]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition duration-300 group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
                          {signal.label}
                        </p>
                        <p className="mt-2 text-base font-semibold text-[#26161d]">
                          {signal.value}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                          {signal.note}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-[#eadfe3] bg-white/85 p-6 shadow-[0_22px_60px_rgba(103,40,55,0.1)] backdrop-blur-sm sm:p-7">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#f8e0e5] blur-3xl" />

            {loading ? (
              <div className="relative space-y-6">
                <div className="flex items-start gap-4">
                  <SkeletonBlock className="h-20 w-20 rounded-3xl bg-[#f4e8eb]" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="h-7 w-44 bg-[#eadfe3]" />
                    <SkeletonBlock className="mt-2 h-4 w-40 bg-[#f0e6e8]" />
                    <SkeletonBlock className="mt-5 h-11 w-40 rounded-2xl bg-[#eadfe3]" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[22px] border border-[#eadfe3] bg-[#fffaf8] p-4"
                    >
                      <SkeletonBlock className="h-4 w-20 bg-[#eadfe3]" />
                      <SkeletonBlock className="mt-3 h-5 w-full bg-[#f0e6e8]" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#a01c33_0%,#7f1629_100%)] text-2xl font-bold text-white shadow-[0_18px_36px_rgba(160,28,51,0.24)]">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center rounded-full border border-[#ead7de] bg-[#fff6f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6773]">
                      Participation Identity
                    </div>
                    <h2 className="mt-4 truncate text-2xl font-bold tracking-tight text-[#26161d] sm:text-[2rem]">
                      {user?.name || "Participant"}
                    </h2>
                    <p className="mt-2 text-sm text-[#6d5961]">
                      Participant | HackSphere
                    </p>
                    <p className="mt-2 text-sm text-[#8a6a74]">
                      {user?.email || "No email available"}
                    </p>

                    <button
                      onClick={() => {
                        setSaveError(null);
                        setOpenEdit(true);
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(160,28,51,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#8f1a2e]"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {summaryBadges.map((badge) => {
                    const Icon = badge.icon;

                    return (
                      <div
                        key={badge.label}
                        className="rounded-[22px] border border-[#eee3e6] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
                              {badge.label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[#2e1f25]">
                              {badge.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {loading ? (
            <div className="rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_58%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
              <SkeletonBlock className="h-8 w-52 bg-[#eadfe3]" />
              <SkeletonBlock className="mt-3 h-4 w-72 bg-[#f0e6e8]" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[22px] border border-[#eadfe3] bg-[#fffaf8] p-5"
                  >
                    <SkeletonBlock className="h-4 w-24 bg-[#eadfe3]" />
                    <SkeletonBlock className="mt-3 h-6 w-32 bg-[#f0e6e8]" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ProfileInfoCard
              title="Basic Information"
              subtitle="Your visible account and participant details."
              fields={[
                { label: "Full Name", value: user?.name || "Not available" },
                { label: "Email", value: user?.email || "Not available" },
                { label: "College", value: user?.college || "Not added yet" },
                {
                  label: "Approval Status",
                  value: approvalLabel,
                },
                {
                  label: "Joined",
                  value: formatJoinedDate(user?.createdAt),
                },
                {
                  label: "Team Status",
                  value: teamStatusLabel,
                },
              ]}
            />
          )}

          <div className="relative overflow-hidden rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_55%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(160,28,51,0.08),transparent_58%)]" />

            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
                    Profile Narrative
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
                    About
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7b646c]">
                    A concise summary of your participant presence across the
                    event.
                  </p>
                </div>

                {!loading ? (
                  <div className="inline-flex items-center rounded-full border border-[#efe2e7] bg-white/80 px-4 py-2 text-sm font-medium text-[#845965]">
                    {team ? team.teamName : "Independent Profile"}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 rounded-[24px] border border-[#efe3e7] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                {loading ? (
                  <>
                    <SkeletonBlock className="h-4 w-full bg-[#eadfe3]" />
                    <SkeletonBlock className="mt-2 h-4 w-11/12 bg-[#f0e6e8]" />
                    <SkeletonBlock className="mt-2 h-4 w-9/12 bg-[#f0e6e8]" />
                  </>
                ) : (
                  <p className="text-sm leading-7 text-[#5f4d53]">{aboutText}</p>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#efe3e7] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
                    Team Standing
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#2e1f25]">
                    {loading ? "Checking..." : teamStatusLabel}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#efe3e7] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
                    Certificate State
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#2e1f25]">
                    {loading ? "Checking..." : certificateStateLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SecurityCard
            roleLabel="Participant"
            accessText="Access is limited to dashboard, team management, problem statements, submission, announcements, leaderboard, and profile features."
          />

          <div className="relative overflow-hidden rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_55%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(160,28,51,0.07),transparent_58%)]" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
                    Recognition
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
                    Certificate Access
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7b646c]">
                    Download your official HackSphere certificate once leaderboard
                    results are published and your award record is issued.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              {loading ? (
                <div className="mt-6 space-y-4">
                  <SkeletonBlock className="h-24 w-full rounded-[22px] bg-[#f0e6e8]" />
                  <SkeletonBlock className="h-12 w-44 rounded-2xl bg-[#eadfe3]" />
                </div>
              ) : (
                <>
                  <div
                    className={`mt-6 rounded-[24px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${certificateStatus.tone}`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                      {certificateStatus.badge}
                    </p>
                    <p className="mt-3 text-sm leading-7">
                      {certificateStatus.description}
                    </p>
                    <p className="mt-3 text-sm opacity-90">
                      {certificateStatus.note}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handleDownloadCertificate}
                      disabled={!canDownloadCertificate}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(160,28,51,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#8f1a2e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </button>

                    <button
                      onClick={handlePreviewCertificate}
                      disabled={!canDownloadCertificate}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#eadfe3] bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition duration-300 hover:-translate-y-0.5 hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Award className="h-4 w-4" />
                      Preview Certificate
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_55%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(160,28,51,0.07),transparent_58%)]" />

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
                Snapshot
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
                Quick Info
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#7b646c]">
                Contact, role, and workspace status at a glance.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5"
                      >
                        <div className="flex items-start gap-3">
                          <SkeletonBlock className="h-11 w-11 rounded-2xl bg-[#f0e6e8]" />
                          <div className="flex-1">
                            <SkeletonBlock className="h-5 w-28 bg-[#eadfe3]" />
                            <SkeletonBlock className="mt-3 h-4 w-40 bg-[#f0e6e8]" />
                          </div>
                        </div>
                      </div>
                    ))
                  : quickInfo.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="group rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5 shadow-[0_14px_30px_rgba(103,40,55,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(103,40,55,0.09)]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition duration-300 group-hover:scale-105">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-[#2e1f25]">
                                {item.title}
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
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
      </div>

      <EditProfileModal
        open={openEdit}
        onClose={() => {
          if (savingProfile) return;
          setOpenEdit(false);
          setSaveError(null);
        }}
        onSave={handleSaveProfile}
        saving={savingProfile}
        error={saveError}
        title="Edit Participant Profile"
        organizationLabel="College"
        initialValues={initialValues}
      />
    </section>
  );
}

