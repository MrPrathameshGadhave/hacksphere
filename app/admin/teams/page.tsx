"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  Filter,
  Layers3,
  Lightbulb,
  Mail,
  Search,
  ShieldCheck,
  Users,
  UserRoundPlus,
  X,
  XCircle,
} from "lucide-react";

type TeamStatus = "Active" | "Incomplete" | "Blocked";
type ProblemSelectionStatus = "Selected" | "Not Selected";
type BackendTeamStatus = "active" | "pending" | "disqualified";

type AdminTeamMember = {
  id: string;
  name: string;
  email: string;
  college?: string;
  avatar?: string;
  isApproved: boolean;
  role: string;
};

type AdminTeamProblem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  status: string;
  isActive: boolean;
};

type AdminTeamApiItem = {
  id: string;
  teamName: string;
  teamDescription?: string;
  leader: AdminTeamMember | null;
  leaderName?: string;
  leaderEmail?: string;
  members: AdminTeamMember[];
  allMembers?: AdminTeamMember[];
  membersCount?: number;
  memberCount?: number;
  nonLeaderMembersCount?: number;
  maxSize?: number;
  availableSlots?: number;
  isFull?: boolean;
  approvedMembersCount?: number;
  pendingMembersCount?: number;
  problemStatement?: AdminTeamProblem | null;
  problemTitle?: string;
  status: TeamStatus;
  dbStatus: BackendTeamStatus;
  inviteCode?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Team = {
  id: string;
  teamName: string;
  leader: string;
  leaderEmail?: string;
  memberCount: number;
  members: string[];
  selectedProblem: string;
  problemStatus: ProblemSelectionStatus;
  status: TeamStatus;
  backendStatus: BackendTeamStatus;
  createdAt: string;
  updatedAt: string;
};

type TeamsResponse = {
  success: boolean;
  teams: AdminTeamApiItem[];
  message?: string;
};

const teamStatusStyles: Record<TeamStatus, string> = {
  Active:
    "border border-green-200 bg-green-50 text-green-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  Incomplete:
    "border border-amber-200 bg-amber-50 text-amber-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  Blocked:
    "border border-red-200 bg-red-50 text-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
};

const problemStatusStyles: Record<ProblemSelectionStatus, string> = {
  Selected:
    "border border-[#A01C33]/15 bg-[#A01C33]/8 text-[#A01C33] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  "Not Selected":
    "border border-gray-200 bg-gray-50 text-gray-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function mapUiStatusToBackend(status: TeamStatus): BackendTeamStatus {
  if (status === "Active") return "active";
  if (status === "Incomplete") return "pending";
  return "disqualified";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${className}`}
    />
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeApiTeam(team: AdminTeamApiItem): Team {
  const allMembers =
    team.allMembers && team.allMembers.length > 0
      ? team.allMembers
      : [
          ...(team.leader ? [team.leader] : []),
          ...(Array.isArray(team.members) ? team.members : []),
        ];

  const uniqueMembers = Array.from(
    new Map(allMembers.map((member) => [member.id, member])).values()
  );

  return {
    id: team.id,
    teamName: team.teamName || "",
    leader: team.leader?.name || team.leaderName || "Unknown",
    leaderEmail: team.leader?.email || team.leaderEmail || "",
    memberCount: team.membersCount ?? team.memberCount ?? uniqueMembers.length ?? 0,
    members: uniqueMembers.map((member) => member.name).filter(Boolean),
    selectedProblem: team.problemTitle || team.problemStatement?.title || "Not selected",
    problemStatus: team.problemStatement ? "Selected" : "Not Selected",
    status: team.status,
    backendStatus: team.dbStatus,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

export default function AdminTeamsPage() {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/teams", {
        method: "GET",
        cache: "no-store",
      });

      const data: TeamsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch teams");
      }

      const normalizedTeams = (data.teams || []).map(normalizeApiTeam);
      setAllTeams(normalizedTeams);

      setSelectedTeam((current) => {
        if (!current) return null;
        return normalizedTeams.find((team) => team.id === current.id) || null;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch teams";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    return allTeams.filter((team) => {
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        team.teamName.toLowerCase().includes(term) ||
        team.leader.toLowerCase().includes(term) ||
        team.leaderEmail?.toLowerCase().includes(term) ||
        team.selectedProblem.toLowerCase().includes(term) ||
        team.members.some((member) => member.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" ? true : team.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allTeams, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: allTeams.length,
      active: allTeams.filter((team) => team.status === "Active").length,
      incomplete: allTeams.filter((team) => team.status === "Incomplete").length,
      blocked: allTeams.filter((team) => team.status === "Blocked").length,
    };
  }, [allTeams]);

  const handleStatusUpdate = async (team: Team, nextStatus: TeamStatus) => {
    try {
      setActionLoadingId(team.id);
      setError("");

      const response = await fetch(`/api/admin/teams/${team.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: mapUiStatusToBackend(nextStatus),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update team status");
      }

      setSelectedTeam((current) =>
        current && current.id === team.id
          ? {
              ...current,
              status: nextStatus,
              backendStatus: mapUiStatusToBackend(nextStatus),
            }
          : current
      );

      await fetchTeams();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update team";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderMemberPreview = (members: string[]) => {
    const visibleMembers = members.slice(0, 3);
    const extraMembers = Math.max(members.length - 3, 0);

    return (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {visibleMembers.map((member, index) => (
            <div
              key={`${member}-${index}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#A01C33]/10 text-[11px] font-semibold text-[#A01C33]"
              title={member}
            >
              {getInitials(member)}
            </div>
          ))}

          {extraMembers > 0 ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[11px] font-semibold text-gray-600">
              +{extraMembers}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#3B3C3E]">{members.length}</p>
          <p className="text-xs text-gray-500">registered members</p>
        </div>
      </div>
    );
  };

  const renderActionButtons = (team: Team, mobile = false) => {
    const basePrimary =
      "inline-flex items-center gap-2 rounded-full border border-[#A01C33]/15 bg-[#A01C33]/6 text-[#A01C33] transition hover:bg-[#A01C33]/10";
    const baseSuccess =
      "inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 text-green-700 transition hover:bg-green-100";
    const baseWarning =
      "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100";
    const baseDanger =
      "inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100";

    const sizeClass = mobile
      ? "px-3.5 py-2 text-sm font-medium"
      : "px-3 py-1.5 text-xs font-medium";

    return (
      <div className={`${mobile ? "flex flex-wrap gap-2" : "flex flex-wrap gap-1.5"}`}>
        <button
          type="button"
          onClick={() => setSelectedTeam(team)}
          className={`${basePrimary} ${sizeClass}`}
        >
          <Eye className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          View
        </button>

        {team.status !== "Active" ? (
          <button
            type="button"
            onClick={() => handleStatusUpdate(team, "Active")}
            className={`${baseSuccess} ${sizeClass}`}
          >
            <CheckCircle2 className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            Active
          </button>
        ) : null}

        {team.status !== "Incomplete" ? (
          <button
            type="button"
            onClick={() => handleStatusUpdate(team, "Incomplete")}
            className={`${baseWarning} ${sizeClass}`}
          >
            <Lightbulb className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            Incomplete
          </button>
        ) : null}

        {team.status !== "Blocked" ? (
          <button
            type="button"
            onClick={() => handleStatusUpdate(team, "Blocked")}
            className={`${baseDanger} ${sizeClass}`}
          >
            <ShieldCheck className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            Block
          </button>
        ) : null}

        {actionLoadingId === team.id ? (
          <span
            className={`inline-flex items-center rounded-full border border-[#A01C33]/10 bg-[#A01C33]/5 ${
              mobile ? "px-3.5 py-2 text-sm" : "px-3 py-1.5 text-xs"
            } font-medium text-[#A01C33]`}
          >
            Updating...
          </span>
        ) : null}
      </div>
    );
  };

  const renderDesktopRows = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`desktop-skeleton-${index}`}
          className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="grid grid-cols-[1.5fr_1.15fr_0.9fr_1.35fr_0.9fr_1.25fr] gap-5">
            {Array.from({ length: 6 }).map((__, innerIndex) => (
              <SkeletonBlock
                key={`desktop-skeleton-cell-${index}-${innerIndex}`}
                className="h-16"
              />
            ))}
          </div>
        </div>
      ));
    }

    if (filteredTeams.length === 0) {
      return (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] px-5 py-14 text-center">
          <p className="text-lg font-semibold text-[#3B3C3E]">
            No team records found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting the search or status filter.
          </p>
        </div>
      );
    }

    return filteredTeams.map((team) => (
      <div
        key={team.id}
        className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
      >
        <div className="grid grid-cols-[1.5fr_1.15fr_0.9fr_1.35fr_0.9fr_1.25fr] gap-5">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Users className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#3B3C3E]">
                  {team.teamName}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(team.createdAt)}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${problemStatusStyles[team.problemStatus]}`}
                  >
                    {team.problemStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#3B3C3E]">{team.leader}</p>
            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{team.leaderEmail || "No email"}</span>
            </div>
          </div>

          <div>{renderMemberPreview(team.members)}</div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Problem
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-[#3B3C3E]">
                {team.selectedProblem}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {team.problemStatus === "Selected"
                  ? "Problem linked to this team"
                  : "No problem chosen yet"}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${teamStatusStyles[team.status]}`}
            >
              {team.status}
            </span>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Quick actions
              </p>
              {renderActionButtons(team)}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderMobileCards = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`mobile-skeleton-${index}`}
          className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
        >
          <SkeletonBlock className="h-6 w-1/2" />
          <SkeletonBlock className="mt-3 h-4 w-1/3" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
        </div>
      ));
    }

    if (filteredTeams.length === 0) {
      return (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-8 text-center">
          <p className="text-lg font-semibold text-[#3B3C3E]">
            No team records found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Adjust filters and try again.
          </p>
        </div>
      );
    }

    return filteredTeams.map((team) => (
      <div
        key={team.id}
        className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#3B3C3E]">
              {team.teamName}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(team.createdAt)}
              </span>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${problemStatusStyles[team.problemStatus]}`}
              >
                {team.problemStatus}
              </span>
            </div>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${teamStatusStyles[team.status]}`}
          >
            {team.status}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Leader
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">{team.leader}</p>
            <p className="mt-1 text-xs text-gray-500">{team.leaderEmail || "No email"}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Members
            </p>
            <div className="mt-3">{renderMemberPreview(team.members)}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Problem
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
              {team.selectedProblem}
            </p>
          </div>
        </div>

        <div className="mt-5">{renderActionButtons(team, true)}</div>
      </div>
    ));
  };

  return (
    <>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#A01C33] via-[#8e182e] to-[#751123] p-8 text-white shadow-[0_22px_60px_rgba(160,28,51,0.28)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                Team Management • Admin Control
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                Manage team formation, readiness, and submission alignment.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                Review real team data, monitor member completeness, and control
                team eligibility with a cleaner admin workflow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">Filtered Result</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {loading ? "..." : filteredTeams.length}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Teams visible after applying your current filters.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">Admin Scope</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Teams + Status</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Clean overview of participants, problems, and team health.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Teams</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.total}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Teams</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.active}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Incomplete</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.incomplete}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <UserRoundPlus className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Blocked</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.blocked}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Team Records</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Search and manage teams
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[250px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team, leader, member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 min-w-[180px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Incomplete">Incomplete</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3 text-sm font-medium text-gray-600">
            Showing{" "}
            <span className="font-bold text-[#3B3C3E]">
              {loading ? "..." : filteredTeams.length}
            </span>{" "}
            team records
          </div>

          <div className="mt-6 hidden xl:block">
            <div className="grid grid-cols-[1.5fr_1.15fr_0.9fr_1.35fr_0.9fr_1.25fr] gap-5 px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              <div>Team</div>
              <div>Leader</div>
              <div>Members</div>
              <div>Problem</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">{renderDesktopRows()}</div>
          </div>

          <div className="mt-6 grid gap-4 xl:hidden">{renderMobileCards()}</div>
        </div>
      </section>

      {selectedTeam ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-3xl rounded-[30px] border border-white/50 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#A01C33]">Team details</p>
                  <h3 className="mt-1 truncate text-2xl font-bold text-[#3B3C3E]">
                    {selectedTeam.teamName}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${teamStatusStyles[selectedTeam.status]}`}
                    >
                      {selectedTeam.status}
                    </span>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${problemStatusStyles[selectedTeam.problemStatus]}`}
                    >
                      {selectedTeam.problemStatus}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTeam(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#A01C33]/20 hover:text-[#A01C33]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7">
              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-2 text-[#A01C33]">
                  <Users className="h-4 w-4" />
                  <p className="text-sm font-semibold">Leader</p>
                </div>
                <p className="mt-3 text-lg font-bold text-[#3B3C3E]">
                  {selectedTeam.leader}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedTeam.leaderEmail || "No email"}
                </p>
              </div>

              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-2 text-[#A01C33]">
                  <Layers3 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Problem statement</p>
                </div>
                <p className="mt-3 text-lg font-bold text-[#3B3C3E]">
                  {selectedTeam.selectedProblem}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedTeam.problemStatus === "Selected"
                    ? "A problem statement is linked."
                    : "No problem statement selected yet."}
                </p>
              </div>

              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 sm:col-span-2">
                <p className="text-sm font-semibold text-[#A01C33]">Members</p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {selectedTeam.members.map((member, index) => (
                    <span
                      key={`${selectedTeam.id}-${member}-${index}`}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-[#3B3C3E]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A01C33]/10 text-[11px] font-semibold text-[#A01C33]">
                        {getInitials(member)}
                      </span>
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-2 text-[#A01C33]">
                  <CalendarDays className="h-4 w-4" />
                  <p className="text-sm font-semibold">Created</p>
                </div>
                <p className="mt-3 text-lg font-bold text-[#3B3C3E]">
                  {formatDate(selectedTeam.createdAt)}
                </p>
              </div>

              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-2 text-[#A01C33]">
                  <Users className="h-4 w-4" />
                  <p className="text-sm font-semibold">Team size</p>
                </div>
                <p className="mt-3 text-lg font-bold text-[#3B3C3E]">
                  {selectedTeam.memberCount} members
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-5 sm:px-7">
              <p className="mb-3 text-sm font-semibold text-[#A01C33]">
                Quick actions
              </p>
              {renderActionButtons(selectedTeam, true)}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}