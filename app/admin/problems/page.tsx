"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Filter,
  Layers3,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import ProblemFormModal, {
  ProblemDifficulty,
  ProblemFormValues,
  ProblemStatus,
} from "@/components/modals/ProblemFormModal";

type ProblemItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  shortDescription: string;
  fullDescription: string;
  suggestedTechnologies: string[];
  submissionRequirements: string[];
  teamsInterested: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProblemsResponse = {
  success: boolean;
  problems: ProblemItem[];
  message?: string;
};

type ProblemResponse = {
  success: boolean;
  problem: ProblemItem;
  message?: string;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
};

type FormMode = "create" | "edit" | "view";

const statusStyles: Record<ProblemStatus, string> = {
  Published:
    "border border-green-200 bg-green-50 text-green-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  Draft:
    "border border-gray-200 bg-gray-50 text-gray-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  Archived:
    "border border-red-200 bg-red-50 text-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
};

const difficultyStyles: Record<ProblemDifficulty, string> = {
  Easy: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border border-amber-200 bg-amber-50 text-amber-700",
  Hard: "border border-rose-200 bg-rose-50 text-rose-700",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${className}`}
    />
  );
}

function calculatePercentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function parseTextList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function problemToFormValues(problem?: ProblemItem | null): ProblemFormValues {
  return {
    title: problem?.title || "",
    category: problem?.category || "",
    difficulty: problem?.difficulty || "Medium",
    status: problem?.status || "Draft",
    shortDescription: problem?.shortDescription || "",
    fullDescription: problem?.fullDescription || "",
    suggestedTechnologies: (problem?.suggestedTechnologies || []).join("\n"),
    submissionRequirements: (problem?.submissionRequirements || []).join("\n"),
  };
}

export default function AdminProblemsPage() {
  const [allProblems, setAllProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<FormMode>("create");
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProblemItem | null>(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/problems?scope=admin", {
        method: "GET",
        cache: "no-store",
      });

      const data: ProblemsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch problems");
      }

      setAllProblems(data.problems || []);

      setSelectedProblem((current) => {
        if (!current) return null;
        return (data.problems || []).find((item) => item.id === current.id) || null;
      });

      setDeleteTarget((current) => {
        if (!current) return null;
        return (data.problems || []).find((item) => item.id === current.id) || null;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch problems";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProblems();
  }, []);

  useEffect(() => {
    if (modalOpen || deleteTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen, deleteTarget]);

  const filteredProblems = useMemo(() => {
    return allProblems.filter((problem) => {
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        problem.title.toLowerCase().includes(term) ||
        problem.category.toLowerCase().includes(term) ||
        problem.slug.toLowerCase().includes(term) ||
        problem.shortDescription.toLowerCase().includes(term) ||
        problem.suggestedTechnologies.some((item) =>
          item.toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "All" ? true : problem.status === statusFilter;

      const matchesDifficulty =
        difficultyFilter === "All"
          ? true
          : problem.difficulty === difficultyFilter;

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [allProblems, searchTerm, statusFilter, difficultyFilter]);

  const stats = useMemo(() => {
    return {
      total: allProblems.length,
      published: allProblems.filter((item) => item.status === "Published").length,
      draft: allProblems.filter((item) => item.status === "Draft").length,
      archived: allProblems.filter((item) => item.status === "Archived").length,
      active: allProblems.filter((item) => item.isActive).length,
      linked: allProblems.filter((item) => item.teamsInterested > 0).length,
    };
  }, [allProblems]);

  const publishRate = calculatePercentage(stats.published, stats.total);
  const liveRate = calculatePercentage(stats.active, stats.total);
  const linkedRate = calculatePercentage(stats.linked, stats.total);
  const filteredPublishedCount = filteredProblems.filter(
    (item) => item.status === "Published"
  ).length;
  const filteredDraftCount = filteredProblems.filter(
    (item) => item.status === "Draft"
  ).length;
  const filteredArchivedCount = filteredProblems.filter(
    (item) => item.status === "Archived"
  ).length;
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "All" ||
    difficultyFilter !== "All";

  const openCreateModal = () => {
    setSelectedProblem(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openViewModal = (problem: ProblemItem) => {
    setSelectedProblem(problem);
    setModalMode("view");
    setModalOpen(true);
  };

  const openEditModal = (problem: ProblemItem) => {
    setSelectedProblem(problem);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedProblem(null);
      setModalMode("create");
    }, 150);
  };

  const handleFormSubmit = async (values: ProblemFormValues) => {
    try {
      setFormLoading(true);
      setError("");

      const payload = {
        title: values.title.trim(),
        category: values.category.trim(),
        difficulty: values.difficulty,
        status: values.status,
        shortDescription: values.shortDescription.trim(),
        fullDescription: values.fullDescription.trim(),
        suggestedTechnologies: parseTextList(values.suggestedTechnologies),
        submissionRequirements: parseTextList(values.submissionRequirements),
      };

      const url =
        modalMode === "create"
          ? "/api/problems"
          : `/api/problems/${selectedProblem?.id}`;

      const method = modalMode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ProblemResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save problem");
      }

      closeModal();
      await fetchProblems();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save problem";
      setError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (
    problem: ProblemItem,
    nextStatus: ProblemStatus
  ) => {
    try {
      setActionLoadingId(problem.id);
      setError("");

      const response = await fetch(`/api/problems/${problem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data: ProblemResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update problem status");
      }

      await fetchProblems();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update problem";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoadingId(deleteTarget.id);
      setError("");

      const response = await fetch(`/api/problems/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data: DeleteResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete problem");
      }

      setDeleteTarget(null);
      await fetchProblems();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete problem";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderTechPreview = (technologies: string[]) => {
    const visible = technologies.slice(0, 3);
    const extra = Math.max(technologies.length - 3, 0);

    if (technologies.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500">
          No technologies added
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {visible.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700"
          >
            {item}
          </span>
        ))}

        {extra > 0 ? (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            +{extra} more
          </span>
        ) : null}
      </div>
    );
  };

  const renderQuickActions = (problem: ProblemItem, mobile = false) => {
    const sizeClass = mobile
      ? "px-3.5 py-2 text-sm font-medium"
      : "px-3 py-1.5 text-xs font-medium";

    return (
      <div className={`flex flex-wrap ${mobile ? "gap-2" : "gap-1.5"}`}>
        <button
          type="button"
          onClick={() => openViewModal(problem)}
          className={`inline-flex items-center gap-2 rounded-full border border-[#A01C33]/15 bg-[#A01C33]/6 text-[#A01C33] transition hover:bg-[#A01C33]/10 ${sizeClass}`}
        >
          <Eye className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          View
        </button>

        <button
          type="button"
          onClick={() => openEditModal(problem)}
          className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#A01C33]/25 hover:text-[#A01C33] ${sizeClass}`}
        >
          <PencilLine className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          Edit
        </button>

        {problem.status !== "Published" ? (
          <button
            type="button"
            onClick={() => handleQuickStatusUpdate(problem, "Published")}
            className={`inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 text-green-700 transition hover:bg-green-100 ${sizeClass}`}
          >
            <CheckCircle2 className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            Publish
          </button>
        ) : null}

        {problem.status !== "Draft" ? (
          <button
            type="button"
            onClick={() => handleQuickStatusUpdate(problem, "Draft")}
            className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 ${sizeClass}`}
          >
            <FileText className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            Draft
          </button>
        ) : null}

        {problem.status !== "Archived" ? (
          <button
            type="button"
            onClick={() => handleQuickStatusUpdate(problem, "Archived")}
            className={`inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 ${sizeClass}`}
          >
            <Archive className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            Archive
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setDeleteTarget(problem)}
          className={`inline-flex items-center gap-2 rounded-full border border-red-200 bg-white text-red-600 transition hover:bg-red-50 ${sizeClass}`}
        >
          <Trash2 className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          Delete
        </button>

        {actionLoadingId === problem.id ? (
          <span
            className={`inline-flex items-center rounded-full border border-[#A01C33]/10 bg-[#A01C33]/5 font-medium text-[#A01C33] ${
              mobile ? "px-3.5 py-2 text-sm" : "px-3 py-1.5 text-xs"
            }`}
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
          key={`problem-skeleton-${index}`}
          className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="grid grid-cols-[1.65fr_1fr_0.95fr_0.95fr_1.25fr] gap-5">
            {Array.from({ length: 5 }).map((__, innerIndex) => (
              <SkeletonBlock
                key={`problem-skeleton-cell-${index}-${innerIndex}`}
                className="h-16"
              />
            ))}
          </div>
        </div>
      ));
    }

    if (filteredProblems.length === 0) {
      return (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] px-5 py-14 text-center">
          <p className="text-lg font-semibold text-[#3B3C3E]">
            No problem records found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting the search or filters.
          </p>
        </div>
      );
    }

    return filteredProblems.map((problem) => (
      <div
        key={problem.id}
        className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
      >
        <div className="grid grid-cols-[1.65fr_1fr_0.95fr_0.95fr_1.25fr] gap-5">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Layers3 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#3B3C3E]">
                  {problem.title}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-gray-500">
                  {problem.category}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${difficultyStyles[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(problem.createdAt)}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                  {problem.shortDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Status
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[problem.status]}`}
                >
                  {problem.status}
                </span>

                {problem.isActive ? (
                  <span className="inline-flex rounded-full border border-[#A01C33]/15 bg-[#A01C33]/8 px-3 py-1.5 text-xs font-semibold text-[#A01C33]">
                    Live
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Team interest
              </p>
              <p className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                {problem.teamsInterested}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                linked team{problem.teamsInterested === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Tech preview
              </p>
              {renderTechPreview(problem.suggestedTechnologies)}
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Quick actions
              </p>
              {renderQuickActions(problem)}
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
          key={`problem-mobile-skeleton-${index}`}
          className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm"
        >
          <SkeletonBlock className="h-6 w-1/2" />
          <SkeletonBlock className="mt-3 h-4 w-1/3" />
          <div className="mt-5 grid gap-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        </div>
      ));
    }

    if (filteredProblems.length === 0) {
      return (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-8 text-center">
          <p className="text-lg font-semibold text-[#3B3C3E]">
            No problem records found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Adjust filters and try again.
          </p>
        </div>
      );
    }

    return filteredProblems.map((problem) => (
      <div
        key={problem.id}
        className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#3B3C3E]">
              {problem.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{problem.category}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${difficultyStyles[problem.difficulty]}`}
              >
                {problem.difficulty}
              </span>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[problem.status]}`}
              >
                {problem.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
          <p className="text-sm leading-7 text-gray-600">{problem.shortDescription}</p>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Team interest
            </p>
            <p className="mt-2 text-lg font-bold text-[#3B3C3E]">
              {problem.teamsInterested} linked team
              {problem.teamsInterested === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Suggested technologies
            </p>
            <div className="mt-3">{renderTechPreview(problem.suggestedTechnologies)}</div>
          </div>
        </div>

        <div className="mt-5">{renderQuickActions(problem, true)}</div>
      </div>
    ));
  };

  return (
    <>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-[#ead7de] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f5_42%,#fff7fa_100%)] p-8 shadow-[0_20px_55px_rgba(160,28,51,0.08)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#ead7de] bg-white/90 px-4 py-2 text-sm font-semibold text-[#9d5f6d] shadow-sm">
                Problem Library / Admin Control
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-[#2e1f25] sm:text-4xl">
                Operate the full challenge library from one clean control surface.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5b62] sm:text-base">
                Publish the right statements, keep draft work visible to the team,
                and quickly see which challenges are live, archived, or already
                pulling team interest.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-[#ead7de] bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d5f6d]">
                    Published
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#2e1f25]">
                    {loading ? "..." : stats.published}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ead7de] bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d5f6d]">
                    Live
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#2e1f25]">
                    {loading ? "..." : stats.active}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ead7de] bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d5f6d]">
                    Linked Teams
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#2e1f25]">
                    {loading ? "..." : stats.linked}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#A01C33]">
                      Library Health
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-[#2e1f25]">
                      {loading ? "..." : `${publishRate}% published`}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {loading
                        ? "Checking challenge readiness..."
                        : `${stats.active} live statements and ${stats.linked} already drawing team demand.`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500">
                      <span>Publish coverage</span>
                      <span>{loading ? "..." : `${publishRate}%`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#f2e9ec]">
                      <div
                        className="h-2 rounded-full bg-[#A01C33] transition-all"
                        style={{ width: `${publishRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500">
                      <span>Live visibility</span>
                      <span>{loading ? "..." : `${liveRate}%`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#eef3ed]">
                      <div
                        className="h-2 rounded-full bg-green-600 transition-all"
                        style={{ width: `${liveRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500">
                      <span>Team pull</span>
                      <span>{loading ? "..." : `${linkedRate}%`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#f6efe4]">
                      <div
                        className="h-2 rounded-full bg-amber-500 transition-all"
                        style={{ width: `${linkedRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-[#A01C33]">
                    Current View
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#2e1f25]">
                    {loading ? "..." : filteredProblems.length}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Records visible after your active search and filter settings.
                  </p>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-[#A01C33]">
                    Draft Queue
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#2e1f25]">
                    {loading ? "..." : stats.draft}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Problem statements still waiting for refinement or publication.
                  </p>
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Problems</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.total}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  All challenge records currently managed from the platform.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Published</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.published}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Statements available for participants to discover and choose.
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
                <p className="text-sm font-medium text-gray-500">Draft Queue</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.draft}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Challenge ideas still being refined before they go live.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Archived</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.archived}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Retired statements preserved for history and audit reference.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <Archive className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Live Visibility</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.active}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Problems currently active and visible inside the event workflow.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Linked Teams</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.linked}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Statements already attached to at least one participating team.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Problem Records</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Search and manage problem statements
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Keep the library clean, publish only ready statements, and use the
                filters below to quickly spot drafts, archived records, or
                high-interest challenges.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="relative min-w-[250px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title, category, slug..."
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
                  className="h-12 min-w-[170px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                >
                  <option value="All">All Statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="h-12 min-w-[170px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setDifficultyFilter("All");
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  Clear Filters
                </button>
              ) : null}

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white transition hover:bg-[#89172c]"
              >
                <Plus className="h-4 w-4" />
                Create Problem
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] px-5 py-4 text-sm text-[#6f5b62]">
              Showing{" "}
              <span className="font-bold text-[#2e1f25]">
                {loading ? "..." : filteredProblems.length}
              </span>{" "}
              problem records in the current view.{" "}
              <span className="font-semibold text-[#A01C33]">
                {loading ? "..." : filteredPublishedCount}
              </span>{" "}
              are published and{" "}
              <span className="font-semibold text-[#A01C33]">
                {loading ? "..." : filteredDraftCount}
              </span>{" "}
              remain in draft.
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] px-5 py-4 text-sm text-gray-500">
              <span className="font-semibold text-[#3B3C3E]">
                {loading ? "..." : filteredArchivedCount}
              </span>{" "}
              archived records are in view.{" "}
              <span className="font-semibold text-[#3B3C3E]">
                {loading ? "..." : stats.linked}
              </span>{" "}
              total statements are already linked to teams.
            </div>
          </div>

          <div className="mt-6 hidden xl:block">
            <div className="grid grid-cols-[1.65fr_1fr_0.95fr_0.95fr_1.25fr] gap-5 px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              <div>Problem</div>
              <div>Status</div>
              <div>Team interest</div>
              <div>Tech preview</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">{renderDesktopRows()}</div>
          </div>

          <div className="mt-6 grid gap-4 xl:hidden">{renderMobileCards()}</div>
        </div>
      </section>

      <ProblemFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={problemToFormValues(selectedProblem)}
        loading={formLoading}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-[2px]"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-lg rounded-[28px] border border-white/50 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#A01C33]">
                    Delete problem statement
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-[#3B3C3E]">
                    Confirm deletion
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    This will permanently remove{" "}
                    <span className="font-semibold text-[#3B3C3E]">
                      {deleteTarget.title}
                    </span>
                    . If this problem is already linked to teams, deletion will be
                    blocked by the backend.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#A01C33]/20 hover:text-[#A01C33]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                Delete only problems that are no longer used. Archive is safer for
                existing challenge history.
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoadingId === deleteTarget.id}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {actionLoadingId === deleteTarget.id
                    ? "Deleting..."
                    : "Delete Problem"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
