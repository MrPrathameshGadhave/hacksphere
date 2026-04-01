"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bell,
  FileCode2,
  Flag,
  FolderKanban,
  Lightbulb,
  Medal,
  Rocket,
  Trophy,
  Users,
  ClipboardList,
  CalendarClock,
  ShieldCheck,
  Target,
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
    title: "Lead The Team",
    description:
      "Handle invites, confirm membership, and keep your build squad synchronized.",
    href: "/participant/my-team",
    icon: Users,
    accent: "from-[#A01C33] via-[#8d1730] to-[#771326]",
  },
  {
    title: "Select The Right Challenge",
    description:
      "Compare active problem statements and lock in the one your team can win with.",
    href: "/participant/problems",
    icon: Lightbulb,
    accent: "from-[#132238] via-[#18314f] to-[#1d3f68]",
  },
  {
    title: "Ship The Submission",
    description:
      "Manage project links, screenshots, and your final delivery before the deadline.",
    href: "/participant/submission",
    icon: FolderKanban,
    accent: "from-[#12624b] via-[#19715a] to-[#20806a]",
  },
  {
    title: "Track Event Signals",
    description:
      "Stay ahead of changes with organizer announcements, updates, and published results.",
    href: "/participant/announcements",
    icon: Bell,
    accent: "from-[#6a4a14] via-[#7b5818] to-[#8f661d]",
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

function formatRank(rank?: number | null) {
  if (!rank) return "--";
  return `#${String(rank).padStart(2, "0")}`;
}

function getTeamStatusLabel(team: TeamData | null) {
  if (!team) return "Not Joined";
  if (team.status === "disqualified") return "Restricted";
  if (team.status === "pending") return "Pending";
  return "Active";
}

function getSubmissionStatusLabel(submission: SubmissionData | null) {
  if (!submission) return "No Draft";
  if (submission.status === "locked") return "Locked";
  if (submission.status === "submitted") return "Submitted";
  return "Draft";
}

function getRankTone(rank: number) {
  if (rank === 1) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (rank === 2) {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (rank === 3) {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-gray-200 bg-[#fcfcfd] text-[#3B3C3E]";
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
        value: getTeamStatusLabel(team),
        subtext: !team
          ? "Create or join a team to unlock the workflow."
          : `${team.teamName}${
              hasUnapprovedParticipants ? " pending admin approval" : ""
            }`,
        icon: Users,
      },
      {
        title: "Problem Selection",
        value: team?.problemStatement ? "Locked In" : "Open",
        subtext: team?.problemStatement
          ? team.problemStatement.title
          : "No problem statement selected yet.",
        icon: Lightbulb,
      },
      {
        title: "Submission Status",
        value: getSubmissionStatusLabel(submission),
        subtext: submission?.projectTitle || "Project delivery not started yet.",
        icon: FolderKanban,
      },
      {
        title: "Leaderboard Rank",
        value:
          leaderboardPublished && currentTeamRank
            ? formatRank(currentTeamRank)
            : "--",
        subtext:
          leaderboardPublished && currentTeamRank
            ? `${team?.teamName || "Your team"} is currently ranked.`
            : "Ranking appears after results are published.",
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
  const selectedProblemTitle = team?.problemStatement?.title || "Not selected yet";
  const projectTitle = submission?.projectTitle?.trim() || "Untitled draft";

  const platformStatus = !team
    ? "Ready To Build"
    : team.status === "disqualified"
    ? "Team Restricted"
    : hasUnapprovedParticipants
    ? "Approval Pending"
    : submission
    ? submission.status === "submitted"
      ? "Submission Ready"
      : submission.status === "locked"
      ? "Submission Locked"
      : "Build In Progress"
    : "Build In Progress";

  const currentProjectHref = submission
    ? `/participant/projects/${submission._id}`
    : "/participant/submission";
  const highlightAnnouncement = announcements[0] || null;
  const completionScore =
    [
      Boolean(team) && team?.status !== "disqualified",
      Boolean(team?.problemStatement),
      Boolean(submission),
      submission?.status === "submitted" || submission?.status === "locked",
    ].filter(Boolean).length * 25;
  const workflowStages = [
    {
      label: "Team",
      description: team ? team.teamName : "Create or join your team",
      complete: Boolean(team) && team?.status !== "disqualified",
      active: !team,
    },
    {
      label: "Challenge",
      description: team?.problemStatement?.title || "Select a problem statement",
      complete: Boolean(team?.problemStatement),
      active:
        Boolean(team) &&
        team?.status !== "disqualified" &&
        !hasUnapprovedParticipants &&
        !team?.problemStatement,
    },
    {
      label: "Build",
      description: submission
        ? getSubmissionStatusLabel(submission)
        : "Start your project draft",
      complete: Boolean(submission),
      active:
        Boolean(team?.problemStatement) &&
        team?.status !== "disqualified" &&
        !submission,
    },
    {
      label: "Finalize",
      description:
        submission?.status === "submitted" || submission?.status === "locked"
          ? "Ready for judging"
          : "Submit the final delivery",
      complete:
        submission?.status === "submitted" || submission?.status === "locked",
      active: Boolean(submission) && submission?.status === "draft",
    },
  ];
  const spotlightCards = [
    {
      title: "Team",
      value: team?.teamName || "No team yet",
      meta: team
        ? `${team.members.length + 1} / ${team.maxSize} members configured`
        : "Set up your collaboration unit",
      icon: Users,
    },
    {
      title: "Problem",
      value: selectedProblemTitle,
      meta: team?.problemStatement
        ? "Challenge is already locked in"
        : "No challenge selected yet",
      icon: Target,
    },
    {
      title: "Project",
      value: submission?.projectTitle || "Draft not started",
      meta: submission
        ? `Current status: ${getSubmissionStatusLabel(submission)}`
        : "Open the submission studio to begin",
      icon: FileCode2,
    },
    {
      title: "Rank",
      value:
        leaderboardPublished && currentTeamRank
          ? formatRank(currentTeamRank)
          : "Pending",
      meta: leaderboardPublished
        ? "Results are published"
        : "Ranking unlocks after publishing",
      icon: Medal,
    },
  ];

  return (
    <section className="space-y-8">
      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      ) : null}

      <div className="animate-fade-in-up relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#fffdf8_0%,#fff6f8_40%,#f6f9fc_100%)] px-6 py-7 text-[#1f2937] shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="animate-spotlight absolute left-[-8%] top-[-18%] h-72 w-72 rounded-full bg-[#A01C33]/12 blur-3xl" />
        <div className="animate-spotlight absolute right-[-6%] top-[8%] h-72 w-72 rounded-full bg-[#d4a857]/16 blur-3xl" />
        <div className="animate-float-soft absolute bottom-[-18%] left-[38%] h-64 w-64 rounded-full bg-[#295587]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(160,28,51,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(160,28,51,0.05)_1px,transparent_1px)] bg-[size:46px_46px] opacity-[0.32]" />

        <div className="relative grid gap-8 xl:grid-cols-[1.25fr_0.95fr] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-[0px]">
              Powered by HackSphere • Organized by TechTitans
              <span className="inline-flex items-center gap-2 rounded-full border border-[#A01C33]/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#A01C33] backdrop-blur-sm">
                <Rocket className="h-4 w-4" />
                Participant Mission Control
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1f2937]/10 bg-[#1f2937]/[0.04] px-4 py-2 text-sm font-medium text-[#1f2937]/75">
                <ShieldCheck className="h-4 w-4 text-[#A01C33]" />
                {platformStatus}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4a857]/20 bg-[#d4a857]/10 px-4 py-2 text-sm font-medium text-[#7b5818]">
                <CalendarClock className="h-4 w-4" />
                48 Hour Build Window
              </span>
            </div>

            {loading ? (
              <div className="mt-6">
                <SkeletonBlock className="h-12 w-72 bg-[#e8eaee]" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl bg-[#eceff3]" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-xl bg-[#eceff3]" />
              </div>
            ) : (
              <>
                <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-[#1f2937] sm:text-5xl">
                  Build like a serious team, deliver like a world-class product.
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4b5563] sm:text-base">
                  Welcome back, {firstName}. This workspace keeps your team,
                  challenge, delivery status, and competition signals aligned so you
                  always know the smartest next move.
                </p>
              </>
            )}

            <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {workflowStages.map((stage, index) => (
                <div
                  key={stage.label}
                  className={`rounded-[24px] border p-4 backdrop-blur-sm transition ${
                    stage.complete
                      ? "border-emerald-200 bg-emerald-50/90"
                      : stage.active
                      ? "border-[#A01C33]/15 bg-white/90"
                      : "border-white/70 bg-white/72"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                      Step {index + 1}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        stage.complete
                          ? "bg-emerald-100 text-emerald-700"
                          : stage.active
                          ? "bg-[#A01C33]/10 text-[#A01C33]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {stage.complete ? "Done" : stage.active ? "Live" : "Next"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#1f2937]">
                    {stage.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#5b6472]">
                    {stage.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={nextStep.href}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
              >
                {nextStep.linkText}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/participant/submission"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Open Submission Studio
              </Link>

              <Link
                href="/participant/leaderboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-transparent px-5 py-3 text-sm font-semibold text-[#5b6472] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Competition Standings
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[26px] border border-white/70 bg-white/78 p-5 backdrop-blur-sm"
                  >
                    <SkeletonBlock className="h-5 w-24 bg-[#e8eaee]" />
                    <SkeletonBlock className="mt-4 h-8 w-40 bg-[#e8eaee]" />
                    <SkeletonBlock className="mt-2 h-4 w-full bg-[#eceff3]" />
                  </div>
                ))
              : spotlightCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-[26px] border border-white/70 bg-white/78 p-5 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-[#6b7280]">
                          {card.title}
                        </p>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-[#1f2937]">
                        {card.value}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#5b6472]">
                        {card.meta}
                      </p>
                    </div>
                  );
                })}

            <div className="rounded-[26px] border border-white/70 bg-white/78 p-5 backdrop-blur-sm sm:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">Latest Signal</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#1f2937]">
                    {loading
                      ? "Loading updates..."
                      : highlightAnnouncement?.title || "No announcements yet"}
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#5b6472]">
                {loading
                  ? "Checking participant update stream."
                  : highlightAnnouncement?.message ||
                    "Announcements from organizers will appear here as your live event briefing feed."}
              </p>
              <Link
                href="/participant/announcements"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
              >
                Open announcement center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm"
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
                  className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm"
                >
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      item.title === "Team Status"
                        ? "bg-gradient-to-r from-[#A01C33] to-[#7d1427]"
                        : item.title === "Problem Selection"
                        ? "bg-gradient-to-r from-[#18314f] to-[#1d426c]"
                        : item.title === "Submission Status"
                        ? "bg-gradient-to-r from-[#19715a] to-[#20806a]"
                        : "bg-gradient-to-r from-[#7b5818] to-[#a67a22]"
                    }`}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{item.title}</p>
                      <h3 className="mt-4 text-2xl font-bold text-[#1f2937]">
                        {item.value}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-gray-500">
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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Action Deck</p>
              <h2 className="mt-1 text-2xl font-bold text-[#1f2937]">
                Move the workspace forward
              </h2>
            </div>

            <Link
              href="/participant/profile"
              className="hidden rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] sm:inline-flex"
            >
              View Profile
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group relative overflow-hidden rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:-translate-y-0.5 hover:border-[#A01C33]/20 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`} />

                  {item.href === nextStep.href ? (
                    <span className="inline-flex rounded-full border border-[#A01C33]/15 bg-[#A01C33]/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A01C33]">
                      Recommended now
                    </span>
                  ) : null}

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition group-hover:bg-[#A01C33] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#1f2937]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-500">
                    {item.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]">
                    Open workspace
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-[#A01C33]/10 bg-[linear-gradient(135deg,#fff9fb_0%,#ffffff_46%,#fff4f7_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">
                  Recommended Next Move
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#1f2937]">
                  {nextStep.title}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Flag className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-gray-600">
              {nextStep.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Team", getTeamStatusLabel(team)],
                ["Problem", selectedProblemTitle],
                ["Submission", getSubmissionStatusLabel(submission)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-[#A01C33]/10 bg-white/80 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A01C33]/70">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#1f2937]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={nextStep.href}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
            >
              {nextStep.linkText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Readiness Score</p>
                <h2 className="mt-1 text-2xl font-bold text-[#1f2937]">
                  {completionScore}% operational
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Target className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-full bg-[#eef1f5]">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-[#A01C33] via-[#c4485b] to-[#dba753] transition-all duration-700"
                style={{ width: `${completionScore}%` }}
              />
            </div>

            <div className="mt-6 space-y-3">
              {workflowStages.map((stage) => (
                <div
                  key={stage.label}
                  className="flex items-start justify-between gap-4 rounded-[20px] border border-gray-200 bg-[#fcfcfd] px-4 py-4"
                >
                  <div>
                    <h3 className="font-semibold text-[#1f2937]">
                      {stage.label}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {stage.description}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      stage.complete
                        ? "bg-emerald-100 text-emerald-700"
                        : stage.active
                        ? "bg-[#A01C33]/10 text-[#A01C33]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {stage.complete ? "Done" : stage.active ? "Current" : "Queued"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">
                Announcement Stream
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#1f2937]">
                Organizer signals and decisions
              </h2>
            </div>

            <Link
              href="/participant/announcements"
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="mt-4 h-5 w-2/3" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-5/6" />
                </div>
              ))
            ) : announcements.length > 0 ? (
              announcements.map((item) => (
                <div
                  key={item._id}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/18 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#A01C33]">
                        {toDisplayText(item.category || "general")}
                      </span>
                      <h3 className="mt-4 text-lg font-bold text-[#1f2937]">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-gray-500">
                        {item.message}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-gray-300 bg-[#fafafa] p-5 text-sm leading-7 text-gray-500">
                No organizer announcements are available yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">
                  Leaderboard Snapshot
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#1f2937]">
                  Competition pressure
                </h2>
              </div>

              <Link
                href="/participant/leaderboard"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Full board
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] px-4 py-4"
                  >
                    <SkeletonBlock className="h-5 w-24" />
                    <SkeletonBlock className="mt-3 h-4 w-full" />
                  </div>
                ))
              ) : !leaderboardPublished ? (
                <div className="rounded-[22px] border border-dashed border-gray-300 bg-[#fafafa] p-5 text-sm leading-7 text-gray-500">
                  The leaderboard is not published yet. Rankings will appear here once
                  results go live.
                </div>
              ) : topTeams.length > 0 ? (
                topTeams.map((item) => (
                  <div
                    key={item.teamId}
                    className={`rounded-[22px] border px-4 py-4 ${getRankTone(item.rank)}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-sm font-bold shadow-sm">
                          {String(item.rank).padStart(2, "0")}
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.teamName}</h3>
                          <p className="text-sm opacity-80">
                            {item.reviewsCount} review{item.reviewsCount > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                          Score
                        </p>
                        <p className="mt-1 text-lg font-bold">
                          {formatScore(item.averageScore)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-gray-300 bg-[#fafafa] p-5 text-sm leading-7 text-gray-500">
                  Results are published, but the ranking data is still empty.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Project Brief</p>
                <h2 className="mt-1 text-2xl font-bold text-[#1f2937]">
                  Current delivery snapshot
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  label: "Project Title",
                  value: loading ? "Loading..." : projectTitle,
                  icon: FileCode2,
                },
                {
                  label: "Selected Problem",
                  value: loading ? "Loading..." : selectedProblemTitle,
                  icon: Lightbulb,
                },
                {
                  label: "Hackathon Window",
                  value: "48 hour build cycle",
                  icon: CalendarClock,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold text-[#1f2937]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={currentProjectHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
              >
                View Project Brief
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/participant/submission"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Open Submission Studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
