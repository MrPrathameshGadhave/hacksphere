"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  FileText,
  FolderGit2,
  Globe,
  Image as ImageIcon,
  Lightbulb,
  Presentation,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

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
  createdAt?: string;
  updatedAt?: string;
};

type MySubmissionResponse = {
  success: boolean;
  team: TeamData | null;
  submission: SubmissionData | null;
  message?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSubmissionStatusLabel(status?: SubmissionData["status"]) {
  if (status === "submitted") return "Submitted";
  if (status === "locked") return "Locked";
  return "Draft";
}

function getSubmissionStatusClasses(status?: SubmissionData["status"]) {
  if (status === "submitted") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "locked") {
    return "border-[#ead7de] bg-[#fff4f6] text-[#A01C33]";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
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

export default function ParticipantProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchJson<MySubmissionResponse>("/api/submissions/my");

        if (!isMounted) return;

        setTeam(response.team);
        setSubmission(response.submission);
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

  const actualProjectHref = submission ? `/participant/projects/${submission._id}` : "";
  const selectedProblemHref = team?.problemStatement?.slug
    ? `/participant/problems/${team.problemStatement.slug}`
    : "/participant/problems";
  const teamMembers = team ? [team.leader, ...(team.members || [])] : [];
  const linkItems = [
    {
      label: "GitHub Repository",
      value: submission?.githubLink,
      icon: FolderGit2,
    },
    {
      label: "Live Demo",
      value: submission?.demoLink,
      icon: Globe,
    },
    {
      label: "Presentation Deck",
      value: submission?.pptLink,
      icon: Presentation,
    },
    {
      label: "Video Walkthrough",
      value: submission?.videoLink,
      icon: Video,
    },
  ].filter((item) => item.value);
  const isMismatchedRoute = Boolean(submission && routeId && routeId !== submission._id);
  const submissionStatusLabel = getSubmissionStatusLabel(submission?.status);
  const submissionStatusClasses = getSubmissionStatusClasses(submission?.status);
  const screenshotCount = submission?.images?.length || 0;
  const techStackCount = submission?.techStack?.length || 0;
  const teamSize = teamMembers.length;
  const projectPulseLabel =
    submission?.status === "locked"
      ? "Delivery locked"
      : submission?.status === "submitted"
      ? "Ready for judge review"
      : "Draft still in progress";
  const projectPulseText =
    submission?.status === "locked"
      ? "Your final delivery has been closed for edits and preserved for review integrity."
      : submission?.status === "submitted"
      ? "Your project package is finalized and waiting inside the judging workflow."
      : "Keep refining the brief, resources, and visual proof before you finalize the delivery.";
  const summaryStats = [
    {
      label: "Team attached",
      value: loading ? "..." : String(teamSize || 0),
      helper: "Members",
    },
    {
      label: "Linked assets",
      value: loading ? "..." : String(linkItems.length),
      helper: "Public links",
    },
    {
      label: "Screenshots",
      value: loading ? "..." : String(screenshotCount),
      helper: "Uploaded proof",
    },
    {
      label: "Tech stack",
      value: loading ? "..." : String(techStackCount),
      helper: "Tagged tools",
    },
  ];

  if (!loading && !error && !team) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-[#A01C33]">Project Details</p>
          <h1 className="mt-2 text-3xl font-bold text-[#3B3C3E]">
            No team found yet
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
            Join or create a team first before opening a project details page.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/participant/my-team"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
            >
              <Users className="h-4 w-4" />
              Go to My Team
            </Link>
            <Link
              href="/participant/submission"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
            >
              <ArrowRight className="h-4 w-4" />
              Open Submission Workspace
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && !error && team && !submission) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-[#A01C33]">Project Details</p>
          <h1 className="mt-2 text-3xl font-bold text-[#3B3C3E]">
            No submission has been created yet
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
            Your team exists, but there is no saved project submission yet. Start from
            the submission workspace to add the project title, links, media, and final
            delivery details.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/participant/submission"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
            >
              <FileCode2 className="h-4 w-4" />
              Create Submission
            </Link>
            <Link
              href={selectedProblemHref}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
            >
              <Lightbulb className="h-4 w-4" />
              View Selected Problem
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-[linear-gradient(135deg,#fff8f8_0%,#fff0f0_100%)] px-5 py-4 text-sm text-red-700 shadow-[0_10px_30px_rgba(185,28,28,0.08)]">
          {error}
        </div>
      ) : null}

      {isMismatchedRoute && actualProjectHref ? (
        <div className="rounded-[24px] border border-amber-200 bg-[linear-gradient(135deg,#fff9eb_0%,#fff5dc_100%)] px-5 py-4 text-sm text-amber-800 shadow-[0_10px_30px_rgba(180,83,9,0.08)]">
          This URL does not match your latest team submission.{" "}
          <Link href={actualProjectHref} className="font-semibold underline">
            Open the current submission overview
          </Link>
          .
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[34px] border border-[#ead8dd] bg-[linear-gradient(135deg,#fffdf9_0%,#fff4f2_48%,#fffaf7_100%)] p-6 shadow-[0_28px_80px_rgba(120,67,78,0.12)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#f8dde3] blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-[#fde6db] blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.95fr] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7de] bg-white/85 px-4 py-2 text-sm font-semibold text-[#8d5d6a] shadow-sm">
              <Sparkles className="h-4 w-4 text-[#A01C33]" />
              Project Delivery Record
            </div>

            {loading ? (
              <>
                <SkeletonBlock className="mt-5 h-11 w-80 bg-[#eadfe3]" />
                <SkeletonBlock className="mt-4 h-5 w-52 bg-[#f0e6e8]" />
                <SkeletonBlock className="mt-5 h-4 w-full max-w-2xl bg-[#f0e6e8]" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-[#f0e6e8]" />
              </>
            ) : (
              <>
                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#26161d] sm:text-4xl lg:text-[2.7rem]">
                  {submission?.projectTitle || "Untitled Project"}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                    Team: <span className="text-[#A01C33]">{team?.teamName || "Not available"}</span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${submissionStatusClasses}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {submissionStatusLabel}
                  </div>

                  {team?.problemStatement?.title ? (
                    <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                      Challenge:{" "}
                      <span className="text-[#A01C33]">
                        {team.problemStatement.title}
                      </span>
                    </div>
                  ) : null}
                </div>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-[#5f4d53] sm:text-base">
                  Review the full project story, linked assets, delivery proof, team context,
                  and timeline from one cleaner workspace. The goal here is simple: make the
                  important details easy to scan without losing any useful depth.
                </p>
              </>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/participant/submission"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(160,28,51,0.18)] transition hover:bg-[#8f1a2e]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Submission
              </Link>
              <Link
                href={selectedProblemHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ead7de] bg-white/85 px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                <Lightbulb className="h-4 w-4" />
                View Selected Problem
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-[#eadfe3] bg-white/88 p-6 shadow-[0_16px_36px_rgba(74,36,48,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#8d5d6a]">Project Pulse</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#26161d]">
                    {loading ? "Loading..." : projectPulseLabel}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6f5b62]">
                {loading ? "Checking current delivery stage..." : projectPulseText}
              </p>

              <div className="mt-4 rounded-[20px] border border-[#ead7de] bg-[#fff7f8] px-4 py-3 text-sm text-[#6f5b62]">
                {loading
                  ? "Loading latest activity..."
                  : `Last updated ${formatDateTime(submission?.updatedAt)}.`}
              </div>
            </div>

            <div className="rounded-[26px] border border-[#eadfe3] bg-white/88 p-6 shadow-[0_16px_36px_rgba(74,36,48,0.06)]">
              <p className="text-sm font-medium text-[#8d5d6a]">Delivery Snapshot</p>
              <h3 className="mt-2 text-xl font-bold text-[#26161d]">
                Minor details in one place
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {summaryStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] px-4 py-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9f6b77]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-bold text-[#26161d]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#6f5b62]">
                      {item.helper}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Project Brief</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  What your team is presenting
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5">
              <p className="text-sm leading-7 text-[#5f4d53]">
                {loading
                  ? "Loading project summary..."
                  : submission?.description || "No project description has been added yet."}
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Tech Stack</p>
                  <p className="mt-1 text-sm text-gray-500">
                    The tools and platforms currently attached to this build.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <FileCode2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {loading ? (
                  <>
                    <SkeletonBlock className="h-10 w-24" />
                    <SkeletonBlock className="h-10 w-28" />
                    <SkeletonBlock className="h-10 w-20" />
                  </>
                ) : submission?.techStack?.length ? (
                  submission.techStack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#A01C33]/15 bg-[#A01C33]/[0.04] px-4 py-2 text-sm font-medium text-[#A01C33]"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No tech stack has been listed yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Delivery Assets</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Shared resource links
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Globe className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <>
                  <SkeletonBlock className="h-20 w-full rounded-[22px]" />
                  <SkeletonBlock className="h-20 w-full rounded-[22px]" />
                </>
              ) : linkItems.length ? (
                linkItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.value}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start justify-between gap-4 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#3B3C3E]">{item.label}</h3>
                          <p className="mt-2 break-all text-sm leading-6 text-gray-500">
                            {item.value}
                          </p>
                        </div>
                      </div>

                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                    </a>
                  );
                })
              ) : (
                <div className="rounded-[22px] border border-dashed border-gray-300 bg-[#fcfcfd] p-5 text-sm leading-7 text-gray-500">
                  No public resource links are available yet. Add your repository, demo,
                  presentation, or walkthrough links from the submission workspace.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Visual Proof</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Screenshot gallery
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <ImageIcon className="h-5 w-5" />
              </div>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <SkeletonBlock className="h-48 w-full rounded-[24px]" />
                <SkeletonBlock className="h-48 w-full rounded-[24px]" />
              </div>
            ) : submission?.images?.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {submission.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-[24px] border border-gray-200 bg-[#fcfcfd]"
                  >
                    <img
                      src={image}
                      alt={`Project screenshot ${index + 1}`}
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[22px] border border-dashed border-gray-300 bg-[#fcfcfd] p-5 text-sm leading-7 text-gray-500">
                No screenshots have been uploaded yet for this submission.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Team Attached</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Who is shipping this project
            </h2>

            <div className="mt-6 rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9f6b77]">
                Team Name
              </p>
              <h3 className="mt-2 text-xl font-bold text-[#3B3C3E]">
                {loading ? "Loading..." : team?.teamName || "Not available"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5b62]">
                {loading
                  ? "Loading team structure..."
                  : team?.teamDescription || "No team description has been added yet."}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <>
                  <SkeletonBlock className="h-20 w-full rounded-[22px]" />
                  <SkeletonBlock className="h-20 w-full rounded-[22px]" />
                </>
              ) : (
                teamMembers.map((member, index) => (
                  <div
                    key={member._id}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A01C33]">
                      {index === 0 ? "Leader" : "Member"}
                    </p>
                    <h3 className="mt-2 font-bold text-[#3B3C3E]">{member.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{member.email}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      {member.college || "College not added yet"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Challenge Context</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Selected problem statement
            </h2>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <h3 className="text-lg font-bold text-[#3B3C3E]">
                {loading
                  ? "Loading..."
                  : team?.problemStatement?.title || "No problem selected"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                {loading
                  ? "Loading selected challenge..."
                  : team?.problemStatement?.shortDescription ||
                    "Your team has not selected a problem statement yet."}
              </p>

              {team?.problemStatement ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {team.problemStatement.category ? (
                    <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#3B3C3E]">
                      {team.problemStatement.category}
                    </span>
                  ) : null}
                  {team.problemStatement.difficulty ? (
                    <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#3B3C3E]">
                      {team.problemStatement.difficulty}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <Link
                href={selectedProblemHref}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
              >
                View Problem Statement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Submission Timeline</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Important timestamps
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  label: "Created",
                  value: submission?.createdAt,
                },
                {
                  label: "Last Updated",
                  value: submission?.updatedAt,
                },
                {
                  label: "Final Submitted",
                  value: submission?.submittedAt,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#3B3C3E]">{item.label}</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {loading ? "Loading..." : formatDateTime(item.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
