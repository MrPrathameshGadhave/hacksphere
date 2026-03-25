"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Copy,
  Crown,
  Lightbulb,
  Mail,
  Plus,
  RefreshCcw,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  PencilLine,
} from "lucide-react";
import ConfirmActionModal from "@/components/modals/ConfirmActionModal";
import InviteMemberModal from "@/components/modals/InviteMemberModal";

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  college?: string;
  avatar?: string;
  role?: "participant" | "judge" | "admin";
  isApproved?: boolean;
};

type ProblemStatementPreview = {
  _id: string;
  title: string;
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
  problemStatement: ProblemStatementPreview | null;
  status: "active" | "pending" | "disqualified";
  inviteCode?: string | null;
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

type TeamMutationResponse = {
  success: boolean;
  message?: string;
  team: TeamData;
};

type DisplayMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  isLeader: boolean;
  isEmpty?: boolean;
  rawUser?: BasicUser;
};

type TeamFormValues = {
  teamName: string;
  teamDescription: string;
  maxSize: number;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function getInitials(name?: string) {
  if (!name) return "+";

  const parts = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "+";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function getTeamStatusLabel(team: TeamData | null) {
  if (!team) return "Solo";

  const count = 1 + team.members.length;

  if (count <= 1) return "Solo";
  if (count === 2) return "Duo";
  if (count === 3) return "Trio";
  return "Full Team";
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
  method: "POST" | "PATCH",
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

function TeamFormModal({
  open,
  onClose,
  onSubmit,
  loading,
  mode,
  initialValues,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TeamFormValues) => Promise<void>;
  loading: boolean;
  mode: "create" | "edit";
  initialValues: TeamFormValues;
}) {
  const [form, setForm] = useState<TeamFormValues>(initialValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialValues);
      setError("");
    }
  }, [open, initialValues]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.teamName.trim()) {
      setError("Team name is required");
      return;
    }

    if (form.maxSize < 2 || form.maxSize > 4) {
      setError("Team size must be between 2 and 4");
      return;
    }

    setError("");

    await onSubmit({
      teamName: form.teamName.trim(),
      teamDescription: form.teamDescription.trim(),
      maxSize: form.maxSize,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">
              {mode === "create" ? "Create Team" : "Edit Team"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              {mode === "create"
                ? "Set up your hackathon team"
                : "Update your team details"}
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Team Name
              </label>
              <input
                type="text"
                value={form.teamName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, teamName: event.target.value }))
                }
                placeholder="Enter your team name"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Team Description
              </label>
              <textarea
                value={form.teamDescription}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    teamDescription: event.target.value,
                  }))
                }
                placeholder="Write a short description about your team"
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Team Size Limit
              </label>
              <select
                value={form.maxSize}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    maxSize: Number(event.target.value),
                  }))
                }
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              >
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members</option>
              </select>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:opacity-60"
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Team"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ParticipantMyTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoJoinAttemptedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);

  const [joinCode, setJoinCode] = useState("");
  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [inviteMemberModalOpen, setInviteMemberModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BasicUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

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
          const inviteCodeFromUrl = searchParams.get("inviteCode") || "";
          const autoJoinParam = searchParams.get("autoJoin") || "";

          const redirectTarget = inviteCodeFromUrl
            ? `/participant/my-team?inviteCode=${encodeURIComponent(inviteCodeFromUrl)}${
                autoJoinParam === "true" ? "&autoJoin=true" : ""
              }`
            : "/participant/my-team";

          router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
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
  }, [router, searchParams]);

  const isLeader = useMemo(() => {
    if (!user || !team) return false;
    return team.leader?._id === user._id;
  }, [user, team]);

  const currentSize = useMemo(() => {
    if (!team) return 1;
    return 1 + (team.members?.length || 0);
  }, [team]);

  const hasUnapprovedParticipants = useMemo(() => {
    if (!team) {
      return user?.isApproved === false;
    }

    return [team.leader, ...(team.members || [])].some(
      (member) => member?.isApproved === false
    );
  }, [team, user]);

  const displayMembers = useMemo<DisplayMember[]>(() => {
    if (!user) return [];

    if (!team) {
      return [
        {
          id: user._id,
          name: user.name,
          role: "Team Leader",
          email: user.email,
          initials: getInitials(user.name),
          isLeader: true,
          rawUser: user,
        },
        ...Array.from({ length: 3 }).map((_, index) => ({
          id: `empty-${index + 1}`,
          name: "Member Slot Available",
          role: "Open Position",
          email: "Invite pending",
          initials: "+",
          isLeader: false,
          isEmpty: true,
        })),
      ];
    }

    const actualMembers: DisplayMember[] = [
      {
        id: team.leader._id,
        name: team.leader.name,
        role: "Team Leader",
        email: team.leader.email,
        initials: getInitials(team.leader.name),
        isLeader: true,
        rawUser: team.leader,
      },
      ...(team.members || []).map((member) => ({
        id: member._id,
        name: member.name,
        role: "Team Member",
        email: member.email,
        initials: getInitials(member.name),
        isLeader: false,
        rawUser: member,
      })),
    ];

    const remainingSlots = Math.max(0, team.maxSize - actualMembers.length);

    const emptySlots: DisplayMember[] = Array.from(
      { length: remainingSlots },
      (_, index) => ({
        id: `empty-${index + 1}`,
        name: "Member Slot Available",
        role: "Open Position",
        email: "Invite pending",
        initials: "+",
        isLeader: false,
        isEmpty: true,
      })
    );

    return [...actualMembers, ...emptySlots];
  }, [team, user]);

  const teamFormInitialValues = useMemo<TeamFormValues>(() => {
    if (!team) {
      return {
        teamName: "",
        teamDescription: "",
        maxSize: 4,
      };
    }

    return {
      teamName: team.teamName || "",
      teamDescription: team.teamDescription || "",
      maxSize: team.maxSize || 4,
    };
  }, [team]);

  const primaryActionLabel = team ? "Edit Team" : "Create Team";
  const teamStatusLabel = getTeamStatusLabel(team);

  const handleTeamSubmit = async (values: TeamFormValues) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = team
        ? await sendJson<TeamMutationResponse>("/api/teams/update", "PATCH", values)
        : await sendJson<TeamMutationResponse>("/api/teams/create", "POST", values);

      setTeam(response.team);
      setTeamFormOpen(false);
      setSuccess(
        response.message ||
          (team ? "Team updated successfully" : "Team created successfully")
      );
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAskRemoveMember = (member: BasicUser) => {
    setSelectedMember(member);
    setRemoveModalOpen(true);
  };

  const handleConfirmRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      setRemoveLoading(true);
      setError(null);
      setSuccess(null);

      const response = await sendJson<TeamMutationResponse>(
        "/api/teams/remove-member",
        "POST",
        {
          memberId: selectedMember._id,
        }
      );

      setTeam(response.team);
      setRemoveModalOpen(false);
      setSelectedMember(null);
      setSuccess(response.message || "Member removed successfully");
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleGenerateInviteCode = async () => {
    try {
      setInviteLoading(true);
      setError(null);
      setSuccess(null);

      const response = await sendJson<TeamMutationResponse>(
        "/api/teams/generate-invite",
        "POST",
        {}
      );

      setTeam(response.team);
      setSuccess(response.message || "Invite code generated successfully");
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!team?.inviteCode) return;

    try {
      await navigator.clipboard.writeText(team.inviteCode);
      setSuccess("Invite code copied successfully");
      setError(null);
    } catch {
      setError("Could not copy invite code. Please copy it manually.");
    }
  };

  const handleJoinTeam = async (
    overrideCode?: string,
    shouldClearUrlAfterJoin?: boolean
  ) => {
    try {
      const code = (overrideCode || joinCode).trim().toUpperCase();

      if (!code) {
        setError("Invite code is required");
        return;
      }

      setJoinLoading(true);
      setError(null);
      setSuccess(null);

      const response = await sendJson<TeamMutationResponse>(
        "/api/teams/join",
        "POST",
        {
          inviteCode: code,
        }
      );

      setTeam(response.team);
      setJoinCode("");
      setSuccess(response.message || "Joined team successfully");

      if (shouldClearUrlAfterJoin) {
        router.replace("/participant/my-team");
      }
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        const code = (overrideCode || joinCode).trim().toUpperCase();
        const redirectTarget = `/participant/my-team?inviteCode=${encodeURIComponent(
          code
        )}&autoJoin=true`;

        router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
        return;
      }

      setError(message);
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (team) return;

    const inviteCodeFromUrl = (searchParams.get("inviteCode") || "")
      .trim()
      .toUpperCase();
    const autoJoin = searchParams.get("autoJoin") === "true";

    if (!inviteCodeFromUrl) return;

    setJoinCode(inviteCodeFromUrl);

    if (autoJoin && !autoJoinAttemptedRef.current) {
      autoJoinAttemptedRef.current = true;
      void handleJoinTeam(inviteCodeFromUrl, true);
    }
  }, [loading, user, team, searchParams]);

  const handleSendInviteEmail = async (email: string) => {
    try {
      setSendingInvite(true);
      setError(null);
      setSuccess(null);

      const response = await sendJson<{ success: boolean; message?: string }>(
        "/api/teams/send-invite",
        "POST",
        { email }
      );

      setInviteMemberModalOpen(false);
      setSuccess(response.message || "Invite email sent successfully");
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setSendingInvite(false);
    }
  };

  const selectedProblemTitle = team?.problemStatement?.title || "Not Selected";
  const selectedProblemDescription = team?.problemStatement
    ? team.problemStatement.shortDescription ||
      "Your team has selected a problem statement."
    : "Your team has not chosen a problem statement yet.";

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#941a30] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Team Workspace • Powered by HackSphere
            </div>

            {loading ? (
              <div className="mt-5">
                <SkeletonBlock className="h-10 w-72 bg-white/20" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-white/15" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-white/15" />
              </div>
            ) : (
              <>
                <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Build your team and prepare for the hackathon.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  Create a strong team, invite members, join by code, choose the right problem
                  statement, and get your group ready for submission and evaluation.
                </p>
              </>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setTeamFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                {team ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {primaryActionLabel}
              </button>

              <Link
                href="/participant/problems"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Explore Problems
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Team Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "Loading..." : teamStatusLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {loading
                  ? "Please wait while your team data loads."
                  : team
                  ? `Your team currently has ${currentSize} member${
                      currentSize > 1 ? "s" : ""
                    }.`
                  : "You have not completed your team yet."}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Allowed Size</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "2 - 4 Members" : `${team?.maxSize || 4} Members Max`}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Team leader can manage invites and members.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!team ? (
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm font-medium text-[#A01C33]">Create New Team</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Start your own squad
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                Create a new team, become the leader, and invite teammates using an invite code.
              </p>

              <button
                onClick={() => setTeamFormOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
              >
                <Plus className="h-4 w-4" />
                Create Team
              </button>
            </div>

            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm font-medium text-[#A01C33]">Join Existing Team</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Join using invite code
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                Ask your team leader for the team invite code and join instantly.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="h-12 flex-1 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                />

                <button
                  onClick={() => handleJoinTeam()}
                  disabled={joinLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {joinLoading ? "Joining..." : "Join Team"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Team Overview</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Your current team details
              </h2>
            </div>

            <button
              onClick={() => setTeamFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c]"
            >
              {team ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {primaryActionLabel}
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 lg:col-span-2">
              <p className="text-sm font-medium text-gray-500">Team Name</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "Loading..." : team?.teamName || "No Team Created Yet"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                {loading
                  ? "Loading team details..."
                  : team?.teamDescription?.trim()
                  ? team.teamDescription
                  : "Create a team to invite members and continue with problem selection and project submission."}
              </p>
            </div>

            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm font-medium text-gray-500">Current Size</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : `${currentSize} / ${team?.maxSize || 4}`}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                {loading
                  ? "Loading member count..."
                  : team
                  ? `Your team currently has ${currentSize} member${
                      currentSize > 1 ? "s" : ""
                    }.`
                  : "You are currently the only member."}
              </p>
            </div>
          </div>

          {team && isLeader ? (
            <div className="mt-5 rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
              <p className="text-sm font-medium text-[#A01C33]">Team Invite Code</p>
              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm leading-7 text-[#3B3C3E]">
                    Share this code with teammates so they can join your team.
                  </p>
                  <code className="mt-2 inline-block rounded-xl bg-white px-4 py-3 text-sm font-bold tracking-[0.2em] text-[#A01C33] shadow-sm">
                    {team.inviteCode || "No Code Yet"}
                  </code>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyInviteCode}
                    disabled={!team.inviteCode}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:opacity-60"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </button>

                  <button
                    onClick={handleGenerateInviteCode}
                    disabled={inviteLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:opacity-60"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {inviteLoading ? "Generating..." : "Regenerate"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
            <p className="text-sm font-medium text-[#A01C33]">
              Recommended next step
            </p>
            <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
              {!team
                ? "Create or join a team first, then invite or add teammates before selecting a problem statement."
                : hasUnapprovedParticipants
                ? "Wait for admin verification of all team participants before selecting a problem statement."
                : !team.problemStatement
                ? "Your team is ready. Next, choose a problem statement for the hackathon."
                : "Your team and problem selection are ready. You can move toward project submission."}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-[#A01C33]">Problem Selection</p>
          <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
            Team challenge status
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Selected Problem
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                    {loading ? "Loading..." : selectedProblemTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    {loading
                      ? "Checking selected challenge..."
                      : selectedProblemDescription}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>
            </div>

            {hasUnapprovedParticipants ? (
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-700">
                  Admin verification pending
                </p>
                <p className="mt-2 text-sm leading-7 text-amber-800">
                  All team participants must be approved by admin before the team leader can select a problem statement.
                </p>
              </div>
            ) : null}

            <Link
              href="/participant/problems"
              className="group flex items-center justify-between rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
            >
              <div>
                <h3 className="text-base font-bold text-[#3B3C3E]">
                  Browse problem statements
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Explore all available hackathon challenges and select one for
                  your team.
                </p>
              </div>

              <ArrowRight className="h-5 w-5 text-[#A01C33] transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Team Members</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Manage your squad
              </h2>
            </div>

            <button
              disabled={!team || !isLeader || currentSize >= (team?.maxSize || 4)}
              onClick={() => setInviteMemberModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <SkeletonBlock className="h-14 w-14 rounded-2xl" />
                      <div className="min-w-0 flex-1">
                        <SkeletonBlock className="h-5 w-36" />
                        <SkeletonBlock className="mt-2 h-4 w-24" />
                        <SkeletonBlock className="mt-3 h-4 w-full" />
                        <div className="mt-4 flex gap-2">
                          <SkeletonBlock className="h-9 w-20 rounded-xl" />
                          <SkeletonBlock className="h-9 w-24 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : displayMembers.map((member) => (
                  <div
                    key={`${member.id}-${member.role}`}
                    className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                          member.isEmpty
                            ? "bg-gray-100 text-gray-500"
                            : "bg-[#A01C33] text-white"
                        }`}
                      >
                        {member.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-bold text-[#3B3C3E]">
                            {member.name}
                          </h3>

                          {member.isLeader && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#A01C33]/10 px-2.5 py-1 text-xs font-semibold text-[#A01C33]">
                              <Crown className="h-3.5 w-3.5" />
                              Leader
                            </span>
                          )}

                          {!member.isEmpty && member.rawUser?.isApproved === false ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Pending Approval
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {member.role}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {member.isEmpty ? (
                            <button
                              disabled={!team || !isLeader}
                              onClick={() => setInviteMemberModalOpen(true)}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#A01C33] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Invite
                            </button>
                          ) : (
                            <>
                              <a
                                href={`mailto:${member.email}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Contact
                              </a>

                              {!member.isLeader && isLeader && member.rawUser ? (
                                <button
                                  onClick={() => handleAskRemoveMember(member.rawUser)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Remove
                                </button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-[#A01C33]">Quick Actions</p>
          <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
            Team workflow
          </h2>

          <div className="mt-6 space-y-4">
            <Link
              href="/participant/problems"
              className="group block rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-[#A01C33] transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                Choose Problem Statement
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                Select the challenge your team wants to solve.
              </p>
            </Link>

            <Link
              href="/participant/submission"
              className="group block rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-[#A01C33] transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                Go to Submission
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                Upload your final project details before the deadline.
              </p>
            </Link>
          </div>

          <div className="mt-5 rounded-[22px] border border-dashed border-gray-300 bg-[#fafafa] p-5">
            <p className="text-sm font-medium text-gray-600">Important note</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Only one team leader can manage members and complete the final
              project submission for HackSphere.
            </p>
          </div>
        </div>
      </div>

      <TeamFormModal
        open={teamFormOpen}
        onClose={() => setTeamFormOpen(false)}
        onSubmit={handleTeamSubmit}
        loading={saving}
        mode={team ? "edit" : "create"}
        initialValues={teamFormInitialValues}
      />

      <InviteMemberModal
        open={inviteMemberModalOpen}
        onClose={() => setInviteMemberModalOpen(false)}
        onSend={handleSendInviteEmail}
        loading={sendingInvite}
      />

      <ConfirmActionModal
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={handleConfirmRemoveMember}
        title="Remove team member"
        description={
          selectedMember
            ? `Are you sure you want to remove ${selectedMember.name} from your team?`
            : "Are you sure you want to remove this team member?"
        }
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="danger"
        loading={removeLoading}
      />
    </section>
  );
}