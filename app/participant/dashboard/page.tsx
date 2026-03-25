"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  FileCode2,
  FolderKanban,
  Lightbulb,
  Trophy,
  Users,
  ClipboardList,
  CalendarClock,
  Sparkles,
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

type ProblemStatementPreview = {
  id?: string;
  _id?: string;
  title: string;
  slug?: string;
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
  problemStatement: ProblemStatementPreview | null;
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
  team?: TeamData;
};

type AnnouncementData = {
  _id: string;
  title: string;
  message: string;
  category?: string;
  pinned: boolean;
  createdAt: string;
};

type LeaderboardEntry = {
  rank: number;
  teamId: string;
  teamName: string;
  averageScore: number;
  reviewsCount: number;
  membersCount?: number;
  status?: string;
  problemTitle?: string;
  submissionId: string;
  submittedAt?: string | null;
  projectTitle?: string;
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

type MySubmissionResponse = {
  success: boolean;
  team: TeamData | null;
  submission: SubmissionData | null;
  message?: string;
};

type AnnouncementsResponse = {
  success: boolean;
  announcements: AnnouncementData[];
  message?: string;
};

type LeaderboardResponse = {
  success: boolean;
  leaderboard?: LeaderboardEntry[];
  items?: LeaderboardEntry[];
  topThree?: LeaderboardEntry[];
  published?: boolean;
  message?: string;
};

const quickActions = [
  {
    title: "Create or Manage Team",
    description:
      "Start a new team, invite members, and manage your participation.",
    href: "/participant/my-team",
    icon: Users,
  },
  {
    title: "Explore Problem Statements",
    description:
      "Browse challenges and pick the best problem for your team.",
    href: "/participant/problems",
    icon: Lightbulb,
  },
  {
    title: "Submit Your Project",
    description:
      "Upload your project details, GitHub link, demo, and tech stack.",
    href: "/participant/submission",
    icon: FolderKanban,
  },
  {
    title: "Check Announcements",
    description:
      "Stay updated with notices, deadlines, and event instructions.",
    href: "/participant/announcements",
    icon: Bell,
  },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function toDisplayText(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "Recently";

  const now = new Date();
  const target = new Date(dateString);

  if (Number.isNaN(target.getTime())) {
    return "Recently";
  }

  const diffInMs = now.getTime() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffInMs < minute) return "Just now";

  if (diffInMs < hour) {
    const minutes = Math.max(1, Math.floor(diffInMs / minute));
    return `${minutes} min ago`;
  }

  if (diffInMs < day) {
    const hours = Math.max(1, Math.floor(diffInMs / hour));
    return `${hours} hr ago`;
  }

  if (diffInMs < 7 * day) {
    const days = Math.max(1, Math.floor(diffInMs / day));
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return target.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatScore(value?: number) {
  const score = Number(value || 0);
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
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

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

export default function ParticipantDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardTopThree, setLeaderboardTopThree] = useState<
    LeaderboardEntry[]
  >([]);
  const [leaderboardPublished, setLeaderboardPublished] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [me, teamRes, submissionRes, announcementsRes, leaderboardRes] =
          await Promise.all([
            fetchJson<AuthMeResponse>("/api/auth/me"),
            fetchJson<MyTeamResponse>("/api/teams/my-team"),
            fetchJson<MySubmissionResponse>("/api/submissions/my"),
            fetchJson<AnnouncementsResponse>("/api/announcements"),
            fetchJson<LeaderboardResponse>("/api/leaderboard"),
          ]);

        if (!isMounted) return;

        const normalizedAnnouncements = [...(announcementsRes.announcements || [])]
          .sort((a, b) => {
            if (a.pinned !== b.pinned) {
              return a.pinned ? -1 : 1;
            }

            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            return bTime - aTime;
          })
          .slice(0, 3);

        const leaderboardRows = Array.isArray(leaderboardRes.leaderboard)
          ? leaderboardRes.leaderboard
          : Array.isArray(leaderboardRes.items)
          ? leaderboardRes.items
          : [];

        const leaderboardPreview = Array.isArray(leaderboardRes.topThree)
          ? leaderboardRes.topThree
          : leaderboardRows.slice(0, 3);

        setUser(me.user);
        setTeam(teamRes.team);
        setSubmission(submissionRes.submission);
        setAnnouncements(normalizedAnnouncements);
        setLeaderboard(leaderboardRows);
        setLeaderboardTopThree(leaderboardPreview);
        setLeaderboardPublished(
          typeof leaderboardRes.published === "boolean"
            ? leaderboardRes.published
            : leaderboardRows.length > 0
        );
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

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const hasUnapprovedParticipants = useMemo(() => {
    if (!team) return false;

    return [team.leader, ...(team.members || [])].some(
      (participant) => participant?.isApproved === false
    );
  }, [team]);

  const currentTeamRank = useMemo(() => {
    if (!team) return null;

    const match = leaderboard.find(
      (item) =>
        item.teamId === team._id ||
        item.teamName.trim().toLowerCase() === team.teamName.trim().toLowerCase()
    );

    return match ? match.rank : null;
  }, [leaderboard, team]);

  const topTeams = useMemo(() => {
    return leaderboardTopThree.length > 0
      ? leaderboardTopThree
      : leaderboard.slice(0, 3);
  }, [leaderboardTopThree, leaderboard]);

  const stats = useMemo(
    () => [
      {
        title: "Team Status",
        value: !team
          ? "Not Joined"
          : team.status === "disqualified"
          ? "Restricted"
          : team.status === "pending"
          ? "Pending"
          : "Active",
        subtext: !team
          ? "Create or join a team to continue"
          : `${team.teamName}${
              hasUnapprovedParticipants ? " • Approval pending" : ""
            }`,
        icon: Users,
      },
      {
        title: "Problem Selected",
        value: team?.problemStatement ? "1" : "0",
        subtext: team?.problemStatement
          ? team.problemStatement.title
          : "No problem statement selected yet",
        icon: Lightbulb,
      },
      {
        title: "Submission Status",
        value: submission ? toDisplayText(submission.status) : "Draft",
        subtext: submission?.projectTitle || "Final project not submitted",
        icon: FolderKanban,
      },
      {
        title: "Leaderboard Rank",
        value:
          leaderboardPublished && currentTeamRank
            ? `#${String(currentTeamRank).padStart(2, "0")}`
            : "--",
        subtext:
          leaderboardPublished && currentTeamRank
            ? `${team?.teamName || "Your team"} is on the board`
            : "Will appear after publishing",
        icon: Trophy,
      },
    ],
    [team, submission, currentTeamRank, leaderboardPublished, hasUnapprovedParticipants]
  );

  const nextStep = useMemo(() => {
    if (!team) {
      return {
        title: "Next recommended step",
        description:
          "Create your team first, then move to the problem statements page to select the challenge your team wants to solve.",
        href: "/participant/my-team",
        linkText: "Go to My Team",
      };
    }

    if (team.status === "disqualified") {
      return {
        title: "Next recommended step",
        description:
          "Your team is currently restricted. Check announcements and contact the organizers if you need clarification.",
        href: "/participant/announcements",
        linkText: "View Announcements",
      };
    }

    if (hasUnapprovedParticipants) {
      return {
        title: "Next recommended step",
        description:
          "Wait until all team participants are approved by admin before selecting a problem statement.",
        href: "/participant/my-team",
        linkText: "Open My Team",
      };
    }

    if (!team.problemStatement) {
      return {
        title: "Next recommended step",
        description:
          "Your team is ready. Now select a problem statement so you can begin preparing your project submission.",
        href: "/participant/problems",
        linkText: "Explore Problems",
      };
    }

    if (!submission) {
      return {
        title: "Next recommended step",
        description:
          "You have a team and selected problem. Start your project submission by adding the project title, links, and tech stack.",
        href: "/participant/submission",
        linkText: "Start Submission",
      };
    }

    if (submission.status === "draft") {
      return {
        title: "Next recommended step",
        description:
          "Your submission is still in draft. Complete the remaining details and submit it before the deadline.",
        href: "/participant/submission",
        linkText: "Complete Submission",
      };
    }

    if (submission.status === "submitted") {
      return {
        title: "Next recommended step",
        description:
          "Your project has been submitted successfully. Keep checking announcements and leaderboard updates from the organizers.",
        href: "/participant/announcements",
        linkText: "View Announcements",
      };
    }

    return {
      title: "Next recommended step",
      description:
        "Your submission is locked. Track announcements and leaderboard changes while awaiting the next stage.",
      href: "/participant/leaderboard",
      linkText: "Open Leaderboard",
    };
  }, [team, submission, hasUnapprovedParticipants]);

  const firstName = user?.name?.split(" ")[0] || "Participant";
  const selectedProblemTitle = team?.problemStatement?.title || "Not selected";
  const projectTitle = submission?.projectTitle?.trim() || "Not added yet";

  const platformStatus = !team
    ? "Ready to Build"
    : team.status === "disqualified"
    ? "Team Restricted"
    : hasUnapprovedParticipants
    ? "Approval Pending"
    : submission
    ? submission.status === "submitted"
      ? "Submission Ready"
      : submission.status === "locked"
      ? "Submission Locked"
      : "In Progress"
    : "In Progress";

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#92192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Powered by HackSphere • Organized by TechTitans
            </div>

            {loading ? (
              <div className="mt-5">
                <SkeletonBlock className="h-10 w-64 bg-white/20" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-white/15" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-white/15" />
              </div>
            ) : (
              <>
                <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Welcome back, {firstName} 👋
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  Manage your team, track your project progress, explore problem
                  statements, and stay updated with important event announcements —
                  all from one participant workspace.
                </p>
              </>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/participant/my-team"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                Manage Team
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/participant/problems"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Explore Problems
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <CalendarClock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Hackathon Window
                  </p>
                  <h3 className="text-lg font-bold text-white">48 Hours</h3>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Platform Status
                  </p>
                  <h3 className="text-lg font-bold text-white">{platformStatus}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full">
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="mt-3 h-8 w-24" />
                    <SkeletonBlock className="mt-2 h-4 w-full" />
                    <SkeletonBlock className="mt-2 h-4 w-3/4" />
                  </div>
                  <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                </div>
              </div>
            ))
          : stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{item.title}</p>
                      <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                        {item.value}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {item.subtext}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Quick Actions</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Continue your workflow
              </h2>
            </div>

            <Link
              href="/participant/problems"
              className="hidden text-sm font-semibold text-[#A01C33] hover:underline sm:inline-block"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition group-hover:bg-[#A01C33] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]">
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-[#A01C33]">Submission Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
            Current project status
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[22px] border border-gray-200 bg-[#fafafa] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Title</p>
                  <h3 className="mt-1 text-lg font-bold text-[#3B3C3E]">
                    {loading ? "Loading..." : projectTitle}
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <FileCode2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-gray-200 bg-[#fafafa] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Selected Problem</p>
                  <h3 className="mt-1 text-lg font-bold text-[#3B3C3E]">
                    {loading ? "Loading..." : selectedProblemTitle}
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
              <p className="text-sm font-medium text-[#A01C33]">
                {nextStep.title}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                {nextStep.description}
              </p>

              <Link
                href={nextStep.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
              >
                {nextStep.linkText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">
                Recent Announcements
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Stay updated
              </h2>
            </div>

            <Link
              href="/participant/announcements"
              className="text-sm font-semibold text-[#A01C33] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="mt-3 h-5 w-2/3" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-5/6" />
                </div>
              ))
            ) : announcements.length > 0 ? (
              announcements.map((item) => (
                <div
                  key={item._id}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                        {toDisplayText(item.category || "general")}
                      </span>
                      <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-gray-500">
                        {item.message}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-xs font-medium text-gray-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-gray-300 bg-[#fafafa] p-5 text-sm text-gray-500">
                No announcements available yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">
                Leaderboard Snapshot
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Top teams
              </h2>
            </div>

            <Link
              href="/participant/leaderboard"
              className="text-sm font-semibold text-[#A01C33] hover:underline"
            >
              Full board
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-[20px] border border-gray-200 bg-[#fcfcfd] px-4 py-4"
                >
                  <div className="flex items-center gap-4">
                    <SkeletonBlock className="h-11 w-11 rounded-2xl" />
                    <div>
                      <SkeletonBlock className="h-4 w-28" />
                      <SkeletonBlock className="mt-2 h-4 w-20" />
                    </div>
                  </div>
                  <div className="text-right">
                    <SkeletonBlock className="h-3 w-12" />
                    <SkeletonBlock className="mt-2 h-5 w-14" />
                  </div>
                </div>
              ))
            ) : !leaderboardPublished ? (
              <div className="rounded-[20px] border border-dashed border-gray-300 bg-[#fafafa] p-5 text-sm text-gray-500">
                Leaderboard is not published yet. Rankings will appear here after
                admin publishes the results.
              </div>
            ) : topTeams.length > 0 ? (
              topTeams.map((item) => (
                <div
                  key={item.teamId}
                  className="flex items-center justify-between rounded-[20px] border border-gray-200 bg-[#fcfcfd] px-4 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33] text-sm font-bold text-white">
                      {String(item.rank).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3B3C3E]">{item.teamName}</h3>
                      <p className="text-sm text-gray-500">
                        {item.reviewsCount} review{item.reviewsCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Score
                    </p>
                    <p className="text-lg font-bold text-[#3B3C3E]">
                      {formatScore(item.averageScore)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-gray-300 bg-[#fafafa] p-5 text-sm text-gray-500">
                Leaderboard is published, but no ranking rows are available yet.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[22px] border border-dashed border-gray-300 bg-[#fafafa] p-4">
            <p className="text-sm leading-7 text-gray-500">
              Final rankings will depend on published judge evaluations and admin
              approval.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}