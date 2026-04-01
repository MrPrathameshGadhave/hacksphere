"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Copy,
  Crown,
  LayoutGrid,
  Lightbulb,
  Mail,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Target,
  TrendingUp,
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

function formatMemberUnit(count: number) {
  return count === 1 ? "member" : "members";
}

function getTeamCapacityMessage(currentSize: number, maxSize: number) {
  const minimumSize = 2;
  const openSeats = Math.max(0, maxSize - currentSize);
  const membersNeededToReachMinimum = Math.max(0, minimumSize - currentSize);

  if (membersNeededToReachMinimum > 0) {
    return `Invite ${membersNeededToReachMinimum} more ${formatMemberUnit(
      membersNeededToReachMinimum
    )} to reach the minimum team size of ${minimumSize}.`;
  }

  if (openSeats === 0) {
    return "Your team is at full capacity.";
  }

  return `${openSeats} open ${openSeats === 1 ? "seat" : "seats"} remaining before the team is full.`;
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
  currentMemberCount,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TeamFormValues) => Promise<void>;
  loading: boolean;
  mode: "create" | "edit";
  initialValues: TeamFormValues;
  currentMemberCount: number;
}) {
  const [form, setForm] = useState<TeamFormValues>(initialValues);
  const [error, setError] = useState("");
  const minimumAllowedSize = Math.max(2, currentMemberCount);
  const seatsRemaining = Math.max(0, form.maxSize - currentMemberCount);

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

    if (form.maxSize < minimumAllowedSize) {
      setError(
        `Team size cannot be less than current member count (${currentMemberCount})`
      );
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(34,24,31,0.42)] px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-[#ead9df] bg-[linear-gradient(180deg,#fffdfb_0%,#ffffff_100%)] shadow-[0_30px_80px_rgba(34,24,31,0.2)]">
        <div className="border-b border-[#efe4e8] bg-[linear-gradient(135deg,#fff8f7_0%,#fff3f5_100%)] px-6 py-5">
          <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#8f4250]">
              {mode === "create" ? "Create Team" : "Edit Team"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
              {mode === "create"
                ? "Set up your hackathon team"
                : "Update your team details"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#625a60]">
              Define the team identity, lock the right size, and keep your
              collaboration workspace structured from day one.
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2d8dd] bg-white text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#261b1f]">
                Team Name
              </label>
              <input
                type="text"
                value={form.teamName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, teamName: event.target.value }))
                }
                placeholder="Enter your team name"
                className="h-12 w-full rounded-2xl border border-[#e6dde1] bg-[#fcf8f9] px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#261b1f]">
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
                className="w-full rounded-2xl border border-[#e6dde1] bg-[#fcf8f9] px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#261b1f]">
                Team Size Limit
              </label>
              <p className="mb-3 text-sm leading-6 text-[#625a60]">
                Choose the total team capacity. HackSphere teams can have 2 to 4
                members in total, including the team leader.
              </p>
              <select
                value={form.maxSize}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    maxSize: Number(event.target.value),
                  }))
                }
                className="h-12 w-full rounded-2xl border border-[#e6dde1] bg-[#fcf8f9] px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              >
                <option value={2} disabled={2 < minimumAllowedSize}>
                  2 Members Total (Leader + 1)
                </option>
                <option value={3} disabled={3 < minimumAllowedSize}>
                  3 Members Total (Leader + 2)
                </option>
                <option value={4} disabled={4 < minimumAllowedSize}>
                  4 Members Total (Leader + 3)
                </option>
              </select>

              <div className="mt-3 rounded-2xl border border-dashed border-[#ecd7de] bg-[#fcf4f6] px-4 py-3">
                <p className="text-sm font-semibold text-[#261b1f]">
                  Current confirmed members: {currentMemberCount}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#625a60]">
                  {mode === "edit"
                    ? `You can keep or expand the team size, but you cannot reduce it below ${currentMemberCount}.`
                    : `You are setting a capacity of ${form.maxSize} total members, leaving ${seatsRemaining} open ${seatsRemaining === 1 ? "seat" : "seats"} after the leader is included.`}
                </p>
                {mode === "edit" ? (
                  <p className="mt-1 text-sm leading-6 text-[#625a60]">
                    {getTeamCapacityMessage(currentMemberCount, form.maxSize)}
                  </p>
                ) : null}
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#efe4e8] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-[#e2d8dd] bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(160,28,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#8d1930] disabled:opacity-60"
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

function MyTeamContent() {
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
  const effectiveMaxSize = team?.maxSize || 4;
  const minimumMembersNeeded = Math.max(0, 2 - currentSize);
  const openSeats = Math.max(0, effectiveMaxSize - currentSize);
  const teamCapacityMessage = getTeamCapacityMessage(currentSize, effectiveMaxSize);
  const readinessLabel = !team
    ? "Setup Needed"
    : minimumMembersNeeded > 0
    ? "Recruiting Stage"
    : hasUnapprovedParticipants
    ? "Awaiting Verification"
    : !team.problemStatement
    ? "Problem Selection Pending"
    : "Submission Ready";
  const readinessPercent = !team
    ? user?.isApproved === false
      ? 18
      : 28
    : minimumMembersNeeded > 0
    ? 42
    : hasUnapprovedParticipants
    ? 58
    : !team.problemStatement
    ? 78
    : 94;
  const memberFillPercentage = Math.max(
    18,
    Math.min(100, (currentSize / effectiveMaxSize) * 100)
  );
  const nextStepTitle = !team
    ? "Create or join a team"
    : minimumMembersNeeded > 0
    ? "Reach the minimum team size"
    : hasUnapprovedParticipants
    ? "Wait for approval clearance"
    : !team.problemStatement
    ? "Choose your problem statement"
    : "Move into final submission";
  const nextStepDescription = !team
    ? "Open your workspace by creating a team or joining an invite from an existing leader."
    : minimumMembersNeeded > 0
    ? `Invite ${minimumMembersNeeded} more ${formatMemberUnit(
        minimumMembersNeeded
      )} so your team meets the minimum valid size of 2 members.`
    : hasUnapprovedParticipants
    ? "All current members need admin approval before the team can complete the next competition steps."
    : !team.problemStatement
    ? "Your team foundation is ready. Pick a challenge to align everyone around one build track."
    : "Your team structure and challenge are in place. Focus next on polishing your project submission.";
  const workflowSteps = [
    {
      title: "Team workspace opened",
      detail: team
        ? `Your team area is active as ${team.teamName}.`
        : "Create a team or join one with an invite code.",
      complete: Boolean(team),
    },
    {
      title: "Valid team size reached",
      detail:
        currentSize >= 2
          ? `${currentSize} members are currently part of the team.`
          : "HackSphere requires at least 2 total members including the leader.",
      complete: currentSize >= 2,
    },
    {
      title: "Members approved",
      detail: hasUnapprovedParticipants
        ? "Some team participants are still awaiting admin verification."
        : "All current participants are cleared and ready to compete.",
      complete: !hasUnapprovedParticipants,
    },
    {
      title: "Problem statement selected",
      detail: team?.problemStatement?.title
        ? `Locked to: ${team.problemStatement.title}`
        : "Choose a challenge to move the team into execution mode.",
      complete: Boolean(team?.problemStatement),
    },
  ];

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
    <section className="space-y-8 pb-4">
      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-[linear-gradient(135deg,#fff7f7_0%,#fff0f0_100%)] px-5 py-4 text-sm text-red-700 shadow-[0_12px_30px_rgba(239,68,68,0.08)]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,#f6fffa_0%,#effcf5_100%)] px-5 py-4 text-sm text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.08)]">
          {success}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[34px] border border-[#ead9df] bg-[linear-gradient(135deg,#fffdf8_0%,#fff4f0_38%,#f6f9fd_100%)] p-6 shadow-[0_28px_80px_rgba(100,48,63,0.12)] sm:p-8 lg:p-10">
        <div className="absolute inset-y-0 right-[-12%] w-[24rem] rounded-full bg-[#f8d8df]/60 blur-3xl" />
        <div className="absolute left-[-6%] top-[-18%] h-48 w-48 rounded-full bg-[#fff6cf]/70 blur-3xl" />
        <div className="relative">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[0px] font-semibold uppercase tracking-[0.24em] text-[#8f4250]">
              <span className="rounded-full border border-[#e7ced5] bg-white/80 px-3 py-1.5 text-[11px] shadow-sm">
                Team Workspace
              </span>
              <span className="rounded-full border border-[#e7ced5] bg-white/80 px-3 py-1.5 text-[11px] shadow-sm">
                Collaboration Control
              </span>
              <span className="rounded-full border border-[#ecdcb3] bg-[#fff8d8] px-3 py-1.5 text-[11px] text-[#8a6822] shadow-sm">
                HackSphere Build Track
              </span>
              Team Workspace • Powered by HackSphere
            </div>

            {loading ? (
              <div className="mt-5">
                <SkeletonBlock className="h-10 w-80 bg-[#ead9df]" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-[#efe6e9]" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-[#efe6e9]" />
                <div className="mt-7 flex gap-3">
                  <SkeletonBlock className="h-12 w-36 bg-[#ead9df]" />
                  <SkeletonBlock className="h-12 w-36 bg-[#efe6e9]" />
                </div>
              </div>
            ) : (
              <>
                <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-[#261b1f] sm:text-4xl lg:text-[2.9rem]">
                  Build a team that looks organized, trusted, and ready to ship.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5960] sm:text-base">
                  This is your collaboration command center for creating the team,
                  filling open seats, clearing approvals, and moving everyone toward
                  a single challenge and submission plan.
                </p>
              </>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setTeamFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5 hover:bg-[#8d1930]"
              >
                {team ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {primaryActionLabel}
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                  Formation
                </p>
                <p className="mt-2 text-lg font-semibold text-[#241a1f]">
                  {team ? teamStatusLabel : "Solo Setup"}
                </p>
                <p className="mt-1 text-sm text-[#625a60]">
                  {team
                    ? `${currentSize} of ${effectiveMaxSize} seats currently mapped.`
                    : "No active team yet. Start by opening a workspace."}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                  Approval
                </p>
                <p className="mt-2 text-lg font-semibold text-[#241a1f]">
                  {hasUnapprovedParticipants ? "In Review" : "Cleared"}
                </p>
                <p className="mt-1 text-sm text-[#625a60]">
                  {hasUnapprovedParticipants
                    ? "Some team members still need admin approval."
                    : "Current participants are ready for the next stage."}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                  Leadership
                </p>
                <p className="mt-2 text-lg font-semibold text-[#241a1f]">
                  {isLeader ? "Leader Access" : "Member Access"}
                </p>
                <p className="mt-1 text-sm text-[#625a60]">
                  {isLeader
                    ? "You control invites, edits, and member changes."
                    : "The team leader manages structural actions for the team."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loading && !team ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[30px] border border-[#efe2e6] bg-[linear-gradient(135deg,#fffdfb_0%,#fff6f7_100%)] p-6 shadow-[0_20px_50px_rgba(78,40,53,0.08)] sm:p-7">
            <div className="absolute right-[-10%] top-[-14%] h-36 w-36 rounded-full bg-[#f8dde3] blur-3xl" />
            <div className="relative">
              <p className="text-sm font-medium text-[#8f4250]">Create New Team</p>
              <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
                Launch your own build squad
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#645c62]">
                Become the leader, define the team identity, and control invites,
                member management, and the final submission workflow from one
                place.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                    Leadership
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3d3136]">
                    Team leaders control invites, member removal, and the final
                    submission handoff.
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                    Capacity
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3d3136]">
                    HackSphere teams support 2 to 4 total members including the
                    leader.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTeamFormOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5 hover:bg-[#8d1930]"
              >
                <Plus className="h-4 w-4" />
                Create Team
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-[#e5e8ee] bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_100%)] p-6 shadow-[0_20px_50px_rgba(52,79,119,0.08)] sm:p-7">
            <div className="absolute bottom-[-22%] right-[-8%] h-40 w-40 rounded-full bg-[#dceeff] blur-3xl" />
            <div className="relative">
              <p className="text-sm font-medium text-[#8f4250]">Join Existing Team</p>
              <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
                Enter with an invite code
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#645c62]">
                Ask your leader for the invite code, paste it here, and step
                directly into the existing workspace.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="h-12 flex-1 rounded-2xl border border-[#dbe3ee] bg-white px-4 text-sm text-[#3B3C3E] shadow-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                />

                <button
                  onClick={() => handleJoinTeam()}
                  disabled={joinLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5 hover:bg-[#8d1930] disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {joinLoading ? "Joining..." : "Join Team"}
                </button>
              </div>

              <div className="mt-5 rounded-[22px] border border-[#dbe3ee] bg-white/80 px-4 py-4">
                <p className="text-sm font-semibold text-[#243342]">
                  Invite code best practice
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5f6670]">
                  Join using the exact uppercase code shared by the team leader.
                  Once you are in, admin approval may still be required before
                  some team actions unlock.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#8f4250]">Team Overview</p>
              <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
                Your collaboration profile
              </h2>
            </div>

            <button
              onClick={() => setTeamFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(160,28,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#8d1930]"
            >
              {team ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {primaryActionLabel}
            </button>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="relative overflow-hidden rounded-[28px] border border-[#efe4e8] bg-[linear-gradient(135deg,#fffdfb_0%,#fff6f7_100%)] p-6">
              <div className="absolute right-[-12%] top-[-12%] h-36 w-36 rounded-full bg-[#f8dde3] blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4250]">
                  <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1">
                    {loading ? "..." : teamStatusLabel}
                  </span>
                  <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1">
                    {isLeader ? "Leader-Controlled" : "Member View"}
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-[#6d5960]">Team Identity</p>
                <h3 className="mt-2 text-3xl font-bold text-[#261b1f]">
                  {loading ? "Loading..." : team?.teamName || "No Team Created Yet"}
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#625a60]">
                  {loading
                    ? "Loading team details..."
                    : team?.teamDescription?.trim()
                    ? team.teamDescription
                    : "Create a team identity that teammates can rally around before you move into challenge selection and submission."}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/80 bg-white/88 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                      Team status
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#261b1f]">
                      {loading ? "Loading..." : readinessLabel}
                    </p>
                    <p className="mt-1 text-sm text-[#645c62]">
                      {loading ? "Checking readiness..." : nextStepTitle}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/80 bg-white/88 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                      Seat plan
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#261b1f]">
                      {loading ? "..." : `${currentSize} / ${effectiveMaxSize}`}
                    </p>
                    <p className="mt-1 text-sm text-[#645c62]">
                      {loading
                        ? "Checking capacity..."
                        : minimumMembersNeeded > 0
                        ? `${minimumMembersNeeded} more ${formatMemberUnit(
                            minimumMembersNeeded
                          )} needed to meet the minimum.`
                        : openSeats > 0
                        ? `${openSeats} open ${openSeats === 1 ? "seat" : "seats"} remain.`
                        : "All seats are currently filled."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[26px] border border-[#ece7ea] bg-[#fcf8f9] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#8f4250]">Current size</p>
                    <h3 className="mt-2 text-2xl font-bold text-[#261b1f]">
                      {loading ? "..." : `${currentSize} / ${team?.maxSize || 4}`}
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#A01C33] shadow-sm">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eedfe4]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#A01C33_0%,#c76a5f_100%)] transition-all duration-500"
                    style={{ width: `${memberFillPercentage}%` }}
                  />
                </div>

                <p className="mt-3 text-sm leading-6 text-[#625a60]">
                  {loading ? "Loading member count..." : teamCapacityMessage}
                </p>
              </div>

              <div className="rounded-[26px] border border-[#e5e8ee] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#8f4250]">Authority</p>
                    <h3 className="mt-2 text-2xl font-bold text-[#261b1f]">
                      {isLeader ? "Leader View" : "Member View"}
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#365a85] shadow-sm">
                    {isLeader ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      <ShieldCheck className="h-5 w-5" />
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#625a60]">
                  {isLeader
                    ? "You control team edits, invite code rotation, member invitations, and removal actions."
                    : "You can view the workspace and collaborate, while the team leader manages structural changes."}
                </p>
              </div>
            </div>
          </div>

          {team && isLeader ? (
            <div className="mt-5 rounded-[28px] border border-[#ecd7de] bg-[linear-gradient(135deg,#fffaf9_0%,#fff4f6_100%)] p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8f4250]">Team Invite Code</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#261b1f]">
                    Bring teammates in with one secure code
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#625a60]">
                    Share this code privately with teammates so they can join
                    your workspace instantly.
                  </p>
                  <code className="mt-3 inline-block rounded-2xl border border-white/80 bg-white px-4 py-3 text-sm font-bold tracking-[0.24em] text-[#A01C33] shadow-sm">
                    {team.inviteCode || "No Code Yet"}
                  </code>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyInviteCode}
                    disabled={!team.inviteCode}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#e2d8dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#352b30] transition hover:-translate-y-0.5 hover:border-[#d6b8c0] hover:text-[#A01C33] disabled:opacity-60"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </button>

                  <button
                    onClick={handleGenerateInviteCode}
                    disabled={inviteLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(160,28,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#8d1930] disabled:opacity-60"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {inviteLoading ? "Generating..." : "Regenerate"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-[28px] border border-[#e6e7ea] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7eef1] text-[#A01C33]">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#8f4250]">
                  Team management note
                </p>
                <h3 className="mt-2 text-lg font-bold text-[#261b1f]">
                  Keep the team valid and coordinated
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#625a60]">
                  HackSphere teams must stay between 2 and 4 total members,
                  and only the leader can manage structural actions like invite
                  code rotation, member removal, and team updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#8f4250]">Team Members</p>
              <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
                Manage your squad
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#ecd7de] bg-[#fcf4f6] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4250]">
                {loading ? "..." : `${currentSize}/${effectiveMaxSize} occupied`}
              </span>
              <button
                disabled={!team || !isLeader || currentSize >= (team?.maxSize || 4)}
                onClick={() => setInviteMemberModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#e2d8dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#352b30] transition hover:-translate-y-0.5 hover:border-[#d6b8c0] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[#efe4e8] bg-[linear-gradient(135deg,#fffdfb_0%,#fff6f7_100%)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8f4250]">Capacity map</p>
                <h3 className="mt-2 text-xl font-bold text-[#261b1f]">
                  {loading
                    ? "Loading..."
                    : `${currentSize} of ${effectiveMaxSize} seats filled`}
                </h3>
              </div>
              <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4250]">
                {loading ? "..." : teamStatusLabel}
              </span>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eedfe4]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#A01C33_0%,#c76a5f_100%)] transition-all duration-500"
                style={{ width: `${memberFillPercentage}%` }}
              />
            </div>

            <p className="mt-3 text-sm leading-7 text-[#625a60]">
              {loading ? "Checking team capacity..." : teamCapacityMessage}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[26px] border border-[#ece7ea] bg-[#fcfcfd] p-5"
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
                    className={`group rounded-[26px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(45,32,39,0.08)] ${
                      member.isEmpty
                        ? "border-dashed border-[#d9dde5] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)]"
                        : "border-[#ece7ea] bg-[linear-gradient(135deg,#ffffff_0%,#fff9fb_100%)]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                          member.isEmpty
                            ? "bg-[#eef2f7] text-[#66707d]"
                            : "bg-[linear-gradient(135deg,#A01C33_0%,#c16258_100%)] text-white shadow-[0_14px_24px_rgba(160,28,51,0.18)]"
                        }`}
                      >
                        {member.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-bold text-[#261b1f]">
                            {member.name}
                          </h3>

                          {member.isLeader && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f7eef1] px-2.5 py-1 text-xs font-semibold text-[#A01C33]">
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

                        <p className="mt-1 text-sm font-medium text-[#6d5960]">
                          {member.role}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-sm text-[#625a60]">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {member.isEmpty ? (
                            <button
                              disabled={!team || !isLeader}
                              onClick={() => setInviteMemberModalOpen(true)}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#A01C33] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.16)] transition hover:-translate-y-0.5 hover:bg-[#8d1930] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Invite
                            </button>
                          ) : (
                            <>
                              <a
                                href={`mailto:${member.email}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#e2d8dd] bg-white px-3 py-2 text-xs font-semibold text-[#352b30] transition hover:-translate-y-0.5 hover:border-[#d6b8c0] hover:text-[#A01C33]"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Contact
                              </a>

                              {!member.isLeader && isLeader && member.rawUser ? (
                                <button
                                  onClick={() => handleAskRemoveMember(member.rawUser!)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50"
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

          {!loading && team ? (
            <div className="mt-5 rounded-[28px] border border-dashed border-[#ecd7de] bg-[#fcf4f6] p-5">
              <p className="text-sm font-medium text-[#8f4250]">Capacity guidance</p>
              <p className="mt-2 text-sm leading-7 text-[#3d3136]">
                {minimumMembersNeeded > 0
                  ? `Your team currently has ${currentSize} of the required minimum 2 members. Invite ${minimumMembersNeeded} more ${formatMemberUnit(
                      minimumMembersNeeded
                    )} to make the team valid for HackSphere.`
                  : openSeats > 0
                  ? `Your team has ${currentSize} of ${effectiveMaxSize} seats filled. You can still invite ${openSeats} more ${formatMemberUnit(
                      openSeats
                    )}.`
                  : `Your team is full with ${currentSize} of ${effectiveMaxSize} members.`}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <TeamFormModal
        open={teamFormOpen}
        onClose={() => setTeamFormOpen(false)}
        onSubmit={handleTeamSubmit}
        loading={saving}
        mode={team ? "edit" : "create"}
        initialValues={teamFormInitialValues}
        currentMemberCount={team ? currentSize : 1}
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

export default function ParticipantMyTeamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6]" />}>
      <MyTeamContent />
    </Suspense>
  );
}
