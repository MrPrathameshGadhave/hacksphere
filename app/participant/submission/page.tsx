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
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLocked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Submission editing is locked. {deadlineText ? `Deadline: ${deadlineText}.` : ""}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Project Submission • Final Delivery Workspace
            </div>

            {loading ? (
              <div className="mt-5">
                <SkeletonBlock className="h-10 w-80 bg-white/20" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-white/15" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-white/15" />
              </div>
            ) : (
              <>
                <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Submit your project with clarity, confidence, and complete details.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
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
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
                <Save className="h-4 w-4" />
              </button>

              <Link
                href={selectedProblemHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                View Selected Problem
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Submission Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "Loading..." : submissionStatusLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {loading
                  ? "Checking current submission..."
                  : submission?.status === "submitted"
                  ? "Your project is submitted successfully."
                  : submission?.status === "locked"
                  ? "Your submitted project is now locked."
                  : "Your final project has not been submitted yet."}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Completion Progress</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {completedCount} / {checklist.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Complete the key requirements before final submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Project Information</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Core submission details
                </h2>
              </div>

              <div className="hidden rounded-2xl bg-[#A01C33]/10 px-4 py-2 text-sm font-semibold text-[#A01C33] sm:block">
                {isLeader ? "Team Leader Access" : "Read Only"}
              </div>
            </div>

            <div className="mt-4 rounded-[20px] border border-dashed border-[#A01C33]/20 bg-[#A01C33]/[0.03] p-4 text-sm text-[#3B3C3E]">
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
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Project Links</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
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
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                      className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                      className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Attachments</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Screenshots and supporting media
            </h2>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] border-2 border-dashed border-gray-300 bg-[#fafafa] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                  Upload project screenshots
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Cloudinary image upload can be connected in the next step.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white opacity-60"
                >
                  <ImagePlus className="h-4 w-4" />
                  Upload Images
                </button>
              </div>

              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Link2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                  Resource link notes
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Keep all links accessible and public for the judges during the
                  review process.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• GitHub repo should be accessible</li>
                  <li>• Demo link should be working</li>
                  <li>• PPT and video links should not require permission requests</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={!canEdit || savingDraft}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {savingDraft ? "Saving Draft..." : "Save as Draft"}
            </button>

            <button
              onClick={() => setFinalSubmitOpen(true)}
              disabled={!canFinalSubmit || submittingFinal}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submission?.status === "submitted"
                ? "Update Final Submission"
                : "Final Submit Project"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Submission Checklist</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Complete before final submit
            </h2>

            <div className="mt-6 space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    item.done
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-[#fcfcfd]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      item.done
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        item.done ? "text-green-700" : "text-[#3B3C3E]"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Selected Problem</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Challenge reference
            </h2>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Problem Status</p>
                  <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                    {loading
                      ? "Loading..."
                      : team?.problemStatement?.title || "Not Selected"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    {loading
                      ? "Checking selected problem..."
                      : team?.problemStatement
                      ? "Your team has selected a problem statement."
                      : "Choose a problem statement before final submission."}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
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

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Important Guidelines</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Before you submit
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Only team leader can submit</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Final submission control is restricted to the team leader.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Drafts can be updated</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Save progress first, then finalize before deadline lock.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">Recommended next step</p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  {!team
                    ? "Create your team first."
                    : team.status === "disqualified"
                    ? "Your team is currently restricted from making a submission."
                    : !team.problemStatement
                    ? "Select a problem statement before final submission."
                    : !isLeader
                    ? "Coordinate with your team leader to complete the final submission."
                    : isLocked
                    ? "Submission editing is locked now. Review the saved final details."
                    : !allRequiredComplete
                    ? "Complete all required fields and links, then do the final submission."
                    : "Everything essential is ready. You can save a draft or submit the final project now."}
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