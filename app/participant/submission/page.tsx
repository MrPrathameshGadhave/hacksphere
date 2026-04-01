"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
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
  ImagePlus,
  Lightbulb,
  Link2,
  Loader2,
  Lock,
  Presentation,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";

import ConfirmActionModal from "@/components/modals/ConfirmActionModal";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { DeadlineCountdown } from "@/components/common/DeadlineCountdown";
import {
  formatSubmissionDeadline,
  isSubmissionDeadlinePassed,
} from "@/lib/hackathon";

type SubmissionForm = {
  projectTitle: string;
  description: string;
  githubLink: string;
  demoLink: string;
  pptLink: string;
  videoLink: string;
  techStack: string;
  images: string[];
};

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  college?: string;
  avatar?: string;
  role?: "participant" | "judge" | "admin";
  isApproved?: boolean;
};

type TeamProblemPreview = {
  id?: string;
  _id?: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  category?: string;
  difficulty?: string;
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

type SubmissionData = {
  _id: string;
  projectTitle: string;
  description?: string;
  githubLink?: string;
  demoLink?: string;
  pptLink?: string;
  videoLink?: string;
  images?: string[];
  techStack?: string[];
  status: "draft" | "submitted" | "locked";
  submittedAt?: string | null;
};

type AuthMeResponse = {
  success: boolean;
  user: BasicUser;
  message?: string;
};

type MySubmissionResponse = {
  success: boolean;
  team: TeamData | null;
  submission: SubmissionData | null;
  message?: string;
};

type SubmissionMutationResponse = {
  success: boolean;
  message?: string;
  submission: SubmissionData;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
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

function toFormValues(submission: SubmissionData | null): SubmissionForm {
  return {
    projectTitle: submission?.projectTitle || "",
    description: submission?.description || "",
    githubLink: submission?.githubLink || "",
    demoLink: submission?.demoLink || "",
    pptLink: submission?.pptLink || "",
    videoLink: submission?.videoLink || "",
    techStack: submission?.techStack?.join(", ") || "",
    images: submission?.images || [],
  };
}

export default function ParticipantSubmissionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);

  const [formData, setFormData] = useState<SubmissionForm>({
    projectTitle: "",
    description: "",
    githubLink: "",
    demoLink: "",
    pptLink: "",
    videoLink: "",
    techStack: "",
    images: [],
  });

  const [finalSubmitOpen, setFinalSubmitOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const [me, submissionRes] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<MySubmissionResponse>("/api/submissions/my"),
        ]);

        if (!isMounted) return;

        setUser(me.user);
        setTeam(submissionRes.team);
        setSubmission(submissionRes.submission);
        setFormData(toFormValues(submissionRes.submission));
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const checklist = useMemo(
    () => [
      {
        label: "Project title added",
        done: formData.projectTitle.trim().length > 2,
      },
      {
        label: "Project description added",
        done: formData.description.trim().length > 20,
      },
      {
        label: "GitHub repository linked",
        done: formData.githubLink.trim().length > 0,
      },
      {
        label: "Demo link added",
        done: formData.demoLink.trim().length > 0,
      },
      {
        label: "Tech stack mentioned",
        done: formData.techStack.trim().length > 0,
      },
    ],
    [formData]
  );

  const completedCount = checklist.filter((item) => item.done).length;
  const allRequiredComplete = checklist.every((item) => item.done);

  const isLeader = useMemo(() => {
    if (!user || !team) return false;
    return team.leader?._id === user._id;
  }, [user, team]);

  const deadlinePassed = isSubmissionDeadlinePassed();
  const deadlineText = formatSubmissionDeadline();

  const isLocked = deadlinePassed || submission?.status === "locked";

  const canEdit =
    !!team &&
    team.status !== "disqualified" &&
    !!team.problemStatement &&
    isLeader &&
    !isLocked &&
    !loading;

  const canFinalSubmit = canEdit && allRequiredComplete;

  const selectedProblemHref = team?.problemStatement?.slug
    ? `/participant/problems/${team.problemStatement.slug}`
    : "/participant/problems";

  const submissionStatusLabel = submission
    ? submission.status === "locked"
      ? "Locked"
      : submission.status === "submitted"
      ? "Submitted"
      : "Draft"
    : "Draft";

  const helperMessage = !team
    ? "Create your team first before preparing the submission."
    : team.status === "disqualified"
    ? "Your team is currently restricted from editing or submitting a project."
    : !team.problemStatement
    ? "Select a problem statement before preparing the submission."
    : !isLeader
    ? "Only the team leader can edit and submit the final project."
    : isLocked
    ? deadlineText
      ? `Submission editing is locked because the deadline passed on ${deadlineText}.`
      : "Submission editing is locked because the deadline has passed."
    : !allRequiredComplete
    ? "Complete all required fields first. You can still save progress as a draft anytime."
    : "You can save progress as draft and submit finally when ready.";
  const completionPercent = Math.round((completedCount / checklist.length) * 100);
  const statusDescription = loading
    ? "Checking current submission..."
    : submission?.status === "submitted"
    ? "Your project is submitted successfully."
    : submission?.status === "locked"
    ? "Your submitted project is now locked."
    : "Your final project has not been submitted yet.";
  const nextActionTitle = !team
    ? "Create your team"
    : team.status === "disqualified"
    ? "Submission access restricted"
    : !team.problemStatement
    ? "Select your challenge"
    : !isLeader
    ? "Coordinate with your leader"
    : isLocked
    ? "Submission is locked"
    : !allRequiredComplete
    ? "Complete the required fields"
    : submission?.status === "submitted"
    ? "Review and refine final details"
    : "Finalize your project delivery";
  const nextActionDescription = !team
    ? "Open your team workspace first before preparing the final project package."
    : team.status === "disqualified"
    ? "This team cannot edit or submit a project right now."
    : !team.problemStatement
    ? "Lock a problem statement first so the submission is tied to the correct challenge."
    : !isLeader
    ? "Only the team leader can edit and submit the final project package."
    : isLocked
    ? deadlineText
      ? `Editing is locked because the deadline passed on ${deadlineText}.`
      : "Editing is locked because the submission deadline has passed."
    : !allRequiredComplete
    ? "Finish the essential title, description, repository, demo, and tech stack details before final submit."
    : "Everything essential is in place. Save a last draft if needed, then submit with confidence.";

  const handleSaveDraft = async () => {
    if (!canEdit) return;

    try {
      setSavingDraft(true);
      setError(null);

      const payload = {
        ...formData,
        status: "draft",
      };

      const response = submission
        ? await sendJson<SubmissionMutationResponse>(
            `/api/submissions/${submission._id}`,
            "PATCH",
            payload
          )
        : await sendJson<SubmissionMutationResponse>(
            "/api/submissions/create",
            "POST",
            payload
          );

      setSubmission(response.submission);
      setFormData(toFormValues(response.submission));
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!canFinalSubmit) return;

    try {
      setSubmittingFinal(true);
      setError(null);

      const payload = {
        ...formData,
        status: "submitted",
      };

      const response = submission
        ? await sendJson<SubmissionMutationResponse>(
            `/api/submissions/${submission._id}`,
            "PATCH",
            payload
          )
        : await sendJson<SubmissionMutationResponse>(
            "/api/submissions/create",
            "POST",
            payload
          );

      setSubmission(response.submission);
      setFormData(toFormValues(response.submission));
      setFinalSubmitOpen(false);
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "UNAUTHORIZED") {
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setSubmittingFinal(false);
    }
  };

  return (
    <section className="space-y-8 pb-4">
      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-[linear-gradient(135deg,#fff7f7_0%,#fff0f0_100%)] px-5 py-4 text-sm text-red-700 shadow-[0_12px_30px_rgba(239,68,68,0.08)]">
          {error}
        </div>
      ) : null}

      {isLocked ? (
        <div className="rounded-[24px] border border-amber-200 bg-[linear-gradient(135deg,#fff9ec_0%,#fff3d9_100%)] px-5 py-4 text-sm text-amber-800 shadow-[0_12px_30px_rgba(245,158,11,0.08)]">
          Submission editing is locked. {deadlineText ? `Deadline: ${deadlineText}.` : ""}
        </div>
      ) : null}

      {!isLocked && !loading ? (
        <div className="rounded-[26px] border border-[#ece7ea] bg-white/92 px-5 py-4 shadow-[0_16px_36px_rgba(45,32,39,0.08)]">
          <DeadlineCountdown />
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[34px] border border-[#ead9df] bg-[linear-gradient(135deg,#fffdf8_0%,#fff4f0_38%,#f6f9fd_100%)] p-6 shadow-[0_28px_80px_rgba(100,48,63,0.12)] sm:p-8 lg:p-10">
        <div className="absolute inset-y-0 right-[-12%] w-[24rem] rounded-full bg-[#f8d8df]/60 blur-3xl" />
        <div className="absolute left-[-6%] top-[-18%] h-48 w-48 rounded-full bg-[#fff6cf]/70 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[0px] font-semibold uppercase tracking-[0.24em] text-[#8f4250]">
              <span className="rounded-full border border-[#e7ced5] bg-white/80 px-3 py-1.5 text-[11px] shadow-sm">
                Project Submission
              </span>
              <span className="rounded-full border border-[#e7ced5] bg-white/80 px-3 py-1.5 text-[11px] shadow-sm">
                Final Delivery
              </span>
              <span className="rounded-full border border-[#ecdcb3] bg-[#fff8d8] px-3 py-1.5 text-[11px] text-[#8a6822] shadow-sm">
                Judge Review Ready
              </span>
              Project Submission • Final Delivery Workspace
            </div>

            {loading ? (
              <div className="mt-5">
                <SkeletonBlock className="h-10 w-80 bg-[#ead9df]" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-[#efe6e9]" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-[#efe6e9]" />
              </div>
            ) : (
              <>
                <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-[#261b1f] sm:text-4xl lg:text-[2.9rem]">
                  Deliver your project with clarity, confidence, and judge-ready detail.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5960] sm:text-base">
                  Add your project title, description, repository, demo links, tech
                  stack, and supporting resources so judges can review your work
                  properly and fairly.
                </p>
              </>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={!canEdit || savingDraft}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5 hover:bg-[#8d1930] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
                <Save className="h-4 w-4" />
              </button>

              <Link
                href={selectedProblemHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#e3d3d9] bg-white/80 px-5 py-3 text-sm font-semibold text-[#402e34] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d6b8c0] hover:bg-white"
              >
                View Selected Problem
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/75 bg-white/82 p-5 shadow-[0_16px_40px_rgba(61,35,42,0.08)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#8f4250]">Delivery status</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#251b20]">
                    {loading ? "Loading..." : submissionStatusLabel}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7eef1] text-[#A01C33]">
                  <Send className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#f3e8eb]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#A01C33_0%,#c76a5f_100%)] transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-[#4c3940]">
                  {completionPercent}% submission completeness
                </span>
                <span className="rounded-full bg-[#f7eef1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4250]">
                  {isLeader ? "Editable" : "Read Only"}
                </span>
              </div>

              <div className="mt-5 rounded-[24px] border border-[#efe2e6] bg-[#fcf8f9] p-4">
                <p className="text-sm font-semibold text-[#251b20]">
                  {nextActionTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#655d62]">
                  {nextActionDescription}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                  Completion
                </p>
                <p className="mt-2 text-lg font-semibold text-[#241a1f]">
                  {completedCount} / {checklist.length}
                </p>
                <p className="mt-1 text-sm text-[#625a60]">
                  Required submission items currently completed.
                </p>
              </div>

              <div className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                  Selected problem
                </p>
                <p className="mt-2 text-lg font-semibold text-[#241a1f]">
                  {loading ? "Loading..." : team?.problemStatement ? "Linked" : "Pending"}
                </p>
                <p className="mt-1 text-sm text-[#625a60]">
                  {loading
                    ? "Checking challenge..."
                    : team?.problemStatement?.title || "Choose a problem before final submission."}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4250]">
                  Control
                </p>
                <p className="mt-2 text-lg font-semibold text-[#241a1f]">
                  {isLeader ? "Leader Access" : "Member View"}
                </p>
                <p className="mt-1 text-sm text-[#625a60]">
                  {isLeader
                    ? "You own draft saves and final submission."
                    : "Only the team leader can deliver the final project."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8f4250]">Project Information</p>
                <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
                  Core submission details
                </h2>
              </div>

              <div className="hidden rounded-2xl bg-[#f7eef1] px-4 py-2 text-sm font-semibold text-[#A01C33] sm:block">
                {isLeader ? "Team Leader Access" : "Read Only"}
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-dashed border-[#ecd7de] bg-[#fcf4f6] p-4 text-sm text-[#3d3136]">
              {helperMessage}
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label
                  htmlFor="projectTitle"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Project Title
                </label>
                <div className="relative">
                  <FileCode2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="projectTitle"
                    name="projectTitle"
                    type="text"
                    placeholder="Enter your final project title"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    disabled={!canEdit}
                  className="h-[54px] w-full rounded-2xl border border-[#e6dde1] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#f8f5f6]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Project Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Explain your project idea, problem being solved, core features, technical approach, and expected impact..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full rounded-2xl border border-[#e6dde1] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#f8f5f6]"
                />
              </div>

              <div>
                <label
                  htmlFor="techStack"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Tech Stack
                </label>
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="techStack"
                    name="techStack"
                    type="text"
                    placeholder="Example: Next.js, Node.js, MongoDB, Tailwind CSS"
                    value={formData.techStack}
                    onChange={handleChange}
                    disabled={!canEdit}
                  className="h-[54px] w-full rounded-2xl border border-[#e6dde1] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#f8f5f6]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
            <p className="text-sm font-medium text-[#8f4250]">Project Links</p>
            <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
              Add important resources
            </h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label
                  htmlFor="githubLink"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  GitHub Repository Link
                </label>
                <div className="relative">
                  <FolderGit2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="githubLink"
                    name="githubLink"
                    type="text"
                    placeholder="https://github.com/your-team/project"
                    value={formData.githubLink}
                    onChange={handleChange}
                    disabled={!canEdit}
                    className="h-[54px] w-full rounded-2xl border border-[#e6dde1] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#f8f5f6]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="demoLink"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Demo / Live Project Link
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="demoLink"
                    name="demoLink"
                    type="text"
                    placeholder="https://your-demo-link.com"
                    value={formData.demoLink}
                    onChange={handleChange}
                    disabled={!canEdit}
                    className="h-[54px] w-full rounded-2xl border border-[#e6dde1] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#f8f5f6]"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="pptLink"
                    className="mb-2 block text-sm font-semibold text-[#374151]"
                  >
                    PPT Link
                  </label>
                  <div className="relative">
                    <Presentation className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="pptLink"
                      name="pptLink"
                      type="text"
                      placeholder="Optional presentation link"
                      value={formData.pptLink}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="h-[54px] w-full rounded-2xl border border-[#e6dde1] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#f8f5f6]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="videoLink"
                    className="mb-2 block text-sm font-semibold text-[#374151]"
                  >
                    Video Demo Link
                  </label>
                  <div className="relative">
                    <FileVideo className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="videoLink"
                      name="videoLink"
                      type="text"
                      placeholder="Optional video walkthrough link"
                      value={formData.videoLink}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="h-[54px] w-full rounded-2xl border border-[#e6dde1] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#f8f5f6]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
            <p className="text-sm font-medium text-[#8f4250]">Attachments</p>
            <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
              Screenshots and supporting media
            </h2>

            <div className="mt-6">
              <ImageUpload
                onImagesChange={(images) =>
                  setFormData((prev) => ({ ...prev, images }))
                }
                currentImages={formData.images}
                maxImages={5}
                maxSizePerImage={5}
                disabled={!canEdit}
              />
            </div>

            <div className="mt-8 rounded-[26px] border border-[#ece7ea] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f7_100%)] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#A01C33] shadow-sm">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#261b1f]">
                Resource link notes
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#625a60]">
                Keep all links accessible and public for the judges during the
                review process.
              </p>

              <ul className="hidden mt-4 space-y-2 text-sm text-[#625a60]">
                <li>• GitHub repo should be accessible</li>
                <li>• Demo link should be working</li>
                <li>• PPT and video links should not require permission requests</li>
                <li>• Screenshots help judges understand your UI/UX design</li>
              </ul>
              <ul className="mt-4 space-y-2 text-sm text-[#625a60]">
                <li>- GitHub repo should be accessible</li>
                <li>- Demo link should be working</li>
                <li>- PPT and video links should not require permission requests</li>
                <li>- Screenshots help judges understand your UI/UX design</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={!canEdit || savingDraft}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#e2d8dd] bg-white px-5 py-3 text-sm font-semibold text-[#352b30] transition hover:-translate-y-0.5 hover:border-[#d6b8c0] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {savingDraft ? "Saving Draft..." : "Save as Draft"}
            </button>

            <button
              onClick={() => setFinalSubmitOpen(true)}
              disabled={!canFinalSubmit || submittingFinal}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(160,28,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#8d1930] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submission?.status === "submitted"
                ? "Update Final Submission"
                : "Final Submit Project"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
            <p className="text-sm font-medium text-[#8f4250]">Submission Checklist</p>
            <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
              Complete before final submit
            </h2>

            <div className="mt-6 space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    item.done
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-[#ece7ea] bg-[linear-gradient(135deg,#ffffff_0%,#fff9fb_100%)]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      item.done
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#f7eef1] text-[#b38a95]"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        item.done ? "text-emerald-700" : "text-[#261b1f]"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
            <p className="text-sm font-medium text-[#8f4250]">Selected Problem</p>
            <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
              Challenge reference
            </h2>

            <div className="mt-6 rounded-[24px] border border-[#ece7ea] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f7_100%)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6d5960]">Problem Status</p>
                  <h3 className="mt-2 text-lg font-bold text-[#261b1f]">
                    {loading
                      ? "Loading..."
                      : team?.problemStatement?.title || "Not Selected"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#625a60]">
                    {loading
                      ? "Checking selected problem..."
                      : team?.problemStatement
                      ? "Your team has selected a problem statement."
                      : "Choose a problem statement before final submission."}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#A01C33] shadow-sm">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>

              <Link
                href={selectedProblemHref}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
              >
                {team?.problemStatement ? "View Selected Problem" : "Go to Problem Statements"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#ece7ea] bg-white/92 p-6 shadow-[0_22px_60px_rgba(45,32,39,0.08)] backdrop-blur sm:p-7">
            <p className="text-sm font-medium text-[#8f4250]">Important Guidelines</p>
            <h2 className="mt-1 text-2xl font-bold text-[#261b1f]">
              Before you submit
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-[#ece7ea] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f7_100%)] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#A01C33] shadow-sm">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#261b1f]">Only team leader can submit</h3>
                    <p className="mt-1 text-sm leading-6 text-[#625a60]">
                      Final submission control is restricted to the team leader.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#ece7ea] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f7_100%)] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#A01C33] shadow-sm">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#261b1f]">Drafts can be updated</h3>
                    <p className="mt-1 text-sm leading-6 text-[#625a60]">
                      Save progress first, then finalize before deadline lock.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-dashed border-[#ecd7de] bg-[#fcf4f6] p-5">
                <p className="text-sm font-medium text-[#8f4250]">Recommended next step</p>
                <p className="mt-2 text-sm leading-7 text-[#3d3136]">
                  {nextActionDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={finalSubmitOpen}
        onClose={() => setFinalSubmitOpen(false)}
        onConfirm={handleFinalSubmit}
        title="Final submit project"
        description="This will mark your project as the final submission for judge review. You can still update it only until the submission deadline is reached."
        confirmText="Submit Project"
        cancelText="Cancel"
        variant="warning"
        loading={submittingFinal}
      />
    </section>
  );
}
