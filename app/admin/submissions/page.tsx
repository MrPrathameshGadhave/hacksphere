"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Eye,
  FileCode2,
  FileText,
  FolderKanban,
  Github,
  Globe,
  Loader2,
  Lock,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

type BackendSubmissionStatus = "draft" | "submitted" | "locked";
type SubmissionStatus = "Draft" | "Submitted" | "Locked";

type Submission = {
  id: string;
  teamId: string;
  teamName: string;
  teamStatus: string;
  leader: string;
  leaderEmail: string;
  memberCount: number;
  members: string[];
  selectedProblem: string;
  problemStatement?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    difficulty: string;
    status: string;
    isActive: boolean;
  } | null;
  projectTitle: string;
  description: string;
  githubLink: string;
  demoLink: string;
  pptLink: string;
  videoLink: string;
  hasGithubLink: boolean;
  hasDemoLink: boolean;
  hasPptLink: boolean;
  hasVideoLink: boolean;
  images: string[];
  imagesCount: number;
  techStack: string[];
  status: SubmissionStatus;
  dbStatus: BackendSubmissionStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reviewCoverage: {
    assignedJudgesCount: number;
    completedReviewsCount: number;
    inProgressReviewsCount: number;
    pendingReviewsCount: number;
    coverageStatus: "Not Assigned" | "Assigned" | "In Review" | "Completed";
  };
};

type SubmissionsResponse = {
  success: boolean;
  message?: string;
  submissions: Submission[];
  meta?: {
    total: number;
    draft: number;
    submitted: number;
    locked: number;
    readyForJudging: number;
    totalAssignedJudges?: number;
    totalCompletedReviews?: number;
    totalInProgressReviews?: number;
    totalPendingReviews?: number;
  };
};

type AssignmentJudge = {
  id: string;
  name: string;
  email: string;
  institution: string;
  status: "active" | "pending" | "blocked";
  assignmentStatus: "available" | "assigned" | "in-progress" | "completed";
  assignedProjects: number;
  completedReviews: number;
};

type SubmissionAssignmentsResponse = {
  success: boolean;
  message?: string;
  submissionSummary?: {
    assignedJudgesCount: number;
    completedReviewsCount: number;
    inProgressReviewsCount: number;
    pendingReviewsCount: number;
  };
  assignedJudges: AssignmentJudge[];
  availableJudges: AssignmentJudge[];
  selectedJudgeIds?: string[];
};

const submissionStatusStyles: Record<SubmissionStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-blue-100 text-blue-700",
  Locked: "bg-amber-100 text-amber-700",
};

const coverageStatusStyles: Record<
  Submission["reviewCoverage"]["coverageStatus"],
  string
> = {
  "Not Assigned": "bg-gray-100 text-gray-700",
  Assigned: "bg-[#A01C33]/10 text-[#A01C33]",
  "In Review": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

const judgeStatusStyles: Record<AssignmentJudge["status"], string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  blocked: "bg-red-100 text-red-700",
};

const assignmentStatusStyles: Record<
  AssignmentJudge["assignmentStatus"],
  string
> = {
  available: "bg-gray-100 text-gray-700",
  assigned: "bg-[#A01C33]/10 text-[#A01C33]",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

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

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "TM";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function AdminSubmissionSkeleton() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#A01C33] via-[#8e182e] to-[#751123] p-8 text-white shadow-[0_22px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="h-10 w-64 animate-pulse rounded-full bg-white/15" />
            <div className="h-10 w-full max-w-[520px] animate-pulse rounded-2xl bg-white/15" />
            <div className="h-20 w-full max-w-[620px] animate-pulse rounded-2xl bg-white/10" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="h-28 animate-pulse rounded-[24px] bg-white/10" />
            <div className="h-28 animate-pulse rounded-[24px] bg-white/10" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
        </div>

        <div className="mt-6 hidden lg:block">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="mt-3 h-20 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-[24px] bg-gray-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SubmissionAssignmentsModal({
  open,
  onClose,
  submission,
  loading,
  saving,
  data,
  selectedJudgeIds,
  setSelectedJudgeIds,
  onSave,
  onUnassign,
}: {
  open: boolean;
  onClose: () => void;
  submission: Submission | null;
  loading: boolean;
  saving: boolean;
  data: SubmissionAssignmentsResponse | null;
  selectedJudgeIds: string[];
  setSelectedJudgeIds: React.Dispatch<React.SetStateAction<string[]>>;
  onSave: () => Promise<void>;
  onUnassign: (judgeId: string) => Promise<void>;
}) {
  if (!open || !submission) return null;

  const toggleJudgeSelection = (judgeId: string) => {
    setSelectedJudgeIds((prev) =>
      prev.includes(judgeId)
        ? prev.filter((id) => id !== judgeId)
        : [...prev, judgeId]
    );
  };

  const summary = data?.submissionSummary || {
    assignedJudgesCount: submission.reviewCoverage.assignedJudgesCount,
    completedReviewsCount: submission.reviewCoverage.completedReviewsCount,
    inProgressReviewsCount: submission.reviewCoverage.inProgressReviewsCount,
    pendingReviewsCount: submission.reviewCoverage.pendingReviewsCount,
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 px-4 py-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#A01C33]">
              Judge Assignment Workspace
            </p>
            <h2 className="mt-1 truncate text-2xl font-bold text-[#3B3C3E]">
              {submission.projectTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Team {submission.teamName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Assigned",
                value: summary.assignedJudgesCount,
                className: "bg-[#A01C33]/10 text-[#A01C33]",
              },
              {
                label: "Completed",
                value: summary.completedReviewsCount,
                className: "bg-green-100 text-green-700",
              },
              {
                label: "In Progress",
                value: summary.inProgressReviewsCount,
                className: "bg-blue-100 text-blue-700",
              },
              {
                label: "Pending",
                value: summary.pendingReviewsCount,
                className: "bg-amber-100 text-amber-700",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <div
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${item.className}`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-7 w-44 animate-pulse rounded bg-gray-200" />
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-[22px] bg-gray-100"
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-7 w-44 animate-pulse rounded bg-gray-200" />
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-[22px] bg-gray-100"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-[#A01C33]">
                  Assigned Judges
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Current review coverage
                </h3>

                <div className="mt-5 space-y-4">
                  {data?.assignedJudges?.length ? (
                    data.assignedJudges.map((judge) => (
                      <div
                        key={judge.id}
                        className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="truncate text-lg font-bold text-[#3B3C3E]">
                              {judge.name}
                            </h4>
                            <p className="mt-1 truncate text-sm text-gray-500">
                              {judge.email}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {judge.institution}
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${judgeStatusStyles[judge.status]}`}
                          >
                            {judge.status}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assignmentStatusStyles[judge.assignmentStatus]}`}
                          >
                            {judge.assignmentStatus}
                          </span>
                          <span className="rounded-full bg-[#f8f8f9] px-3 py-1 text-xs font-semibold text-[#3B3C3E]">
                            Assigned: {judge.assignedProjects}
                          </span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Completed: {judge.completedReviews}
                          </span>
                        </div>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => onUnassign(judge.id)}
                            disabled={saving}
                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            Remove Assignment
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-gray-200 bg-[#fcfcfd] p-6 text-sm text-gray-500">
                      No judges assigned yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-[#A01C33]">
                  Available Judges
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Select judges to assign
                </h3>

                <div className="mt-5 space-y-4">
                  {data?.availableJudges?.length ? (
                    data.availableJudges.map((judge) => {
                      const selected = selectedJudgeIds.includes(judge.id);

                      return (
                        <button
                          key={judge.id}
                          type="button"
                          onClick={() => toggleJudgeSelection(judge.id)}
                          className={`w-full rounded-[22px] border p-5 text-left transition ${
                            selected
                              ? "border-[#A01C33] bg-[#A01C33]/[0.04]"
                              : "border-gray-200 bg-[#fcfcfd] hover:border-[#A01C33]/30 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="truncate text-lg font-bold text-[#3B3C3E]">
                                {judge.name}
                              </h4>
                              <p className="mt-1 truncate text-sm text-gray-500">
                                {judge.email}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {judge.institution}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${judgeStatusStyles[judge.status]}`}
                              >
                                {judge.status}
                              </span>
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[#A01C33] bg-[#A01C33] text-white"
                                    : "border-gray-300 bg-white text-transparent"
                                }`}
                              >
                                <Check className="h-4 w-4" />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assignmentStatusStyles[judge.assignmentStatus]}`}
                            >
                              {judge.assignmentStatus}
                            </span>
                            <span className="rounded-full bg-[#f8f8f9] px-3 py-1 text-xs font-semibold text-[#3B3C3E]">
                              Assigned: {judge.assignedProjects}
                            </span>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              Completed: {judge.completedReviews}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-gray-200 bg-[#fcfcfd] p-6 text-sm text-gray-500">
                      No available judges found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading || selectedJudgeIds.length === 0}
            className="rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Assign Selected Judges"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSubmissionsPage() {
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
    null
  );

  const [assignmentSubmission, setAssignmentSubmission] =
    useState<Submission | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentData, setAssignmentData] =
    useState<SubmissionAssignmentsResponse | null>(null);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    if (selectedSubmission || assignmentSubmission) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [selectedSubmission, assignmentSubmission]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/submissions", {
        method: "GET",
        cache: "no-store",
      });

      const data: SubmissionsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch submissions");
      }

      setAllSubmissions(data.submissions || []);

      setSelectedSubmission((current) => {
        if (!current) return null;
        return (
          (data.submissions || []).find((item) => item.id === current.id) || null
        );
      });

      setAssignmentSubmission((current) => {
        if (!current) return null;
        return (
          (data.submissions || []).find((item) => item.id === current.id) || null
        );
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch submissions";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionAssignments = async (submissionId: string) => {
    try {
      setAssignmentLoading(true);

      const response = await fetch(
        `/api/admin/submissions/${submissionId}/assignments`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = (await response.json().catch(() => null)) as
        | SubmissionAssignmentsResponse
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch submission assignments.");
      }

      setAssignmentData(data);
      setSelectedJudgeIds(
        data.selectedJudgeIds?.length
          ? data.selectedJudgeIds
          : (data.assignedJudges || []).map((judge) => judge.id)
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch submission assignments.";
      setError(message);
    } finally {
      setAssignmentLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, submissionFilter]);

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allSubmissions.filter((submission) => {
      const matchesSearch =
        !normalizedSearch ||
        submission.projectTitle.toLowerCase().includes(normalizedSearch) ||
        submission.teamName.toLowerCase().includes(normalizedSearch) ||
        submission.leader.toLowerCase().includes(normalizedSearch) ||
        submission.selectedProblem.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        submissionFilter === "All" ||
        submission.status === submissionFilter ||
        submission.reviewCoverage.coverageStatus === submissionFilter;

      return matchesSearch && matchesFilter;
    });
  }, [allSubmissions, searchTerm, submissionFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubmissions.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, safeCurrentPage]);

  const paginationMeta = useMemo(() => {
    if (filteredSubmissions.length === 0) {
      return {
        start: 0,
        end: 0,
        total: 0,
      };
    }

    const start = (safeCurrentPage - 1) * rowsPerPage + 1;
    const end = Math.min(
      safeCurrentPage * rowsPerPage,
      filteredSubmissions.length
    );

    return {
      start,
      end,
      total: filteredSubmissions.length,
    };
  }, [filteredSubmissions.length, safeCurrentPage]);

  const stats = useMemo(() => {
    return {
      total: allSubmissions.length,
      submitted: allSubmissions.filter((item) => item.dbStatus === "submitted")
        .length,
      locked: allSubmissions.filter((item) => item.dbStatus === "locked").length,
      readyForJudging: allSubmissions.filter(
        (item) => item.dbStatus === "submitted" || item.dbStatus === "locked"
      ).length,
      completedCoverage: allSubmissions.filter(
        (item) => item.reviewCoverage.coverageStatus === "Completed"
      ).length,
    };
  }, [allSubmissions]);

  const handleStatusChange = async (
    submissionId: string,
    status: BackendSubmissionStatus
  ) => {
    try {
      setActionLoadingId(submissionId);
      setError("");
      setBannerMessage("");

      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update submission status.");
      }

      await fetchSubmissions();
      setBannerMessage(data.message || "Submission updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update submission status.";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openAssignmentWorkspace = async (submission: Submission) => {
    setAssignmentSubmission(submission);
    setAssignmentData(null);
    setSelectedJudgeIds([]);
    setError("");
    setBannerMessage("");
    await fetchSubmissionAssignments(submission.id);
  };

  const handleSaveAssignments = async () => {
    if (!assignmentSubmission) return;

    try {
      setAssignmentSaving(true);
      setError("");
      setBannerMessage("");

      const response = await fetch(
        `/api/admin/submissions/${assignmentSubmission.id}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judgeIds: selectedJudgeIds,
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to assign judges.");
      }

      await Promise.all([
        fetchSubmissions(),
        fetchSubmissionAssignments(assignmentSubmission.id),
      ]);

      setBannerMessage(data.message || "Judges assigned successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to assign judges.";
      setError(message);
    } finally {
      setAssignmentSaving(false);
    }
  };

  const handleUnassignJudge = async (judgeId: string) => {
    if (!assignmentSubmission) return;

    const confirmed = window.confirm(
      "Remove this judge from the submission assignment list?"
    );

    if (!confirmed) return;

    try {
      setAssignmentSaving(true);
      setError("");
      setBannerMessage("");

      const response = await fetch(
        `/api/admin/submissions/${assignmentSubmission.id}/assignments`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judgeId,
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to remove assigned judge.");
      }

      await Promise.all([
        fetchSubmissions(),
        fetchSubmissionAssignments(assignmentSubmission.id),
      ]);

      setBannerMessage(data.message || "Judge assignment removed successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove assigned judge.";
      setError(message);
    } finally {
      setAssignmentSaving(false);
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
          <p className="text-xs text-gray-500">team members</p>
        </div>
      </div>
    );
  };

  const renderCoverageBadges = (submission: Submission) => {
    const coverage = submission.reviewCoverage;

    return (
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${coverageStatusStyles[coverage.coverageStatus]}`}
        >
          {coverage.coverageStatus}
        </span>

        <span className="inline-flex rounded-full bg-[#f8f8f9] px-2.5 py-1 text-[11px] font-semibold text-[#3B3C3E]">
          Assigned: {coverage.assignedJudgesCount}
        </span>

        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
          Completed: {coverage.completedReviewsCount}
        </span>

        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          In Progress: {coverage.inProgressReviewsCount}
        </span>

        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          Pending: {coverage.pendingReviewsCount}
        </span>
      </div>
    );
  };

  const renderCoverageSummaryCompact = (submission: Submission) => {
    const coverage = submission.reviewCoverage;
    const reviewedText =
      coverage.assignedJudgesCount > 0
        ? `${coverage.completedReviewsCount}/${coverage.assignedJudgesCount} reviewed`
        : "0 assigned";

    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${coverageStatusStyles[coverage.coverageStatus]}`}
        >
          {coverage.coverageStatus}
        </span>

        <span className="inline-flex rounded-full bg-[#f8f8f9] px-2.5 py-1 text-[11px] font-semibold text-[#3B3C3E]">
          {reviewedText}
        </span>
      </div>
    );
  };

  const renderResourceBadges = (submission: Submission, compact = false) => {
    const sizeClass = compact ? "h-8 w-8 rounded-xl" : "h-10 w-10 rounded-2xl";
    const iconClass = compact ? "h-4 w-4" : "h-4.5 w-4.5";

    const resources = [
      {
        key: "github",
        url: submission.githubLink,
        active: submission.hasGithubLink,
        icon: <Github className={iconClass} />,
        label: "GitHub",
      },
      {
        key: "demo",
        url: submission.demoLink,
        active: submission.hasDemoLink,
        icon: <Globe className={iconClass} />,
        label: "Demo",
      },
      {
        key: "ppt",
        url: submission.pptLink,
        active: submission.hasPptLink,
        icon: <FileText className={iconClass} />,
        label: "PPT",
      },
      {
        key: "video",
        url: submission.videoLink,
        active: submission.hasVideoLink,
        icon: <FileCode2 className={iconClass} />,
        label: "Video",
      },
    ];

    const availableResources = resources.filter((resource) => resource.active);

    if (availableResources.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500">
          No resource links
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {availableResources.map((resource) => (
          <a
            key={resource.key}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center justify-center border border-gray-200 bg-white text-gray-700 transition hover:border-[#A01C33]/25 hover:text-[#A01C33] ${sizeClass}`}
            title={resource.label}
          >
            {resource.icon}
          </a>
        ))}
      </div>
    );
  };

  const renderQuickActions = (submission: Submission, mobile = false) => {
    const sizeClass = mobile
      ? "px-3.5 py-2 text-sm font-medium"
      : "px-3 py-1.5 text-xs font-medium";

    return (
      <div className={`flex flex-wrap ${mobile ? "gap-2" : "gap-1.5"}`}>
        <button
          type="button"
          onClick={() => setSelectedSubmission(submission)}
          className={`inline-flex items-center gap-2 rounded-full border border-[#A01C33]/15 bg-[#A01C33]/6 text-[#A01C33] transition hover:bg-[#A01C33]/10 ${sizeClass}`}
        >
          <Eye className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          View
        </button>

        <button
          type="button"
          onClick={() => openAssignmentWorkspace(submission)}
          className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 ${sizeClass}`}
        >
          <Users className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          Assign Judges
        </button>

        {submission.dbStatus === "draft" ? (
          <button
            type="button"
            onClick={() => handleStatusChange(submission.id, "submitted")}
            disabled={actionLoadingId === submission.id}
            className={`inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 text-green-700 transition hover:bg-green-100 disabled:opacity-60 ${sizeClass}`}
          >
            {actionLoadingId === submission.id ? (
              <Loader2 className={mobile ? "h-4 w-4 animate-spin" : "h-3.5 w-3.5 animate-spin"} />
            ) : (
              <Send className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            )}
            Mark Submitted
          </button>
        ) : submission.dbStatus === "submitted" ? (
          <button
            type="button"
            onClick={() => handleStatusChange(submission.id, "locked")}
            disabled={actionLoadingId === submission.id}
            className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 disabled:opacity-60 ${sizeClass}`}
          >
            {actionLoadingId === submission.id ? (
              <Loader2 className={mobile ? "h-4 w-4 animate-spin" : "h-3.5 w-3.5 animate-spin"} />
            ) : (
              <Lock className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            )}
            Lock
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleStatusChange(submission.id, "submitted")}
            disabled={actionLoadingId === submission.id}
            className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 ${sizeClass}`}
          >
            {actionLoadingId === submission.id ? (
              <Loader2 className={mobile ? "h-4 w-4 animate-spin" : "h-3.5 w-3.5 animate-spin"} />
            ) : (
              <ClipboardCheck className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            )}
            Unlock to Submitted
          </button>
        )}
      </div>
    );
  };

  const renderDesktopRows = () => {
    if (paginatedSubmissions.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center">
            <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-8">
              <p className="text-lg font-bold text-[#3B3C3E]">
                No submissions found
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try changing the search term or filter.
              </p>
            </div>
          </td>
        </tr>
      );
    }

    return paginatedSubmissions.map((submission) => (
      <tr
        key={submission.id}
        className="border-t border-gray-100 align-top transition hover:bg-[#fcfcfd]"
      >
        <td className="px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <FolderKanban className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#3B3C3E]">
                  {submission.projectTitle}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-gray-500">
                  {submission.teamName}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(submission.submittedAt || submission.updatedAt)}
                  </span>
                </div>

                {renderCoverageSummaryCompact(submission)}
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-5">
          <div className="min-w-[180px]">
            <p className="text-sm font-semibold text-[#3B3C3E]">
              {submission.leader}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {submission.leaderEmail || "No email"}
            </p>
            <div className="mt-3">{renderMemberPreview(submission.members)}</div>
          </div>
        </td>

        <td className="px-6 py-5">
          <div className="min-w-[180px]">
            <p className="text-sm font-semibold text-[#3B3C3E]">
              {submission.selectedProblem}
            </p>
            {submission.problemStatement?.difficulty ? (
              <p className="mt-1 text-xs text-gray-500">
                {submission.problemStatement.category} •{" "}
                {submission.problemStatement.difficulty}
              </p>
            ) : null}
          </div>
        </td>

        <td className="px-6 py-5">
          <div className="min-w-[150px]">{renderResourceBadges(submission, true)}</div>
        </td>

        <td className="px-6 py-5">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${submissionStatusStyles[submission.status]}`}
          >
            {submission.status}
          </span>
        </td>

        <td className="px-6 py-5">
          <div className="min-w-[240px]">{renderQuickActions(submission)}</div>
        </td>
      </tr>
    ));
  };

  const renderMobileCards = () => {
    if (paginatedSubmissions.length === 0) {
      return (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-8 text-center">
          <p className="text-lg font-bold text-[#3B3C3E]">No submissions found</p>
          <p className="mt-2 text-sm text-gray-500">
            Try changing the search term or filter.
          </p>
        </div>
      );
    }

    return paginatedSubmissions.map((submission) => (
      <div
        key={submission.id}
        className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-[#3B3C3E]">
              {submission.projectTitle}
            </p>
            <p className="mt-1 text-sm text-gray-500">{submission.teamName}</p>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${submissionStatusStyles[submission.status]}`}
          >
            {submission.status}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Leader
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
              {submission.leader}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {submission.leaderEmail || "No email"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Members
            </p>
            <div className="mt-3">{renderMemberPreview(submission.members)}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Problem
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
              {submission.selectedProblem}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Resources
            </p>
            <div className="mt-3">{renderResourceBadges(submission)}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Judging Coverage
            </p>
            <div className="mt-3">{renderCoverageBadges(submission)}</div>
          </div>
        </div>

        <div className="mt-5">{renderQuickActions(submission, true)}</div>
      </div>
    ));
  };

  const renderPagination = () => {
    if (filteredSubmissions.length <= rowsPerPage) return null;

    let pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    if (totalPages > 7) {
      const visiblePages = new Set<number>([
        1,
        totalPages,
        safeCurrentPage - 1,
        safeCurrentPage,
        safeCurrentPage + 1,
      ]);

      pageNumbers = Array.from(visiblePages)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);
    }

    return (
      <div className="flex flex-col gap-4 rounded-[24px] border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#3B3C3E]">
            Showing {paginationMeta.start}-{paginationMeta.end} of{" "}
            {paginationMeta.total} submissions
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Search and filters apply before pagination.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {pageNumbers.map((page, index) => {
              const active = page === safeCurrentPage;
              const prevPage = pageNumbers[index - 1];
              const shouldShowGap = index > 0 && page - prevPage > 1;

              return (
                <div key={page} className="flex items-center gap-2">
                  {shouldShowGap ? (
                    <span className="px-1 text-sm text-gray-400">...</span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[#A01C33] text-white shadow-[0_10px_20px_rgba(160,28,51,0.18)]"
                        : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33] hover:text-[#A01C33]"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={safeCurrentPage === totalPages}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <AdminSubmissionSkeleton />;
  }

  return (
    <>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#A01C33] via-[#8e182e] to-[#751123] p-8 text-white shadow-[0_22px_60px_rgba(160,28,51,0.28)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                Submission Management • Admin Control
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                Manage project submissions, resources, and judging readiness.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                Review real project records, inspect linked resources, control
                submission status, and assign judges directly from the submission
                workspace.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">
                  Filtered Result
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {filteredSubmissions.length}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Submission records visible in this view.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">Admin Scope</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Status + Assignments
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Supervise judging readiness and assign judges without leaving
                  this page.
                </p>
              </div>
            </div>
          </div>
        </div>

        {(error || bannerMessage) && (
          <div
            className={`rounded-[24px] border px-5 py-4 text-sm font-medium ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || bannerMessage}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {stats.total}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <FolderKanban className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {stats.submitted}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Send className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Locked</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {stats.locked}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Lock className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Ready For Judging
                </p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {stats.readyForJudging}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fully Reviewed
                </p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {stats.completedCoverage}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <input
              type="text"
              placeholder="Search by project, team, leader, or problem..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-[52px] rounded-2xl border border-gray-200 px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33]"
            />

            <select
              value={submissionFilter}
              onChange={(event) => setSubmissionFilter(event.target.value)}
              className="h-[52px] rounded-2xl border border-gray-200 px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33]"
            >
              <option value="All">All</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Locked">Locked</option>
              <option value="Not Assigned">Not Assigned</option>
              <option value="Assigned">Assigned</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#fcfcfd]">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Project
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Leader & Team
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Problem
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Resources
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>{renderDesktopRows()}</tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:hidden">{renderMobileCards()}</div>
        </div>

        {renderPagination()}
      </section>

      {selectedSubmission ? (
        <div className="fixed inset-0 z-[110] bg-black/45 px-4 py-6">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#A01C33]">
                  Submission Details
                </p>
                <h2 className="mt-1 truncate text-2xl font-bold text-[#3B3C3E]">
                  {selectedSubmission.projectTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Team {selectedSubmission.teamName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${submissionStatusStyles[selectedSubmission.status]}`}
                  >
                    {selectedSubmission.status}
                  </div>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Submitted On</p>
                  <p className="mt-3 text-sm font-semibold text-[#3B3C3E]">
                    {formatDate(
                      selectedSubmission.submittedAt || selectedSubmission.updatedAt
                    )}
                  </p>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Leader</p>
                  <p className="mt-3 text-sm font-semibold text-[#3B3C3E]">
                    {selectedSubmission.leader}
                  </p>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Members</p>
                  <p className="mt-3 text-sm font-semibold text-[#3B3C3E]">
                    {selectedSubmission.memberCount}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                    <p className="text-sm font-medium text-[#A01C33]">
                      Project Overview
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                      {selectedSubmission.projectTitle}
                    </h3>
                    <p className="mt-5 text-sm leading-7 text-gray-500">
                      {selectedSubmission.description || "No description added."}
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                    <p className="text-sm font-medium text-[#A01C33]">
                      Problem & Stack
                    </p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Problem
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                          {selectedSubmission.selectedProblem}
                        </p>
                      </div>

                      <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Tech Stack
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedSubmission.techStack.length ? (
                            selectedSubmission.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#3B3C3E]"
                              >
                                {tech}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">Not added</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                    <p className="text-sm font-medium text-[#A01C33]">Resources</p>
                    <div className="mt-5">{renderResourceBadges(selectedSubmission)}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                    <p className="text-sm font-medium text-[#A01C33]">
                      Team Snapshot
                    </p>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#3B3C3E]">Leader</h4>
                            <p className="mt-2 text-sm text-gray-500">
                              {selectedSubmission.leader}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {selectedSubmission.leaderEmail || "No email"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                        <h4 className="font-bold text-[#3B3C3E]">Members</h4>
                        <div className="mt-4">
                          {renderMemberPreview(selectedSubmission.members)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                    <p className="text-sm font-medium text-[#A01C33]">
                      Judging Coverage
                    </p>
                    <div className="mt-5">{renderCoverageBadges(selectedSubmission)}</div>
                  </div>

                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                    <p className="text-sm font-medium text-[#A01C33]">
                      Quick Actions
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {renderQuickActions(selectedSubmission, true)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <SubmissionAssignmentsModal
        open={Boolean(assignmentSubmission)}
        onClose={() => {
          if (assignmentSaving) return;
          setAssignmentSubmission(null);
          setAssignmentData(null);
          setSelectedJudgeIds([]);
        }}
        submission={assignmentSubmission}
        loading={assignmentLoading}
        saving={assignmentSaving}
        data={assignmentData}
        selectedJudgeIds={selectedJudgeIds}
        setSelectedJudgeIds={setSelectedJudgeIds}
        onSave={handleSaveAssignments}
        onUnassign={handleUnassignJudge}
      />
    </>
  );
}