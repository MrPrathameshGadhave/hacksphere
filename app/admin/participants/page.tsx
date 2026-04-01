"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  SquareUserRound,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ActionDropdown from "@/components/ui/ActionDropdown";
import ConfirmActionModal from "@/components/modals/ConfirmActionModal";

type ParticipantStatus = "Approved" | "Pending";

type Participant = {
  id: string;
  name: string;
  email: string;
  college: string;
  team: string;
  teamId?: string | null;
  teamStatus?: "active" | "pending" | "disqualified" | null;
  isLeader?: boolean;
  status: ParticipantStatus;
  joinedAt: string;
};

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  role?: "participant" | "judge" | "admin";
};

type AuthMeResponse = {
  success: boolean;
  user: BasicUser;
  message?: string;
};

type AdminParticipantsResponse = {
  success: boolean;
  participants: Participant[];
  message?: string;
};

type UpdateParticipantResponse = {
  success: boolean;
  message?: string;
  participant: Participant;
};

type BulkApproveResponse = {
  success: boolean;
  message?: string;
  metadata: {
    requested: number;
    valid: number;
    matched: number;
    modified: number;
    acknowledgedAt: string;
    approvedBy: string;
  };
  participants: Participant[];
};

const statusStyles: Record<ParticipantStatus, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
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

function getTeamStatusLabel(status?: "active" | "pending" | "disqualified" | null) {
  if (!status) return "Not Assigned";
  if (status === "active") return "Active";
  if (status === "pending") return "Pending";
  return "Disqualified";
}

function calculatePercentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
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

export default function AdminParticipantsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    participant: Participant;
    nextApproved: boolean;
  } | null>(null);
  const [bulkActionTarget, setBulkActionTarget] = useState<string[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const [me, participantsRes] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<AdminParticipantsResponse>("/api/admin/participants"),
        ]);

        if (!isMounted) return;

        if (me.user.role !== "admin") {
          router.replace("/login");
          return;
        }

        setParticipants(participantsRes.participants || []);
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

  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const matchesSearch =
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.team.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : participant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [participants, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: participants.length,
      approved: participants.filter((p) => p.status === "Approved").length,
      pending: participants.filter((p) => p.status === "Pending").length,
      withoutTeam: participants.filter((p) => !p.teamId).length,
      teamLinked: participants.filter((p) => Boolean(p.teamId)).length,
    };
  }, [participants]);

  const filteredPendingParticipants = useMemo(
    () => filteredParticipants.filter((participant) => participant.status === "Pending"),
    [filteredParticipants]
  );

  const selectedPendingParticipantIds = useMemo(() => {
    const pendingIds = new Set(
      participants
        .filter((participant) => participant.status === "Pending")
        .map((participant) => participant.id)
    );

    return Array.from(selectedParticipants).filter((id) => pendingIds.has(id));
  }, [participants, selectedParticipants]);

  const approvalRate = useMemo(
    () => calculatePercentage(stats.approved, stats.total),
    [stats.approved, stats.total]
  );

  const selectedPendingCount = selectedPendingParticipantIds.length;
  const hasActiveFilters = searchTerm.trim().length > 0 || statusFilter !== "All";
  const visibleApprovedCount = useMemo(
    () =>
      filteredParticipants.filter((participant) => participant.status === "Approved")
        .length,
    [filteredParticipants]
  );

  const handleStatusChange = async () => {
    if (!actionTarget) return;

    try {
      setStatusUpdating(true);
      setError(null);

      const response = await sendJson<UpdateParticipantResponse>(
        `/api/admin/participants/${actionTarget.participant.id}`,
        "PATCH",
        {
          isApproved: actionTarget.nextApproved,
        }
      );

      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === response.participant.id
            ? response.participant
            : participant
        )
      );

      setSelectedParticipant((prev) =>
        prev && prev.id === response.participant.id ? response.participant : prev
      );
      setSelectedParticipants((prev) => {
        const next = new Set(prev);
        next.delete(response.participant.id);
        return next;
      });

      setActionTarget(null);
      toast.success(response.message || "Participant status updated successfully.");
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleBulkApprove = async () => {
    const participantIds = bulkActionTarget || selectedPendingParticipantIds;

    if (participantIds.length === 0) return;

    try {
      setBulkApproving(true);
      setError(null);

      const response = await sendJson<BulkApproveResponse>(
        "/api/admin/participants/bulk-approve",
        "POST",
        {
          participantIds,
        }
      );

      // Update local participants list with approved participants
      setParticipants((prev) =>
        prev.map((participant) => {
          const updated = response.participants.find(
            (p) => p.id === participant.id
          );
          return updated ? updated : participant;
        })
      );

      setSelectedParticipants((prev) => {
        const next = new Set(prev);
        participantIds.forEach((id) => next.delete(id));
        return next;
      });
      setBulkActionTarget(null);
      setError(null);
      toast.success(
        response.message ||
          `Successfully approved ${response.metadata.modified} participant(s).`
      );
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
      toast.error(message);
    } finally {
      setBulkApproving(false);
    }
  };

  const toggleParticipantSelection = (id: string) => {
    const participant = participants.find((item) => item.id === id);

    if (!participant || participant.status !== "Pending") {
      return;
    }

    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
  };

  const toggleSelectAll = () => {
    const pendingIds = filteredPendingParticipants.map((participant) => participant.id);

    if (pendingIds.length === 0) {
      return;
    }

    const allPendingSelected = pendingIds.every((id) =>
      selectedParticipants.has(id)
    );

    if (allPendingSelected) {
      setSelectedParticipants((prev) => {
        const next = new Set(prev);
        pendingIds.forEach((id) => next.delete(id));
        return next;
      });
      return;
    }

    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      pendingIds.forEach((id) => next.add(id));
      return next;
    });
  };

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[34px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfc_0%,#fff4f2_48%,#f8fafc_100%)] p-8 shadow-[0_24px_60px_rgba(74,36,48,0.08)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7de] bg-white/85 px-4 py-2 text-sm font-semibold text-[#9a6773]">
              <Sparkles className="h-4 w-4 text-[#A01C33]" />
              Participant Operations
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-[#22171c] sm:text-4xl">
              Control approvals, participation readiness, and team placement from one cleaner admin workspace.
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6f5b62] sm:text-base">
              Review participant records, clear the pending queue, monitor team attachment,
              and take bulk approval actions without digging through unnecessary admin clutter.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                Approval coverage: <span className="text-[#A01C33]">{loading ? "..." : `${approvalRate}%`}</span>
              </div>
              <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                Pending queue: <span className="text-[#A01C33]">{loading ? "..." : stats.pending}</span>
              </div>
              <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                In current view: <span className="text-[#A01C33]">{loading ? "..." : filteredParticipants.length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#eadfe3] bg-white/88 p-6 shadow-sm">
              <p className="text-sm font-medium text-[#9a6773]">Approval Progress</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="text-3xl font-black text-[#22171c]">
                  {loading ? "..." : `${approvalRate}%`}
                </h3>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <UserCheck className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                {loading
                  ? "Loading approval progress..."
                  : `${stats.approved} of ${stats.total} participant accounts are currently approved.`}
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#f3e8ec]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#a01c33_0%,#d27b8d_100%)] transition-all"
                  style={{ width: `${Math.min(approvalRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#eadfe3] bg-white/88 p-5 shadow-sm">
                <p className="text-sm font-medium text-[#9a6773]">Bulk Ready</p>
                <h3 className="mt-2 text-2xl font-bold text-[#22171c]">
                  {loading ? "..." : selectedPendingCount}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                  Pending records selected for the next bulk approval action.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#eadfe3] bg-white/88 p-5 shadow-sm">
                <p className="text-sm font-medium text-[#9a6773]">Team Linked</p>
                <h3 className="mt-2 text-2xl font-bold text-[#22171c]">
                  {loading ? "..." : stats.teamLinked}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                  Participant accounts already attached to a team record.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="mt-3 h-8 w-16" />
                </div>
                <SkeletonBlock className="h-12 w-12 rounded-2xl" />
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Participants
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                    {stats.total}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Full participant registrations available in the system.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <SquareUserRound className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                    {stats.approved}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Accounts ready to enter the participant workspace.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                    {stats.pending}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Accounts still waiting inside the approval queue.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Without Team</p>
                  <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                    {stats.withoutTeam}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Users who are not attached to any team record yet.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Participant Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search, filter, and action participant accounts
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Focus on the pending queue first, then review approvals, team linkage, and participant detail records from the same surface.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, team..."
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
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {hasActiveFilters ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
                className="h-12 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Clear Filters
              </button>
            ) : null}

            {selectedParticipants.size > 0 && (
              <button
                onClick={() => setBulkActionTarget(selectedPendingParticipantIds)}
                disabled={bulkApproving || selectedPendingParticipantIds.length === 0}
                className="h-12 rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkApproving
                  ? "Approving..."
                  : selectedPendingParticipantIds.length > 0
                  ? `Approve ${selectedPendingParticipantIds.length}`
                  : "Selected already approved"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] px-5 py-4 text-sm text-[#6f5b62]">
            Showing{" "}
            <span className="font-bold text-[#2e1f25]">
              {loading ? "..." : filteredParticipants.length}
            </span>{" "}
            participant records in the current view.{" "}
            <span className="font-semibold text-[#A01C33]">
              {loading ? "..." : visibleApprovedCount}
            </span>{" "}
            are already approved and{" "}
            <span className="font-semibold text-[#A01C33]">
              {loading ? "..." : filteredPendingParticipants.length}
            </span>{" "}
            are still pending.
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] px-5 py-4 text-sm text-gray-500">
            <span className="font-semibold text-[#3B3C3E]">
              {loading ? "..." : selectedPendingCount}
            </span>{" "}
            pending account(s) are selected for bulk approval. Pending accounts only can be added to the bulk action queue.
          </div>
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[26px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[0.4fr_1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-[linear-gradient(180deg,#fcfcfd_0%,#f7f7f8_100%)] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={
                  filteredPendingParticipants.length > 0 &&
                  filteredPendingParticipants.every((participant) =>
                    selectedParticipants.has(participant.id)
                  )
                }
                onChange={toggleSelectAll}
                disabled={filteredPendingParticipants.length === 0}
                className="h-5 w-5 rounded border-gray-300 text-[#A01C33] focus:ring-[#A01C33]"
              />
            </div>
            <div>Name</div>
            <div>Email</div>
            <div>College</div>
            <div>Team</div>
            <div>Status</div>
            <div>Joined</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[0.4fr_1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4"
                >
                  <SkeletonBlock className="h-5 w-5" />
                  <SkeletonBlock className="h-5 w-32" />
                  <SkeletonBlock className="h-5 w-40" />
                  <SkeletonBlock className="h-5 w-28" />
                  <SkeletonBlock className="h-5 w-24" />
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="h-5 w-20" />
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-9 w-16 rounded-xl" />
                    <SkeletonBlock className="h-9 w-10 rounded-xl" />
                  </div>
                </div>
              ))
            ) : filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="grid grid-cols-[0.4fr_1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.has(participant.id)}
                      onChange={() => toggleParticipantSelection(participant.id)}
                      disabled={participant.status !== "Pending"}
                      className="h-5 w-5 rounded border-gray-300 text-[#A01C33] focus:ring-[#A01C33]"
                    />
                  </div>
                  <div className="font-semibold text-[#26161d]">{participant.name}</div>
                  <div className="truncate text-gray-500">{participant.email}</div>
                  <div>{participant.college || "Not added"}</div>
                  <div>{participant.team}</div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[participant.status]}`}
                    >
                      {participant.status}
                    </span>
                  </div>
                  <div>{formatJoinedDate(participant.joinedAt)}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedParticipant(participant)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                    >
                      View
                    </button>

                    <ActionDropdown
                      items={[
                        {
                          label:
                            participant.status === "Approved"
                              ? "Mark Pending"
                              : "Approve",
                          onClick: () =>
                            setActionTarget({
                              participant,
                              nextApproved: participant.status !== "Approved",
                            }),
                        },
                        {
                          label: "View Details",
                          onClick: () => setSelectedParticipant(participant),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white px-5 py-10 text-center">
                <h3 className="text-lg font-bold text-[#3B3C3E]">
                  No participants found
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Try changing your search or filter options.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
              >
                <SkeletonBlock className="h-6 w-36" />
                <SkeletonBlock className="mt-3 h-4 w-full" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SkeletonBlock className="h-16 w-full rounded-2xl" />
                  <SkeletonBlock className="h-16 w-full rounded-2xl" />
                  <SkeletonBlock className="h-16 w-full rounded-2xl" />
                </div>
                <div className="mt-5 flex gap-2">
                  <SkeletonBlock className="h-10 w-28 rounded-2xl" />
                  <SkeletonBlock className="h-10 w-32 rounded-2xl" />
                </div>
              </div>
            ))
          ) : filteredParticipants.length > 0 ? (
            filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#3B3C3E]">
                      {participant.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span className="break-all">{participant.email}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[participant.status]}`}
                  >
                    {participant.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fcfcfd] px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Bulk approve
                  </p>
                  <input
                    type="checkbox"
                    checked={selectedParticipants.has(participant.id)}
                    onChange={() => toggleParticipantSelection(participant.id)}
                    disabled={participant.status !== "Pending"}
                    className="h-5 w-5 rounded border-gray-300 text-[#A01C33] focus:ring-[#A01C33]"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#fcfcfd] px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      College
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {participant.college || "Not added"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fcfcfd] px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Team
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {participant.team}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fcfcfd] px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Joined
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {formatJoinedDate(participant.joinedAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fcfcfd] px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Team Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {getTeamStatusLabel(participant.teamStatus)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setActionTarget({
                        participant,
                        nextApproved: participant.status !== "Approved",
                      })
                    }
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                      participant.status === "Approved"
                        ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    {participant.status === "Approved" ? "Mark Pending" : "Approve"}
                  </button>

                  <button
                    onClick={() => setSelectedParticipant(participant)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-gray-300 bg-[#fafafa] p-8 text-center">
              <h3 className="text-lg font-bold text-[#3B3C3E]">
                No participants found
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                Try changing your search or filter options.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedParticipant ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="border-b border-gray-100 bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7de] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6773]">
                    Participant Overview
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                    {selectedParticipant.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View account, team, and approval information.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedParticipant.status]}`}
                >
                  {selectedParticipant.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              {[
                { label: "Full Name", value: selectedParticipant.name },
                { label: "Email", value: selectedParticipant.email },
                { label: "College", value: selectedParticipant.college || "Not added" },
                { label: "Approval Status", value: selectedParticipant.status },
                { label: "Team", value: selectedParticipant.team },
                {
                  label: "Team Status",
                  value: getTeamStatusLabel(selectedParticipant.teamStatus),
                },
                {
                  label: "Role in Team",
                  value: selectedParticipant.teamId
                    ? selectedParticipant.isLeader
                      ? "Leader"
                      : "Member"
                    : "Not Assigned",
                },
                {
                  label: "Joined",
                  value: formatJoinedDate(selectedParticipant.joinedAt),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-6 py-5">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Close
              </button>
              <button
                onClick={() =>
                  setActionTarget({
                    participant: selectedParticipant,
                    nextApproved: selectedParticipant.status !== "Approved",
                  })
                }
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  selectedParticipant.status === "Approved"
                    ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "bg-[#A01C33] text-white hover:bg-[#89172c]"
                }`}
              >
                {selectedParticipant.status === "Approved"
                  ? "Mark Pending"
                  : "Approve Participant"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmActionModal
        open={!!actionTarget}
        onClose={() => {
          if (statusUpdating) return;
          setActionTarget(null);
        }}
        onConfirm={handleStatusChange}
        title={
          actionTarget?.nextApproved
            ? "Approve participant"
            : "Mark participant as pending"
        }
        description={
          actionTarget
            ? actionTarget.nextApproved
              ? `Are you sure you want to approve "${actionTarget.participant.name}"?`
              : `Are you sure you want to move "${actionTarget.participant.name}" back to pending approval?`
            : "Confirm this participant action."
        }
        confirmText={actionTarget?.nextApproved ? "Approve" : "Mark Pending"}
        cancelText="Cancel"
        variant={actionTarget?.nextApproved ? "success" : "warning"}
        loading={statusUpdating}
      />

      <ConfirmActionModal
        open={!!bulkActionTarget && bulkActionTarget.length > 0}
        onClose={() => {
          if (bulkApproving) return;
          setBulkActionTarget(null);
        }}
        onConfirm={handleBulkApprove}
        title="Approve selected participants"
        description={`Approve ${bulkActionTarget?.length || 0} pending participant(s) in one action?`}
        confirmText="Approve Selected"
        cancelText="Cancel"
        variant="success"
        loading={bulkApproving}
      />
    </section>
  );
}
