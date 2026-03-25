"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  SquareUserRound,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  method: "PATCH",
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
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    participant: Participant;
    nextApproved: boolean;
  } | null>(null);

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
    };
  }, [participants]);

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

      setActionTarget(null);
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

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Participant Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Manage registrations, approvals, and participant activity.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Review participant records, monitor approval status, track team
              association, and take action on individual accounts from one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "..." : filteredParticipants.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Participants currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Admin Actions</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Approve / Revert
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Manage approval state and participation readiness.
              </p>
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
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Clock3 className="h-5 w-5" />
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
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Participant Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage accounts
            </h2>
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
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing{" "}
          <span className="font-bold text-[#3B3C3E]">
            {loading ? "..." : filteredParticipants.length}
          </span>{" "}
          participant records
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
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
                  className="grid grid-cols-[1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4"
                >
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
                  className="grid grid-cols-[1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
                >
                  <div className="font-semibold">{participant.name}</div>
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
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
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
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
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

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      College
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {participant.college || "Not added"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Team
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {participant.team}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Joined
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {formatJoinedDate(participant.joinedAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3">
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
          <div className="w-full max-w-2xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-[#3B3C3E]">
                  Participant Details
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
    </section>
  );
}