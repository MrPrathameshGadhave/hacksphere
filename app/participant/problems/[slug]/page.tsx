"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Gauge,
  Lightbulb,
  ShieldCheck,
  Users,
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
  slug?: string;
  isActive?: boolean;
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

const difficultyStyles: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
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

export default function ParticipantProblemDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  const slug = typeof params?.slug === "string" ? params.slug : "";

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);
        setNotFoundState(false);

        const [me, myTeam, problemsRes] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<MyTeamResponse>("/api/teams/my-team"),
          fetchJson<ProblemsResponse>("/api/problems"),
        ]);

        if (!isMounted) return;

        const matchedProblem =
          (problemsRes.problems || []).find((item) => item.slug === slug) || null;

        if (!matchedProblem) {
          setNotFoundState(true);
          return;
        }

        setUser(me.user);
        setTeam(myTeam.team);
        setProblem(matchedProblem);
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

    if (slug) {
      loadPage();
    }

    return () => {
      isMounted = false;
    };
  }, [router, slug]);

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

  const selectedProblemId = useMemo(() => {
    return getProblemId(team?.problemStatement);
  }, [team]);

  const selectableProblem = useMemo(() => {
    return isProblemAvailable(problem);
  }, [problem]);

  const isSelected = useMemo(() => {
    if (!problem) return false;
    return selectedProblemId === problem.id;
  }, [selectedProblemId, problem]);

  const hasAnotherSelectedProblem = useMemo(() => {
    if (!problem || !selectedProblemId) return false;
    return selectedProblemId !== problem.id;
  }, [selectedProblemId, problem]);

  const ctaText = useMemo(() => {
    if (selecting) return "Saving...";
    if (!problem) return "Select Problem";
    if (isSelected) return "Selected";
    if (!team) return "Create Team First";
    if (team.status === "disqualified") return "Team Restricted";
    if (!selectableProblem) return "Unavailable";
    if (hasUnapprovedParticipants) return "Approval Pending";
    if (!isLeader) return "Leader Can Select";
    if (hasAnotherSelectedProblem) return "Replace Current Problem";
    return "Select Problem";
  }, [
    selecting,
    problem,
    isSelected,
    team,
    selectableProblem,
    hasUnapprovedParticipants,
    isLeader,
    hasAnotherSelectedProblem,
  ]);

  const ctaDisabled = useMemo(() => {
    if (loading || selecting) return true;
    if (!problem) return true;
    if (isSelected) return true;
    if (!team) return true;
    if (team.status === "disqualified") return true;
    if (!selectableProblem) return true;
    if (hasUnapprovedParticipants) return true;
    if (!isLeader) return true;
    return false;
  }, [
    loading,
    selecting,
    problem,
    isSelected,
    team,
    selectableProblem,
    hasUnapprovedParticipants,
    isLeader,
  ]);

  const handleConfirmSelectProblem = async () => {
    if (!problem) return;

    try {
      setSelecting(true);
      setError(null);

      const response = await sendJson<SelectProblemResponse>(
        "/api/teams/select-problem",
        "POST",
        {
          problemId: problem.id,
        }
      );

      setTeam(response.team);
      setSelectModalOpen(false);
      setError(null);
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

  if (notFoundState) {
    notFound();
  }

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.95fr] lg:items-center">
          <div>
            <Link
              href="/participant/problems"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </Link>

            {loading ? (
              <>
                <SkeletonBlock className="mt-5 h-5 w-28 bg-white/20" />
                <SkeletonBlock className="mt-5 h-10 w-3/4 bg-white/20" />
                <SkeletonBlock className="mt-4 h-5 w-full bg-white/20" />
                <SkeletonBlock className="mt-2 h-5 w-5/6 bg-white/20" />
              </>
            ) : problem ? (
              <>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    {problem.category}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      difficultyStyles[problem.difficulty] || "bg-white/15 text-white"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                  {isSelected ? (
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#A01C33]">
                      Selected by Your Team
                    </span>
                  ) : !selectableProblem ? (
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      Unavailable
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  {problem.title}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
                  {problem.shortDescription}
                </p>
              </>
            ) : null}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Team Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "Loading..." : team ? team.teamName : "No Team"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {loading
                  ? "Checking your team setup..."
                  : !team
                  ? "Create your team first before selecting this challenge."
                  : team.status === "disqualified"
                  ? "This team is currently restricted from selecting a problem."
                  : hasUnapprovedParticipants
                  ? "All team participants must be approved before the leader can lock this challenge."
                  : isLeader
                  ? "You are the team leader and can manage selection."
                  : "Only your team leader can lock this challenge."}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Current Selection</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading
                  ? "Loading..."
                  : team?.problemStatement?.title || "Not Selected"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {loading
                  ? "Checking selected challenge..."
                  : isSelected
                  ? "This problem is already selected by your team."
                  : hasAnotherSelectedProblem
                  ? "Your team currently has a different selected challenge."
                  : "Your team has not selected any challenge yet."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Problem Overview</p>
                <h2 className="text-2xl font-bold text-[#3B3C3E]">
                  Full description
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-11/12" />
                <SkeletonBlock className="h-4 w-10/12" />
              </div>
            ) : (
              <p className="mt-6 whitespace-pre-line text-sm leading-8 text-gray-600">
                {problem?.fullDescription}
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Tech Direction</p>
                <h2 className="text-2xl font-bold text-[#3B3C3E]">
                  Suggested technologies
                </h2>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    className="h-9 w-24 rounded-full"
                  />
                ))
              ) : problem && problem.suggestedTechnologies.length > 0 ? (
                problem.suggestedTechnologies.map((tech, index) => (
                  <span
                    key={`${problem.id}-${tech}-${index}`}
                    className="rounded-full border border-gray-200 bg-[#fcfcfd] px-4 py-2 text-sm font-semibold text-[#3B3C3E]"
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No suggested technologies added yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Submission Scope</p>
                <h2 className="text-2xl font-bold text-[#3B3C3E]">
                  Submission requirements
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-16 w-full rounded-2xl" />
                ))
              ) : problem && problem.submissionRequirements.length > 0 ? (
                problem.submissionRequirements.map((requirement, index) => (
                  <div
                    key={`${problem.id}-requirement-${index}`}
                    className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#A01C33] text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-[#5B6068]">
                        {requirement}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-4 text-sm leading-7 text-[#5B6068]">
                  No submission requirements added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Participant Action</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Choose this challenge
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Team requirement</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      You need a team, and only the team leader can lock the final problem.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Selection note</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Review difficulty, scope, and execution effort before finalizing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">
                  Current action state
                </p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  {!team
                    ? "Create your team first before selecting this problem statement."
                    : team.status === "disqualified"
                    ? "This team is currently restricted from selecting or replacing a problem statement."
                    : hasUnapprovedParticipants
                    ? "All team participants must be approved by admin before the leader can select or replace the problem statement."
                    : !selectableProblem
                    ? "This problem statement is not available for selection right now."
                    : !isLeader
                    ? "Only the team leader can select or replace the problem statement."
                    : isSelected
                    ? "This problem is already selected for your team."
                    : hasAnotherSelectedProblem
                    ? "Selecting this will replace your team's current problem statement."
                    : "Your team can select this problem statement now."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    disabled={ctaDisabled}
                    onClick={() => setSelectModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ctaText}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <Link
                    href={!team ? "/participant/my-team" : "/participant/submission"}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                  >
                    {!team ? "Go to My Team" : "Go to Submission"}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Selection Checklist</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Before your team confirms
            </h2>

            <div className="mt-6 space-y-3">
              {[
                "The team understands the problem clearly.",
                "The difficulty matches team capability.",
                "The idea feels achievable within the hackathon timeline.",
                "The leader is ready to confirm the final choice.",
              ].map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#A01C33]/10 text-[#A01C33]">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-7 text-[#5B6068]">{point}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/participant/problems"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
            >
              Explore more problems
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={selectModalOpen}
        onClose={() => {
          setSelectModalOpen(false);
        }}
        onConfirm={handleConfirmSelectProblem}
        title="Select problem statement"
        description={
          problem
            ? hasAnotherSelectedProblem
              ? `Are you sure you want to replace your current selected problem with "${problem.title}"?`
              : `Are you sure you want to select "${problem.title}" for your team?`
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