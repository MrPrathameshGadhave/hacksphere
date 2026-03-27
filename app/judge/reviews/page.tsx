"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCode2,
  Filter,
  Globe,
  LayoutGrid,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

type ReviewStatus = "pending" | "in-progress" | "reviewed";

type ReviewItem = {
  id: string;
  assignmentId: string;
  submissionId: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  description: string;
  problemTitle: string;
  problemSlug: string;
  problemCategory: string;
  problemDifficulty: string;
  memberCount: number;
  githubLink: string;
  demoLink: string;
  pptLink: string;
  videoLink: string;
  techStack: string[];
  images: string[];
  submissionStatus: "draft" | "submitted" | "locked";
  submittedAt: string | null;
  reviewStatus: ReviewStatus;
  evaluation: {
    status: "draft" | "submitted";
    totalScore: number;
    updatedAt: string | null;
  } | null;
  assignedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ReviewsApiResponse = {
  items: ReviewItem[];
  counts: {
    total: number;
    pending: number;
    inProgress: number;
    reviewed: number;
  };
};

const scoreCriteria = [
  "Innovation",
  "Technical Complexity",
  "UI/UX",
  "Impact",
  "Presentation",
];

const ITEMS_PER_PAGE = 6;

function getDisplayStatus(status: ReviewStatus) {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "in-progress":
      return "In Progress";
    case "reviewed":
      return "Reviewed";
    default:
      return "Pending Review";
  }
}

function getStatusClasses(status: ReviewStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "in-progress":
      return "bg-blue-100 text-blue-700";
    case "reviewed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getActionLabel(status: ReviewStatus) {
  switch (status) {
    case "pending":
      return "Start Evaluation";
    case "in-progress":
      return "Continue Evaluation";
    case "reviewed":
      return "View Evaluation";
    default:
      return "Start Evaluation";
  }
}

export default function JudgeReviewsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<ReviewItem[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    reviewed: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/judge/reviews", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | ReviewsApiResponse
          | { message?: string }
          | null;

        if (!response.ok) {
          throw new Error(data && "message" in data ? data.message : "Failed to load judge reviews.");
        }

        if (!mounted || !data || !("items" in data)) return;

        setProjects(Array.isArray(data.items) ? data.items : []);
        setCounts({
          total: data.counts?.total ?? 0,
          pending: data.counts?.pending ?? 0,
          inProgress: data.counts?.inProgress ?? 0,
          reviewed: data.counts?.reviewed ?? 0,
        });
      } catch (err) {
        if (!mounted) return;

        setProjects([]);
        setCounts({
          total: 0,
          pending: 0,
          inProgress: 0,
          reviewed: 0,
        });
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading reviews."
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = searchTerm.trim().toLowerCase();
      const statusLabel = getDisplayStatus(project.reviewStatus);

      const matchesSearch =
        query.length === 0 ||
        project.teamName.toLowerCase().includes(query) ||
        project.projectTitle.toLowerCase().includes(query) ||
        project.problemTitle.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ? true : statusLabel === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const startItem =
    filteredProjects.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length);

  const handleOpenFirstReview = () => {
    const firstProject = filteredProjects[0] || projects[0];
    if (!firstProject?.id) return;

    router.push(`/judge/reviews/${firstProject.id}`);
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Review Queue • Assigned Project Evaluations
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Evaluate submissions, score fairly, and provide meaningful feedback.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Review submissions with clarity and consistency across the official
              HackSphere judging criteria.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handleOpenFirstReview}
                disabled={isLoading || projects.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Open First Review
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/judge"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Visible Reviews</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {isLoading ? "—" : counts.total}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Only your assigned projects are shown.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Pending</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {isLoading ? "—" : counts.pending}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Reviews not started yet.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Reviewed</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {isLoading ? "—" : counts.reviewed}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Completed final evaluations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Assigned Projects</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Review queue
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[240px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams or projects..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>

                <div className="relative">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-12 min-w-[180px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Reviewed">Reviewed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm">
              <p className="font-medium text-gray-600">
                Showing <span className="font-bold text-[#3B3C3E]">{startItem}</span>{" "}
                to <span className="font-bold text-[#3B3C3E]">{endItem}</span> of{" "}
                <span className="font-bold text-[#3B3C3E]">
                  {filteredProjects.length}
                </span>{" "}
                projects
              </p>

              <p className="font-medium text-gray-500">
                Page <span className="font-bold text-[#3B3C3E]">{currentPage}</span> of{" "}
                <span className="font-bold text-[#3B3C3E]">{totalPages}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="h-6 w-28 rounded-full bg-gray-200" />
                  <div className="mt-4 h-8 w-2/3 rounded-xl bg-gray-200" />
                  <div className="mt-3 h-5 w-40 rounded-lg bg-gray-200" />
                  <div className="mt-5 h-16 w-full rounded-2xl bg-gray-100" />
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="h-24 rounded-[20px] bg-gray-100" />
                    <div className="h-24 rounded-[20px] bg-gray-100" />
                    <div className="h-24 rounded-[20px] bg-gray-100" />
                  </div>
                  <div className="mt-5 h-24 rounded-[22px] bg-gray-100" />
                  <div className="mt-6 flex gap-3">
                    <div className="h-12 w-40 rounded-2xl bg-gray-200" />
                    <div className="h-12 w-40 rounded-2xl bg-gray-100" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-red-700">
                  Unable to load judge reviews
                </h3>
                <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reload Page
                </button>
              </div>
            ) : paginatedProjects.length === 0 ? (
              <div className="rounded-[28px] border border-gray-200 bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-[#3B3C3E]">
                  {projects.length === 0 ? "No assigned projects yet" : "No matching projects found"}
                </h3>
                <p className="mt-3 text-sm text-gray-500">
                  {projects.length === 0
                    ? "You currently do not have any judge assignments. Once admin assigns projects to you, they will appear here."
                    : "Try changing your search or filter to see more assigned reviews."}
                </p>
              </div>
            ) : (
              paginatedProjects.map((project) => {
                const statusLabel = getDisplayStatus(project.reviewStatus);

                return (
                  <div
                    key={project.id}
                    className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              project.reviewStatus
                            )}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                          {project.projectTitle || "Untitled Project"}
                        </h3>

                        <p className="mt-2 text-sm font-medium text-[#A01C33]">
                          Team: {project.teamName}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                        Problem: {project.problemTitle || "Not Selected"}
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-gray-500">
                      {project.description || "No project description available yet."}
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-[20px] border border-gray-200 bg-[#fcfcfd] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Team Members
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#3B3C3E]">
                              {project.memberCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-gray-200 bg-[#fcfcfd] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                            <FileCode2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              GitHub
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#3B3C3E]">
                              {project.githubLink ? "Available" : "Missing"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-gray-200 bg-[#fcfcfd] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Demo Link
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#3B3C3E]">
                              {project.demoLink ? "Available" : "Missing"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-dashed border-[#A01C33]/20 bg-[#A01C33]/[0.03] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-[#A01C33]">
                          Evaluation Criteria Preview
                        </p>

                        {project.evaluation && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#A01C33] shadow-sm">
                            Score: {project.evaluation.totalScore} / 50
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {scoreCriteria.map((criterion) => (
                          <span
                            key={criterion}
                            className="rounded-full border border-[#A01C33]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#A01C33]"
                          >
                            {criterion}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/judge/reviews/${project.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                      >
                        {getActionLabel(project.reviewStatus)}
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/judge/reviews/${project.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                      >
                        View Project Details
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!isLoading && !error && filteredProjects.length > ITEMS_PER_PAGE && (
            <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const isActive = page === currentPage;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-11 min-w-[44px] items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${isActive
                          ? "bg-[#A01C33] text-white shadow-[0_10px_20px_rgba(160,28,51,0.18)]"
                          : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33] hover:text-[#A01C33]"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Review Workflow</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              How evaluation should flow
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Open assigned project",
                  description:
                    "Start from the review queue and inspect the submission details carefully.",
                  icon: LayoutGrid,
                },
                {
                  title: "Check links and resources",
                  description:
                    "Verify repository, demo, screenshots, and other supporting materials.",
                  icon: Sparkles,
                },
                {
                  title: "Score by criteria",
                  description:
                    "Evaluate innovation, complexity, UI/UX, impact, and presentation.",
                  icon: Star,
                },
                {
                  title: "Submit final feedback",
                  description:
                    "Provide clear and constructive comments before finalizing the review.",
                  icon: ClipboardCheck,
                },
              ].map((item) => {
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
                        <h3 className="font-bold text-[#3B3C3E]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Judge Guidance</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Evaluation reminders
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Consistent judging</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Use the same evaluation standard across every project for fairness.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Meaningful feedback</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Highlight strengths, weaknesses, and improvement points clearly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">Important note</p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  Final leaderboard positions depend on judge scores,
                  review consistency, and official admin publishing after the
                  evaluation phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}