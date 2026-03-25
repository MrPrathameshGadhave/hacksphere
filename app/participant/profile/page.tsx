"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Mail, Phone, UserCircle2, Users } from "lucide-react";
import EditProfileModal, {
  EditProfileForm,
} from "@/components/modals/EditProfileModal";
import ProfileInfoCard from "@/components/cards/ProfileInfoCard";
import SecurityCard from "@/components/cards/SecurityCard";

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  college?: string;
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

  return `${base} • ${isLeader ? "Team Leader" : "Team Member"}`;
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

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const [me, myTeam] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<MyTeamResponse>("/api/teams/my-team"),
        ]);

        if (!isMounted) return;

        setUser(me.user);
        setTeam(myTeam.team);
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
        value: "Not added yet",
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

  const initialValues: EditProfileForm = {
    name: user?.name || "",
    email: user?.email || "",
    organization: user?.college || "",
    phone: "",
    bio: "",
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

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Participant Profile
            </div>

            {loading ? (
              <>
                <SkeletonBlock className="mt-5 h-10 w-72 bg-white/20" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-white/15" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-white/15" />
              </>
            ) : (
              <>
                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Manage your profile and participation details.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  View your account information, team-related identity, and participant
                  access details from one central profile page.
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-2xl font-bold text-[#A01C33]">
              {loading ? "..." : initials}
            </div>

            <div>
              {loading ? (
                <>
                  <SkeletonBlock className="h-7 w-40 bg-white/20" />
                  <SkeletonBlock className="mt-2 h-4 w-36 bg-white/15" />
                  <SkeletonBlock className="mt-4 h-10 w-32 bg-white/20" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">
                    {user?.name || "Participant"}
                  </h2>
                  <p className="mt-1 text-white/80">Participant • HackSphere</p>
                  <button
                    onClick={() => {
                      setSaveError(null);
                      setOpenEdit(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {loading ? (
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <SkeletonBlock className="h-8 w-52" />
              <SkeletonBlock className="mt-3 h-4 w-72" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <SkeletonBlock className="h-4 w-24" />
                    <SkeletonBlock className="mt-3 h-6 w-32" />
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

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">About</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Additional profile description for participant identity.
            </p>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              {loading ? (
                <>
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-11/12" />
                  <SkeletonBlock className="mt-2 h-4 w-9/12" />
                </>
              ) : (
                <p className="text-sm leading-7 text-gray-600">{aboutText}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SecurityCard
            roleLabel="Participant"
            accessText="Access is limited to dashboard, team management, problem statements, submission, announcements, leaderboard, and profile features."
          />

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">Quick Info</h2>

            <div className="mt-6 space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <div className="flex items-start gap-3">
                        <SkeletonBlock className="h-11 w-11 rounded-2xl" />
                        <div className="flex-1">
                          <SkeletonBlock className="h-5 w-28" />
                          <SkeletonBlock className="mt-3 h-4 w-40" />
                        </div>
                      </div>
                    </div>
                  ))
                : quickInfo.map((item) => {
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