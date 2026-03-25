"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  Filter,
  Loader2,
  RefreshCcw,
  Scale,
  Search,
  ShieldCheck,
  Star,
  UserCog,
  UserRoundCheck,
  X,
  XCircle,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";

type JudgeStatus = "Active" | "Pending" | "Blocked";
type AssignmentStatus = "Assigned" | "Partially Assigned" | "Not Assigned";
type ReviewStatus = "Pending Review" | "In Progress" | "Reviewed";

type Judge = {
  id: string;
  name: string;
  email: string;
  institution: string;
  expertise: string;
  assignedProjects: number;
  completedReviews: number;
  pendingReviews: number;
  assignmentStatus: AssignmentStatus;
  status: JudgeStatus;
  joinedAt: string;
};

type JudgesApiResponse = {
  items: Judge[];
  stats: {
    total: number;
    active: number;
    pending: number;
    blocked: number;
    assigned: number;
    totalReviews: number;
  };
};

type AssignedSubmission = {
  assignmentId: string;
  submissionId: string;
  projectTitle: string;
  teamName: string;
  problemTitle: string;
  submissionStatus: "draft" | "submitted" | "locked";
  submittedAt: string;
  reviewStatus: ReviewStatus;
  evaluationStatus: "draft" | "submitted" | null;
  totalScore: number | null;
  canUnassign: boolean;
};

type AvailableSubmission = {
  submissionId: string;
  projectTitle: string;
  teamName: string;
  problemTitle: string;
  submissionStatus: "draft" | "submitted" | "locked";
  submittedAt: string;
  assignedJudgesCount: number;
};

type JudgeDetailResponse = {
  judge: Judge;
  summary: {
    reviewableSubmissions: number;
    assignedProjects: number;
    completedReviews: number;
    pendingReviews: number;
  };
  assignedSubmissions: AssignedSubmission[];
  availableSubmissions: AvailableSubmission[];
};

const judgeStatusStyles: Record<JudgeStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Blocked: "bg-red-100 text-red-700",
};

const assignmentStatusStyles: Record<AssignmentStatus, string> = {
  Assigned: "bg-[#A01C33]/10 text-[#A01C33]",
  "Partially Assigned": "bg-blue-100 text-blue-700",
  "Not Assigned": "bg-gray-100 text-gray-700",
};

const reviewStatusStyles: Record<ReviewStatus, string> = {
  "Pending Review": "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Reviewed: "bg-green-100 text-green-700",
};

function getSubmissionStatusBadge(status: "draft" | "submitted" | "locked") {
  if (status === "locked") return "bg-red-100 text-red-700";
  if (status === "submitted") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

function JudgeManagementModal({
  open,
  onClose,
  loading,
  saving,
  data,
  selectedSubmissionIds,
  onToggleSubmission,
  onAssignSelected,
  onUnassign,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  saving: boolean;
  data: JudgeDetailResponse | null;
  selectedSubmissionIds: string[];
  onToggleSubmission: (submissionId: string) => void;
  onAssignSelected: () => void;
  onUnassign: (submissionId: string) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  const filteredAssigned = useMemo(() => {
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return data.assignedSubmissions.filter((item) => {
      if (!normalizedQuery) return true;

      return (
        item.projectTitle.toLowerCase().includes(normalizedQuery) ||
        item.teamName.toLowerCase().includes(normalizedQuery) ||
        item.problemTitle.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [data, query]);

  const filteredAvailable = useMemo(() => {
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return data.availableSubmissions.filter((item) => {
      if (!normalizedQuery) return true;

      return (
        item.projectTitle.toLowerCase().includes(normalizedQuery) ||
        item.teamName.toLowerCase().includes(normalizedQuery) ||
        item.problemTitle.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [data, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/45 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-white/15 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 sm:px-7">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Judge Management</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              {loading ? "Loading judge..." : data?.judge.name || "Judge Details"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              View current assignments, monitor review progress, and assign more submissions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-180px)] flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          {loading ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-[24px] bg-gray-100"
                  />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="h-[420px] animate-pulse rounded-[28px] bg-gray-100" />
                <div className="h-[420px] animate-pulse rounded-[28px] bg-gray-100" />
              </div>
            </div>
          ) : !data ? (
            <div className="rounded-[24px] border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-700">
                Unable to load judge management details.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Assigned Projects</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                    {data.summary.assignedProjects}
                  </h3>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                    {data.summary.completedReviews}
                  </h3>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                    {data.summary.pendingReviews}
                  </h3>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Reviewable Pool</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                    {data.summary.reviewableSubmissions}
                  </h3>
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#A01C33]">Judge Profile</p>
                    <h3 className="mt-1 text-xl font-bold text-[#3B3C3E]">
                      {data.judge.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{data.judge.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${judgeStatusStyles[data.judge.status]}`}
                    >
                      {data.judge.status}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assignmentStatusStyles[data.judge.assignmentStatus]}`}
                    >
                      {data.judge.assignmentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8f8f9] px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Institution
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                      {data.judge.institution}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f8f9] px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Expertise
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                      {data.judge.expertise}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f8f9] px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Joined At
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                      {data.judge.joinedAt}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#A01C33]">Assignment Workspace</p>
                    <h3 className="mt-1 text-xl font-bold text-[#3B3C3E]">
                      Current and available submissions
                    </h3>
                  </div>

                  <div className="relative min-w-[260px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search team, project, problem..."
                      className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#A01C33]">
                          Assigned Submissions
                        </p>
                        <h4 className="mt-1 text-lg font-bold text-[#3B3C3E]">
                          {filteredAssigned.length} currently assigned
                        </h4>
                      </div>
                    </div>

                    <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                      {filteredAssigned.length === 0 ? (
                        <div className="rounded-[22px] border border-dashed border-gray-200 bg-white p-6 text-center">
                          <p className="text-sm text-gray-500">
                            No submissions assigned to this judge yet.
                          </p>
                        </div>
                      ) : (
                        filteredAssigned.map((item) => (
                          <div
                            key={item.assignmentId}
                            className="rounded-[22px] border border-gray-200 bg-white p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h5 className="text-base font-bold text-[#3B3C3E]">
                                  {item.projectTitle}
                                </h5>
                                <p className="mt-1 text-sm font-medium text-[#A01C33]">
                                  Team: {item.teamName}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${reviewStatusStyles[item.reviewStatus]}`}
                                >
                                  {item.reviewStatus}
                                </span>
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSubmissionStatusBadge(
                                    item.submissionStatus
                                  )}`}
                                >
                                  {item.submissionStatus}
                                </span>
                              </div>
                            </div>

                            <p className="mt-3 text-sm text-gray-500">
                              Problem: {item.problemTitle}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#f8f8f9] px-3 py-1 text-xs font-semibold text-[#3B3C3E]">
                                  Submitted: {item.submittedAt}
                                </span>
                                {item.totalScore !== null && (
                                  <span className="rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                                    Score: {item.totalScore} / 50
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => onUnassign(item.submissionId)}
                                disabled={!item.canUnassign || saving}
                                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>

                            {!item.canUnassign && (
                              <p className="mt-3 text-xs font-medium text-amber-700">
                                This assignment cannot be removed because review work already exists.
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#A01C33]">
                          Available Submissions
                        </p>
                        <h4 className="mt-1 text-lg font-bold text-[#3B3C3E]">
                          {filteredAvailable.length} ready to assign
                        </h4>
                      </div>

                      <button
                        onClick={onAssignSelected}
                        disabled={selectedSubmissionIds.length === 0 || saving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Scale className="h-4 w-4" />
                        )}
                        Assign Selected ({selectedSubmissionIds.length})
                      </button>
                    </div>

                    <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                      {filteredAvailable.length === 0 ? (
                        <div className="rounded-[22px] border border-dashed border-gray-200 bg-white p-6 text-center">
                          <p className="text-sm text-gray-500">
                            No more reviewable submissions are available for this judge.
                          </p>
                        </div>
                      ) : (
                        filteredAvailable.map((item) => {
                          const selected = selectedSubmissionIds.includes(
                            item.submissionId
                          );

                          return (
                            <button
                              key={item.submissionId}
                              type="button"
                              onClick={() => onToggleSubmission(item.submissionId)}
                              className={`w-full rounded-[22px] border p-4 text-left transition ${
                                selected
                                  ? "border-[#A01C33] bg-[#A01C33]/[0.04] shadow-sm"
                                  : "border-gray-200 bg-white hover:border-[#A01C33]/35"
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <h5 className="text-base font-bold text-[#3B3C3E]">
                                    {item.projectTitle}
                                  </h5>
                                  <p className="mt-1 text-sm font-medium text-[#A01C33]">
                                    Team: {item.teamName}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSubmissionStatusBadge(
                                      item.submissionStatus
                                    )}`}
                                  >
                                    {item.submissionStatus}
                                  </span>
                                  <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                      selected
                                        ? "border-[#A01C33] bg-[#A01C33] text-white"
                                        : "border-gray-300 bg-white text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </div>
                                </div>
                              </div>

                              <p className="mt-3 text-sm text-gray-500">
                                Problem: {item.problemTitle}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#f8f8f9] px-3 py-1 text-xs font-semibold text-[#3B3C3E]">
                                  Submitted: {item.submittedAt}
                                </span>
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                  Assigned Judges: {item.assignedJudgesCount}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminJudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    blocked: 0,
    assigned: 0,
    totalReviews: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");

  const [managementOpen, setManagementOpen] = useState(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);
  const [judgeDetail, setJudgeDetail] = useState<JudgeDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [statusUpdatingJudgeId, setStatusUpdatingJudgeId] = useState<string | null>(
    null
  );
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);

  const fetchJudges = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/judges", {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | JudgesApiResponse
        | { message?: string }
        | null;

      if (!response.ok || !data || !("items" in data)) {
        throw new Error(
          data && "message" in data ? data.message : "Failed to load judges."
        );
      }

      setJudges(Array.isArray(data.items) ? data.items : []);
      setStats(data.stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load judge records."
      );
      setJudges([]);
      setStats({
        total: 0,
        active: 0,
        pending: 0,
        blocked: 0,
        assigned: 0,
        totalReviews: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJudgeDetail = async (judgeId: string, openModal = true) => {
    try {
      setDetailLoading(true);
      setSelectedJudgeId(judgeId);
      if (openModal) {
        setManagementOpen(true);
      }

      const response = await fetch(`/api/admin/judges/${judgeId}/assignments`, {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | JudgeDetailResponse
        | { message?: string }
        | null;

      if (!response.ok || !data || !("judge" in data)) {
        throw new Error(
          data && "message" in data
            ? data.message
            : "Failed to load judge assignment details."
        );
      }

      setJudgeDetail(data);
      setSelectedSubmissionIds([]);
    } catch (err) {
      setBannerMessage("");
      setJudgeDetail(null);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load judge assignment details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchJudges();
  }, []);

  const filteredJudges = useMemo(() => {
    return judges.filter((judge) => {
      const matchesSearch =
        judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judge.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judge.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judge.expertise.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : judge.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [judges, searchTerm, statusFilter]);

  const closeManagementModal = () => {
    setManagementOpen(false);
    setSelectedJudgeId(null);
    setJudgeDetail(null);
    setSelectedSubmissionIds([]);
  };

  const handleToggleSubmission = (submissionId: string) => {
    setSelectedSubmissionIds((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleAssignSelected = async () => {
    if (!selectedJudgeId || selectedSubmissionIds.length === 0) return;

    try {
      setSavingAssignments(true);
      setError("");
      setBannerMessage("");

      const response = await fetch(
        `/api/admin/judges/${selectedJudgeId}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionIds: selectedSubmissionIds,
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to assign submissions.");
      }

      setBannerMessage(data?.message || "Submissions assigned successfully.");

      await Promise.all([
        fetchJudges(),
        fetchJudgeDetail(selectedJudgeId, false),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign submissions."
      );
    } finally {
      setSavingAssignments(false);
    }
  };

  const handleUnassign = async (submissionId: string) => {
    if (!selectedJudgeId) return;

    const confirmed = window.confirm(
      "Remove this submission from the judge assignment list?"
    );

    if (!confirmed) return;

    try {
      setSavingAssignments(true);
      setError("");
      setBannerMessage("");

      const response = await fetch(
        `/api/admin/judges/${selectedJudgeId}/assignments`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionId,
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to remove assignment.");
      }

      setBannerMessage(data?.message || "Assignment removed successfully.");

      await Promise.all([
        fetchJudges(),
        fetchJudgeDetail(selectedJudgeId, false),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove assignment."
      );
    } finally {
      setSavingAssignments(false);
    }
  };

  const handleJudgeStatusChange = async (
    judgeId: string,
    action: "activate" | "pending" | "block"
  ) => {
    const confirmText =
      action === "activate"
        ? "Activate this judge?"
        : action === "pending"
        ? "Mark this judge as pending?"
        : "Block this judge?";

    const confirmed = window.confirm(confirmText);

    if (!confirmed) return;

    try {
      setStatusUpdatingJudgeId(judgeId);
      setError("");
      setBannerMessage("");

      const response = await fetch(`/api/admin/judges/${judgeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update judge.");
      }

      setBannerMessage(data?.message || "Judge updated successfully.");

      await fetchJudges();

      if (managementOpen && selectedJudgeId === judgeId) {
        await fetchJudgeDetail(judgeId, false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update judge status."
      );
    } finally {
      setStatusUpdatingJudgeId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Judge Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Manage judge accounts, assignments, and review readiness.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Monitor judge availability, review completion, and submission assignment health across HackSphere.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {isLoading ? "—" : filteredJudges.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Judges currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Review Progress</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {isLoading ? "—" : stats.totalReviews}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Submitted reviews completed by all judges so far.
              </p>
            </div>
          </div>
        </div>
      </div>

      {(error || bannerMessage) && (
        <div
          className={`rounded-[24px] border p-5 shadow-sm ${
            error
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              error ? "text-red-700" : "text-green-700"
            }`}
          >
            {error || bannerMessage}
          </p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Judges</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {isLoading ? "—" : stats.total}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <UserCog className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned Judges</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {isLoading ? "—" : stats.assigned}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserRoundCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {isLoading ? "—" : stats.totalReviews}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {isLoading ? "—" : stats.active}
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
                {isLoading ? "—" : stats.pending}
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
              <p className="text-sm font-medium text-gray-500">Blocked</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {isLoading ? "—" : stats.blocked}
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
            <p className="text-sm font-medium text-[#A01C33]">Judge Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage judges
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search judge, email, expertise..."
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
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <button
              onClick={fetchJudges}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing{" "}
          <span className="font-bold text-[#3B3C3E]">{filteredJudges.length}</span>{" "}
          judge records
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[24px] bg-gray-100"
              />
            ))}
          </div>
        ) : filteredJudges.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-8 text-center">
            <h3 className="text-xl font-bold text-[#3B3C3E]">No judges found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try changing the search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
              <div className="grid grid-cols-[1.3fr_1.8fr_1.25fr_1fr_1fr_1.2fr_1fr_1.2fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
                <div>Name</div>
                <div>Email</div>
                <div>Expertise</div>
                <div>Assigned</div>
                <div>Reviews</div>
                <div>Assignment Status</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredJudges.map((judge) => (
                  <div
                    key={judge.id}
                    className="grid grid-cols-[1.3fr_1.8fr_1.25fr_1fr_1fr_1.2fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
                  >
                    <div className="font-semibold">{judge.name}</div>
                    <div className="truncate text-gray-500">{judge.email}</div>
                    <div>{judge.expertise}</div>
                    <div>{judge.assignedProjects}</div>
                    <div>{judge.completedReviews}</div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assignmentStatusStyles[judge.assignmentStatus]}`}
                      >
                        {judge.assignmentStatus}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${judgeStatusStyles[judge.status]}`}
                      >
                        {judge.status}
                      </span>
                    </div>

                    <ActionDropdown
                      items={[
                        {
                          label: "View Judge",
                          onClick: () => fetchJudgeDetail(judge.id),
                        },
                        {
                          label: "Manage Assignments",
                          onClick: () => fetchJudgeDetail(judge.id),
                        },
                        ...(judge.status !== "Active"
                          ? [
                              {
                                label: "Activate Judge",
                                onClick: () =>
                                  handleJudgeStatusChange(judge.id, "activate"),
                              },
                            ]
                          : []),
                        ...(judge.status !== "Pending"
                          ? [
                              {
                                label: "Mark Pending",
                                onClick: () =>
                                  handleJudgeStatusChange(judge.id, "pending"),
                              },
                            ]
                          : []),
                        ...(judge.status !== "Blocked"
                          ? [
                              {
                                label: "Block Judge",
                                variant: "danger" as const,
                                onClick: () =>
                                  handleJudgeStatusChange(judge.id, "block"),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:hidden">
              {filteredJudges.map((judge) => (
                <div
                  key={judge.id}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#3B3C3E]">
                        {judge.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">{judge.email}</p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${judgeStatusStyles[judge.status]}`}
                    >
                      {judge.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Expertise
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                        {judge.expertise}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Institution
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                        {judge.institution}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Assigned Projects
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                        {judge.assignedProjects}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Completed Reviews
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                        {judge.completedReviews}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assignmentStatusStyles[judge.assignmentStatus]}`}
                    >
                      {judge.assignmentStatus}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => fetchJudgeDetail(judge.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                    >
                      <Eye className="h-4 w-4" />
                      View Judge
                    </button>

                    <button
                      onClick={() => fetchJudgeDetail(judge.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                    >
                      <Scale className="h-4 w-4" />
                      Assign
                    </button>

                    {judge.status !== "Blocked" && (
                      <button
                        onClick={() => handleJudgeStatusChange(judge.id, "block")}
                        disabled={statusUpdatingJudgeId === judge.id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {statusUpdatingJudgeId === judge.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        Block
                      </button>
                    )}

                    {judge.status === "Blocked" && (
                      <button
                        onClick={() =>
                          handleJudgeStatusChange(judge.id, "activate")
                        }
                        disabled={statusUpdatingJudgeId === judge.id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {statusUpdatingJudgeId === judge.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <JudgeManagementModal
        open={managementOpen}
        onClose={closeManagementModal}
        loading={detailLoading}
        saving={savingAssignments}
        data={judgeDetail}
        selectedSubmissionIds={selectedSubmissionIds}
        onToggleSubmission={handleToggleSubmission}
        onAssignSelected={handleAssignSelected}
        onUnassign={handleUnassign}
      />
    </section>
  );
}