"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getJudgeReviewStatusDescription,
  getJudgeReviewStatusLabel,
  type JudgeReviewStatus,
} from "@/lib/judge-review-status";
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCode2,
  FileText,
  FileVideo,
  FolderGit2,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  Lock,
  MessageSquareText,
  Presentation,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";

type ScoreKey =
  | "innovation"
  | "technicalComplexity"
  | "uiUx"
  | "impact"
  | "presentation";

type ScoreState = Record<ScoreKey, number>;

type ReviewDetail = {
  id: string;
  assignmentId: string;
  submissionId: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  description: string;
  selectedProblem: string;
  problemTitle: string;
  category: string;
  difficulty: string;
  members: {
    id: string;
    name: string;
    email: string;
    college: string;
    avatar: string;
    isApproved: boolean;
    role: string;
    initials: string;
  }[];
  techStack: string[];
  githubLink: string;
  demoLink: string;
  pptLink: string;
  videoLink: string;
  screenshots: string[];
  submissionStatus: "draft" | "submitted" | "locked";
  submittedAt: string | null;
  reviewStatus: JudgeReviewStatus;
  evaluation: {
    innovation: number;
    technicalComplexity: number;
    uiUx: number;
    impact: number;
    presentation: number;
    totalScore: number;
    feedback: string;
    status: "draft" | "submitted";
    submittedAt: string | null;
    updatedAt: string | null;
  } | null;
};

type PersistReviewResponse = {
  message?: string;
  evaluation?: ReviewDetail["evaluation"];
  reviewStatus?: JudgeReviewStatus;
};

const scoreMeta: {
  key: ScoreKey;
  label: string;
  helper: string;
}[] = [
  {
    key: "innovation",
    label: "Innovation",
    helper: "Originality of the solution and uniqueness of approach.",
  },
  {
    key: "technicalComplexity",
    label: "Technical Complexity",
    helper: "Depth of implementation, architecture, and engineering effort.",
  },
  {
    key: "uiUx",
    label: "UI/UX",
    helper: "Clarity, usability, accessibility, and visual quality.",
  },
  {
    key: "impact",
    label: "Impact",
    helper: "Practical usefulness, relevance, and problem-solving value.",
  },
  {
    key: "presentation",
    label: "Presentation",
    helper: "How clearly the solution is communicated and demonstrated.",
  },
];

function getDraftStatusLabel(status: "draft" | "submitted") {
  return status === "submitted" ? "Submitted" : "Draft";
}

function getSubmissionStatusLabel(status: "draft" | "submitted" | "locked") {
  if (status === "submitted") return "Submitted";
  if (status === "locked") return "Locked";
  return "Draft";
}

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

function formatDateTime(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function JudgeReviewDetailsPage() {
  const params = useParams() as { id?: string | string[] };
  const reviewId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [project, setProject] = useState<ReviewDetail | null>(null);
  const [scores, setScores] = useState<ScoreState>({
    innovation: 0,
    technicalComplexity: 0,
    uiUx: 0,
    impact: 0,
    presentation: 0,
  });
  const [feedback, setFeedback] = useState("");
  const [evaluationState, setEvaluationState] = useState<"draft" | "submitted">(
    "draft"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState<
    "idle" | "dirty" | "saving" | "saved" | "error"
  >("idle");
  const [autosaveError, setAutosaveError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;

    let mounted = true;

    const fetchReviewDetails = async () => {
      try {
        setIsLoading(true);
        setError("");
        setActionMessage("");

        const response = await fetch(`/api/judge/reviews/${reviewId}`, {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | { item?: ReviewDetail; message?: string }
          | null;

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load review details.");
        }

        if (!mounted || !data?.item) return;

        const item = data.item;

        setProject(item);
        setScores({
          innovation: item.evaluation?.innovation ?? 0,
          technicalComplexity: item.evaluation?.technicalComplexity ?? 0,
          uiUx: item.evaluation?.uiUx ?? 0,
          impact: item.evaluation?.impact ?? 0,
          presentation: item.evaluation?.presentation ?? 0,
        });
        setFeedback(item.evaluation?.feedback ?? "");
        setEvaluationState(item.evaluation?.status ?? "draft");
        setLastSavedAt(item.evaluation?.updatedAt ?? null);
        setAutosaveStatus(item.evaluation?.updatedAt ? "saved" : "idle");
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading review details."
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviewDetails();

    return () => {
      mounted = false;
    };
  }, [reviewId]);

  const totalScore = useMemo(
    () =>
      scores.innovation +
      scores.technicalComplexity +
      scores.uiUx +
      scores.impact +
      scores.presentation,
    [scores]
  );

  const completedCriteria = useMemo(
    () => Object.values(scores).filter((value) => value > 0).length,
    [scores]
  );

  const hasUnsavedDraftChanges = useMemo(() => {
    const evaluation = project?.evaluation;
    return (
      (evaluation?.innovation ?? 0) !== scores.innovation ||
      (evaluation?.technicalComplexity ?? 0) !== scores.technicalComplexity ||
      (evaluation?.uiUx ?? 0) !== scores.uiUx ||
      (evaluation?.impact ?? 0) !== scores.impact ||
      (evaluation?.presentation ?? 0) !== scores.presentation ||
      (evaluation?.feedback || "").trim() !== feedback.trim()
    );
  }, [project, scores, feedback]);

  const isReviewLocked = evaluationState === "submitted";

  const saveStatusContent = useMemo(() => {
    if (isReviewLocked) {
      return {
        title: "Submitted review locked",
        description:
          "This review has been submitted. Scores and feedback are now read-only.",
        classes: "border-amber-200 bg-amber-50 text-amber-800",
      };
    }

    if (autosaveStatus === "saving") {
      return {
        title: "Saving draft...",
        description: "Your latest scoring changes are being saved automatically.",
        classes: "border-blue-200 bg-blue-50 text-blue-800",
      };
    }

    if (autosaveStatus === "error") {
      return {
        title: "Auto-save needs attention",
        description: autosaveError || "The latest draft could not be saved.",
        classes: "border-red-200 bg-red-50 text-red-800",
      };
    }

    if (autosaveStatus === "dirty") {
      return {
        title: "Unsaved changes",
        description:
          "Draft auto-save runs after 10 seconds of inactivity while this review is still editable.",
        classes: "border-amber-200 bg-amber-50 text-amber-800",
      };
    }

    if (lastSavedAt) {
      return {
        title: "Draft saved",
        description: `Last saved on ${formatDateTime(lastSavedAt)}.`,
        classes: "border-green-200 bg-green-50 text-green-800",
      };
    }

    return {
      title: "Auto-save ready",
      description:
        "Start scoring and the review draft will save automatically every 10 seconds while you work.",
      classes: "border-gray-200 bg-[#f8f8f9] text-[#3B3C3E]",
    };
  }, [autosaveError, autosaveStatus, isReviewLocked, lastSavedAt]);

  useEffect(() => {
    if (!project || isLoading || isSavingDraft || isSubmittingReview) {
      return;
    }

    if (isReviewLocked) {
      setAutosaveStatus(lastSavedAt ? "saved" : "idle");
      setAutosaveError("");
      return;
    }

    if (!hasUnsavedDraftChanges) {
      setAutosaveStatus(lastSavedAt ? "saved" : "idle");
      setAutosaveError("");
      return;
    }

    setAutosaveStatus("dirty");

    const timeoutId = window.setTimeout(async () => {
      try {
        setAutosaveStatus("saving");
        setAutosaveError("");

        const data = await persistReview("draft");
        const updatedAt = data?.evaluation?.updatedAt || new Date().toISOString();

        setLastSavedAt(updatedAt);
        setAutosaveStatus("saved");
      } catch (err) {
        setAutosaveStatus("error");
        setAutosaveError(
          err instanceof Error ? err.message : "Failed to auto-save review draft."
        );
      }
    }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    feedback,
    hasUnsavedDraftChanges,
    isLoading,
    isReviewLocked,
    isSavingDraft,
    isSubmittingReview,
    lastSavedAt,
    project,
    scores,
  ]);

  const setScore = (key: ScoreKey, value: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const persistReview = async (
    status: "draft" | "submitted",
    confirmSubmittedEdit = false
  ) => {
    if (!project) return null;

    const response = await fetch(`/api/judge/reviews/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...scores,
        feedback,
        status,
        confirmSubmittedEdit,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | PersistReviewResponse
      | null;

    if (!response.ok) {
      throw new Error(data?.message || "Failed to save review.");
    }

    setEvaluationState(data?.evaluation?.status || status);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            reviewStatus: data?.reviewStatus || prev.reviewStatus,
            evaluation: data?.evaluation || prev.evaluation,
          }
        : prev
    );

    return data;
  };

  const handleSaveDraft = async () => {
    if (isReviewLocked) {
      setError("This review is submitted and locked.");
      setActionMessage("");
      return;
    }

    try {
      setIsSavingDraft(true);
      setError("");
      setActionMessage("");
      setAutosaveError("");

      const data = await persistReview("draft");
      const updatedAt = data?.evaluation?.updatedAt || new Date().toISOString();

      setLastSavedAt(updatedAt);
      setAutosaveStatus("saved");
      setActionMessage(data?.message || "Review draft saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save review draft."
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitReview = async () => {
    if (isReviewLocked) {
      setError("This review is already submitted and cannot be edited.");
      setActionMessage("");
      return;
    }

    const allScored = Object.values(scores).every((value) => value > 0);

    if (!allScored) {
      setError("Please score all criteria before submitting the review.");
      setActionMessage("");
      return;
    }

    if (feedback.trim().length < 20) {
      setError("Please add meaningful feedback before submitting the review.");
      setActionMessage("");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setError("");
      setActionMessage("");
      setAutosaveError("");

      const data = await persistReview("submitted");
      const updatedAt = data?.evaluation?.updatedAt || new Date().toISOString();

      setLastSavedAt(updatedAt);
      setAutosaveStatus("saved");
      setActionMessage(
        data?.message || "Review submitted successfully. Further edits are locked."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit review."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
            <div className="animate-pulse">
              <div className="h-12 w-48 rounded-2xl bg-white/15" />
              <div className="mt-5 h-10 w-72 rounded-xl bg-white/15" />
              <div className="mt-5 h-14 w-full max-w-2xl rounded-2xl bg-white/10" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="h-28 animate-pulse rounded-[24px] bg-white/10" />
              <div className="h-28 animate-pulse rounded-[24px] bg-white/10" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="h-6 w-40 rounded-lg bg-gray-200" />
                <div className="mt-4 h-8 w-2/3 rounded-xl bg-gray-200" />
                <div className="mt-4 h-20 w-full rounded-2xl bg-gray-100" />
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="h-6 w-36 rounded-lg bg-gray-200" />
                <div className="mt-4 h-8 w-1/2 rounded-xl bg-gray-200" />
                <div className="mt-5 h-44 w-full rounded-2xl bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && !project) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">
            Unable to load review details
          </h1>
          <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
            >
              Reload Page
            </button>
            <Link
              href="/judge/reviews"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
            >
              Back to Review Queue
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!project) return null;

  const workflowStageDescription =
    project.reviewStatus === "in-progress"
      ? autosaveStatus === "saving"
        ? "Saving the latest draft changes automatically."
        : lastSavedAt
        ? `Draft last updated on ${formatDateTime(lastSavedAt)}.`
        : getJudgeReviewStatusDescription(project.reviewStatus)
      : getJudgeReviewStatusDescription(project.reviewStatus);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <Link
              href="/judge/reviews"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/95 backdrop-blur-sm transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Review Queue
            </Link>

            <div className="mt-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Detailed Project Review
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Review project, score criteria, and submit final judgment.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Carefully inspect the project details, resources, and presentation
              materials before finalizing your evaluation. Each criterion is
              scored out of 10.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Workflow Stage</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {getJudgeReviewStatusLabel(project.reviewStatus)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {workflowStageDescription}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Total Score</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {totalScore} / 50
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {completedCriteria} of 5 criteria scored.
              </p>
            </div>
          </div>
        </div>
      </div>

     

      {(error || actionMessage) && (
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
            {error || actionMessage}
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">
                  Project Overview
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  {project.projectTitle || "Untitled Project"}
                </h2>
                <p className="mt-2 text-sm font-medium text-[#A01C33]">
                  Team: {project.teamName}
                </p>
              </div>

              <div className="space-y-2">
                <div className="rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                  {[project.category, project.difficulty]
                    .filter(Boolean)
                    .join(" • ") || "Details Pending"}
                </div>

                <div className="rounded-2xl bg-[#A01C33]/10 px-4 py-2 text-xs font-semibold text-[#A01C33]">
                  Submission: {getSubmissionStatusLabel(project.submissionStatus)}
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-500">
              {project.description || "No project description available yet."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Selected Problem
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                      {project.selectedProblem}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Tech Stack
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.techStack.length > 0 ? (
                        project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No tech stack added.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Team Members</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Team composition
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33] text-sm font-bold text-white">
                      {member.initials}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-[#3B3C3E]">
                        {member.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {member.role}
                      </p>
                      {member.email && (
                        <p className="mt-2 truncate text-sm text-gray-500">
                          {member.email}
                        </p>
                      )}
                      {member.college && (
                        <p className="mt-1 text-sm text-gray-500">
                          {member.college}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">
              Project Resources
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Links and supporting material
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "GitHub Repository",
                  subtitle: "Open source code link",
                  href: project.githubLink,
                  icon: FolderGit2,
                },
                {
                  title: "Live Demo",
                  subtitle: "Working demo or hosted app",
                  href: project.demoLink,
                  icon: Globe,
                },
                {
                  title: "Presentation Deck",
                  subtitle: "Project PPT submission",
                  href: project.pptLink,
                  icon: Presentation,
                },
                {
                  title: "Video Walkthrough",
                  subtitle: "Demo presentation video",
                  href: project.videoLink,
                  icon: FileVideo,
                },
              ].map((item) => {
                const Icon = item.icon;

                if (!item.href) {
                  return (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-dashed border-gray-200 bg-[#fcfcfd] p-5 opacity-70"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#3B3C3E]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Not provided
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#3B3C3E]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Screenshots</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Attached visual previews
            </h2>

            {project.screenshots.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-6 text-center">
                <p className="text-sm text-gray-500">
                  No screenshots uploaded with this submission.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {project.screenshots.map((shot, index) => (
                  <a
                    key={`${shot}-${index}`}
                    href={shot}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-[22px] border border-gray-200 bg-[#fcfcfd] transition hover:border-[#A01C33]/25 hover:bg-white"
                  >
                    <div className="flex aspect-[16/10] items-center justify-center bg-gray-100">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold text-[#3B3C3E]">
                          Screenshot {index + 1}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Open full preview
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#A01C33]/10 p-2 text-[#A01C33]">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">
              Review Panel
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Score the submission
            </h2>

            <div className={`mt-6 rounded-[22px] border p-5 ${saveStatusContent.classes}`}>
              <p className="text-sm font-semibold">{saveStatusContent.title}</p>
              <p className="mt-2 text-sm leading-6">{saveStatusContent.description}</p>
            </div>

            <div className="mt-6 space-y-5">
              {scoreMeta.map((item) => (
                <div
                  key={item.key}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#3B3C3E]">{item.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {item.helper}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#A01C33]/10 px-3 py-1.5 text-sm font-bold text-[#A01C33]">
                      {scores[item.key]}/10
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const value = index + 1;
                      const active = value <= scores[item.key];

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setScore(item.key, value)}
                          disabled={isReviewLocked}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                            active
                              ? "border-[#A01C33] bg-[#A01C33] text-white"
                              : "border-gray-200 bg-white text-gray-600 hover:border-[#A01C33] hover:text-[#A01C33]"
                          } ${
                            isReviewLocked
                              ? "cursor-not-allowed opacity-60"
                              : ""
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div className="w-full">
                  <h3 className="font-bold text-[#3B3C3E]">Judge Feedback</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Provide constructive remarks for the team. At least 20
                    characters are required for final submission.
                  </p>

                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    disabled={isReviewLocked}
                    rows={6}
                    placeholder="Write your review notes, suggestions, and observations here..."
                    className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-[#A01C33]/20 bg-[#A01C33]/[0.03] p-5">
              <p className="text-sm font-medium text-[#A01C33]">
                Important note
              </p>
              <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                Reviews should be fair, consistent, and aligned with the same
                judging standard used for all submitted projects.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={
                  isSavingDraft || isSubmittingReview || isReviewLocked
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Draft
              </button>

              <button
                onClick={handleSubmitReview}
                disabled={isSavingDraft || isSubmittingReview || isReviewLocked}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingReview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Review
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">
              Judge Reminders
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Evaluation guidelines
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Review all provided material",
                  description:
                    "Check code, demo, presentation, and screenshots before scoring.",
                  icon: FileCode2,
                },
                {
                  title: "Stay aligned with the official criteria",
                  description:
                    "Score only using the approved HackSphere judging dimensions.",
                  icon: BookOpenText,
                },
                {
                  title: "Submit one final review per project",
                  description:
                    "Each assigned project should be evaluated once per judge.",
                  icon: ShieldCheck,
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
                        <h3 className="font-bold text-[#3B3C3E]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[22px] border border-green-200 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">
                      Review lifecycle
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Draft reviews auto-save while you work. Once submitted,
                      the review is locked to preserve final judging records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">
                      Draft save history
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {lastSavedAt
                        ? `Last draft save was recorded on ${formatDateTime(lastSavedAt)}.`
                        : "No previous draft activity has been recorded yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">
              Submission Snapshot
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Quick review details
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  label: "Problem Title",
                  value: project.problemTitle || "Not available",
                },
                {
                  label: "Submitted On",
                  value: formatDate(project.submittedAt),
                },
                {
                  label: "Workflow Stage",
                  value: getJudgeReviewStatusLabel(project.reviewStatus),
                },
                {
                  label: "Draft Status",
                  value: getDraftStatusLabel(evaluationState),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-gray-200 bg-[#fcfcfd] px-4 py-3"
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
          </div>
        </div>
      </div>
    </section>
  );
}
