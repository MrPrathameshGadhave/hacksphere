"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Eye,
  FileCode2,
  FileText,
  FolderGit2,
  FolderKanban,
  Globe,
  Loader2,
  Lock,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import ConfirmActionModal from "@/components/modals/ConfirmActionModal";

type ScoreKey =
  | "innovation"
  | "technicalComplexity"
  | "uiUx"
  | "impact"
  | "presentation";

type ScoreState = Record<ScoreKey, number>;

type ReviewStatus = "pending" | "in-progress" | "reviewed";

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
  reviewStatus: ReviewStatus;
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
  requiresConfirmation?: boolean;
  evaluation?: ReviewDetail["evaluation"];
  reviewStatus?: ReviewStatus;
};

type PersistReviewError = Error & {
  requiresConfirmation?: boolean;
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

function getEvaluationLabel(status: "draft" | "submitted") {
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
  const [showSubmittedUpdateConfirm, setShowSubmittedUpdateConfirm] =
    useState(false);

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

  const hasSubmittedReviewChanges = useMemo(() => {
    if (!project?.evaluation || evaluationState !== "submitted") {
      return false;
    }

    return (
      project.evaluation.innovation !== scores.innovation ||
      project.evaluation.technicalComplexity !== scores.technicalComplexity ||
      project.evaluation.uiUx !== scores.uiUx ||
      project.evaluation.impact !== scores.impact ||
      project.evaluation.presentation !== scores.presentation ||
      (project.evaluation.feedback || "").trim() !== feedback.trim()
    );
  }, [project, evaluationState, scores, feedback]);

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
      const typedError = new Error(
        data?.message || "Failed to save review."
      ) as PersistReviewError;

      if (data?.requiresConfirmation) {
        typedError.requiresConfirmation = true;
      }

      throw typedError;
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
    try {
      setIsSavingDraft(true);
      setError("");
      setActionMessage("");

      const data = await persistReview("draft");
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

    if (evaluationState === "submitted") {
      if (!hasSubmittedReviewChanges) {
        setError("");
        setActionMessage("No changes detected in the submitted review.");
        return;
      }

      setError("");
      setActionMessage("");
      setShowSubmittedUpdateConfirm(true);
      return;
    }

    try {
      setIsSubmittingReview(true);
      setError("");
      setActionMessage("");

      const data = await persistReview("submitted");
      setActionMessage(data?.message || "Review submitted successfully.");
    } catch (err) {
      const typedError = err as PersistReviewError;

      if (typedError?.requiresConfirmation) {
        setError("");
        setActionMessage("");
        setShowSubmittedUpdateConfirm(true);
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to submit review."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleConfirmSubmittedReviewUpdate = async () => {
    try {
      setIsSubmittingReview(true);
      setError("");
      setActionMessage("");

      const data = await persistReview("submitted", true);
      setShowSubmittedUpdateConfirm(false);
      setActionMessage(
        data?.message || "Submitted review updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update submitted review."
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
              Detailed Project Evaluation
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
              <p className="text-sm font-medium text-white/80">Review Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {getEvaluationLabel(evaluationState)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {evaluationState === "submitted"
                  ? "This review is already submitted. Updating it will require confirmation."
                  : "Save draft first, then submit final review."}
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
                  icon: Github,
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
              Evaluation Panel
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Score the submission
            </h2>

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
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                            active
                              ? "border-[#A01C33] bg-[#A01C33] text-white"
                              : "border-gray-200 bg-white text-gray-600 hover:border-[#A01C33] hover:text-[#A01C33]"
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
                    rows={6}
                    placeholder="Write your review notes, suggestions, and observations here..."
                    className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33]"
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
                  isSavingDraft || isSubmittingReview || evaluationState === "submitted"
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
                disabled={isSavingDraft || isSubmittingReview}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingReview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {evaluationState === "submitted"
                  ? "Update Review"
                  : "Submit Review"}
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
                      Submitted reviews can still be corrected, but only after
                      explicit confirmation to avoid accidental score changes.
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
                      Current evaluation state
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {project.evaluation?.updatedAt
                        ? `Last updated on ${formatDate(
                            project.evaluation.updatedAt
                          )}.`
                        : "No previous evaluation activity recorded yet."}
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
    label: "Current Review State",
    value: getEvaluationLabel(evaluationState),
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

      <ConfirmActionModal
        open={showSubmittedUpdateConfirm}
        onClose={() => {
          if (isSubmittingReview) return;
          setShowSubmittedUpdateConfirm(false);
        }}
        onConfirm={handleConfirmSubmittedReviewUpdate}
        title="Update Submitted Review?"
        description="This review has already been submitted. Updating it will change the final evaluation score and feedback for this project. Do you want to continue?"
        confirmText="Yes, Update Review"
        cancelText="Cancel"
        variant="warning"
        loading={isSubmittingReview}
      />
    </section>
  );
}