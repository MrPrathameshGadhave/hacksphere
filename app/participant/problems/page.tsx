"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  Gauge,
  Globe,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import ConfirmActionModal from "@/components/modals/ConfirmActionModal";

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  college?: string;
  avatar?: string;
  role?: "participant" | "judge" | "admin";
  isApproved?: boolean;
};

type ProblemData = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  suggestedTechnologies: string[];
  submissionRequirements: string[];
  status?: "Draft" | "Published" | "Archived";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

type TeamProblemPreview = {
  id?: string;
  _id?: string;
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

type ProblemsResponse = {
  success: boolean;
  problems: ProblemData[];
  message?: string;
};

type SelectProblemResponse = {
  success: boolean;
  message?: string;
  team: TeamData;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

function getProblemIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("education")) return BookOpenText;
  if (normalized.includes("health")) return ShieldCheck;
  if (normalized.includes("city")) return Globe;
  if (normalized.includes("sustain")) return Sparkles;
  if (normalized.includes("social")) return Target;
  if (normalized.includes("innovation")) return Brain;

  return Lightbulb;
}

function getProblemId(value?: { id?: string; _id?: string } | null) {
  if (!value) return "";
  return String(value.id ?? value._id ?? "");
}

function isProblemAvailable(problem?: ProblemData | null) {
  if (!problem) return false;

  if (typeof problem.status === "string") {
    return problem.status === "Published";
  }

  return problem.isActive === true;
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

export default function ParticipantProblemsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [problems, setProblems] = useState<ProblemData[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ProblemData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const [me, myTeam, problemsRes] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<MyTeamResponse>("/api/teams/my-team"),
          fetchJson<ProblemsResponse>("/api/problems"),
        ]);

        if (!isMounted) return;

        setUser(me.user);
        setTeam(myTeam.team);
        setProblems(problemsRes.problems || []);
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

  const isLeader = useMemo(() => {
    if (!user || !team) return false;
    return team.leader?._id === user._id;
  }, [user, team]);

  const hasUnapprovedParticipants = useMemo(() => {
    if (!team) return false;

    return [team.leader, ...(team.members || [])].some(
      (participant) => participant?.isApproved === false
    );
  }, [team]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(problems.map((problem) => problem.category))
    );
    return ["All", ...uniqueCategories];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        !searchTerm.trim() ||
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || problem.category === categoryFilter;

      const matchesDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [problems, searchTerm, categoryFilter, difficultyFilter]);

  const currentSelectedProblemId = useMemo(() => {
    return getProblemId(team?.problemStatement);
  }, [team]);

  const currentSelectionTitle = team?.problemStatement?.title || "Not Selected";

  const teamReadinessTitle = !team
    ? "No team created yet"
    : team.status === "disqualified"
    ? "Team restricted"
    : hasUnapprovedParticipants
    ? "Approval pending"
    : "Team ready for selection";

  const teamReadinessDescription = !team
    ? "Create your team first before locking a challenge."
    : team.status === "disqualified"
    ? "This team cannot select a problem statement right now."
    : hasUnapprovedParticipants
    ? "All team participants must be approved by admin before the leader can select a problem."
    : "Your team is ready. The team leader can now select the challenge.";

  function getSelectButtonText(problem: ProblemData) {
    const isSelected = currentSelectedProblemId === problem.id;
    const available = isProblemAvailable(problem);

    if (isSelected) return "Selected";
    if (!team) return "Create Team First";
    if (team.status === "disqualified") return "Team Restricted";
    if (!available) return "Unavailable";
    if (hasUnapprovedParticipants) return "Approval Pending";
    if (!isLeader) return "Leader Can Select";
    if (currentSelectedProblemId) return "Replace Problem";

    return "Select Problem";
  }

  function canOpenSelectModal(problem: ProblemData) {
    const isSelected = currentSelectedProblemId === problem.id;

    return (
      !!team &&
      team.status !== "disqualified" &&
      isLeader &&
      !hasUnapprovedParticipants &&
      isProblemAvailable(problem) &&
      !isSelected &&
      !selecting
    );
  }

  const handleOpenSelectModal = (problem: ProblemData) => {
    if (!canOpenSelectModal(problem)) return;

    setSelectedProblem(problem);
    setSelectModalOpen(true);
  };

  const handleConfirmSelectProblem = async () => {
    if (!selectedProblem) return;

    try {
      setSelecting(true);
      setError(null);

      const response = await sendJson<SelectProblemResponse>(
        "/api/teams/select-problem",
        "POST",
        {
          problemId: selectedProblem.id,
        }
      );

      setTeam(response.team);
      setSelectModalOpen(false);
      setSelectedProblem(null);
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setSelecting(false);
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
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Problem Statements • HackSphere Challenge Arena
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Explore challenges and choose the right problem for your team.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Browse curated problem statements, understand difficulty and scope,
              and align your team around a challenge that matches your skills,
              creativity, and impact goals.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setDifficultyFilter("All");
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                View All Problems
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/participant/my-team"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Back to Team
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Current Selection</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "Loading..." : currentSelectionTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {loading
                  ? "Checking your team selection..."
                  : team?.problemStatement
                  ? "Your team has selected a challenge."
                  : "Your team has not locked a problem yet."}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">
                Available Challenges
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "..." : problems.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Carefully review before making a final selection.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Browse Problems</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Search and filter challenge statements
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title or category..."
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(event) => setDifficultyFilter(event.target.value)}
                className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                    <SkeletonBlock className="h-6 w-16 rounded-full" />
                  </div>
                  <SkeletonBlock className="mt-4 h-6 w-4/5" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-5/6" />
                  <div className="mt-5 flex gap-2">
                    <SkeletonBlock className="h-6 w-20 rounded-full" />
                    <SkeletonBlock className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="mt-5 flex gap-2">
                    <SkeletonBlock className="h-8 w-20 rounded-xl" />
                    <SkeletonBlock className="h-8 w-24 rounded-xl" />
                  </div>
                  <div className="mt-6 flex gap-3">
                    <SkeletonBlock className="h-10 w-28 rounded-2xl" />
                    <SkeletonBlock className="h-10 w-32 rounded-2xl" />
                  </div>
                </div>
              ))
            ) : filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => {
                const Icon = getProblemIcon(problem.category);
                const isSelected = currentSelectedProblemId === problem.id;
                const isAvailable = isProblemAvailable(problem);
                const canSelect = canOpenSelectModal(problem);

                return (
                  <div
                    key={problem.id}
                    className="group rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:-translate-y-0.5 hover:border-[#A01C33]/25 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected
                            ? "bg-[#A01C33]/10 text-[#A01C33]"
                            : isAvailable
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isSelected ? "Selected" : isAvailable ? "Open" : "Unavailable"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold leading-7 text-[#3B3C3E]">
                      {problem.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-500">
                      {problem.shortDescription}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                        {problem.category}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {problem.difficulty}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(problem.suggestedTechnologies || []).length > 0 ? (
                        problem.suggestedTechnologies.slice(0, 3).map((tech, index) => (
                          <span
                            key={`${problem.id}-${tech}-${index}`}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                          No tech tags
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/participant/problems/${problem.slug}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                      >
                        View Details
                      </Link>

                      <button
                        disabled={!canSelect}
                        onClick={() => handleOpenSelectModal(problem)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {getSelectButtonText(problem)}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-2 rounded-[24px] border border-dashed border-gray-300 bg-[#fafafa] p-8 text-center">
                <h3 className="text-lg font-bold text-[#3B3C3E]">
                  No problems found
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Try changing your search or filter options.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Selection Guide</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              How to choose wisely
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Match your strengths</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Choose a problem your team can realistically execute well.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Aim for impact</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Strong ideas solve meaningful problems clearly and practically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Balance innovation</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Pick something creative, but still achievable within 48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Current Team Status</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Before selecting a problem
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <p className="text-sm font-medium text-gray-500">Team Readiness</p>
                <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                  {loading ? "Loading..." : teamReadinessTitle}
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  {loading ? "Checking team state..." : teamReadinessDescription}
                </p>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">
                  Recommended next step
                </p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  {!team
                    ? "Create your team first, then choose one problem statement together."
                    : team.status === "disqualified"
                    ? "Your team is currently restricted from selecting a problem statement."
                    : hasUnapprovedParticipants
                    ? "Wait for admin approval for all participants before locking the final problem statement."
                    : !isLeader
                    ? "Ask your team leader to review the options and lock the final problem statement."
                    : team.problemStatement
                    ? "Your problem is selected. Review details carefully and continue to submission planning."
                    : "Review the problems with your team and select the one that best fits your combined strengths."}
                </p>

                <Link
                  href={!team ? "/participant/my-team" : "/participant/submission"}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
                >
                  {!team ? "Go to My Team" : "Go to Submission"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={selectModalOpen}
        onClose={() => {
          setSelectModalOpen(false);
          setSelectedProblem(null);
        }}
        onConfirm={handleConfirmSelectProblem}
        title="Select problem statement"
        description={
          selectedProblem
            ? currentSelectedProblemId &&
              currentSelectedProblemId !== getProblemId(selectedProblem)
              ? `Are you sure you want to replace your current selected problem with "${selectedProblem.title}"?`
              : `Are you sure you want to select "${selectedProblem.title}" for your team?`
            : "Are you sure you want to select this problem statement?"
        }
        confirmText="Confirm Selection"
        cancelText="Cancel"
        variant="warning"
        loading={selecting}
      />
    </section>
  );
}