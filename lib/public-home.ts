import connectDB from "@/lib/db";
import { buildAdminLeaderboardData } from "@/lib/leaderboard";
import {
  formatSubmissionDeadline,
  getSubmissionDeadlineDate,
  isSubmissionActive,
} from "@/lib/hackathon";
import Announcement from "@/models/Announcement";
import LeaderboardSettings from "@/models/LeaderboardSettings";
import ProblemStatement from "@/models/ProblemStatement";
import Team from "@/models/Team";
import User from "@/models/User";

type HomeProblem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  teamsInterested: number;
};

type HomeAnnouncement = {
  id: string;
  title: string;
  message: string;
  category: string;
  pinned: boolean;
  createdAt: string;
};

type HomeLeaderboardEntry = {
  rank: number;
  teamName: string;
  projectTitle: string;
  score: number;
  reviewsCount: number;
};

export type PublicHomeData = {
  stats: {
    totalParticipants: number;
    totalTeams: number;
    totalProblems: number;
    totalJudges: number;
  };
  platform: {
    state: string;
    submissionWindowLabel: string;
    submissionStatus: string;
    leaderboardPublished: boolean;
    latestAnnouncementDate: string;
  };
  featuredProblems: HomeProblem[];
  announcements: HomeAnnouncement[];
  leaderboard: HomeLeaderboardEntry[];
};

function formatDate(value?: Date | string | null) {
  if (!value) return "No updates yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No updates yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPlatformState(input: {
  totalParticipants: number;
  totalTeams: number;
  totalProblems: number;
  totalJudges: number;
  leaderboardPublished: boolean;
}) {
  if (
    input.totalParticipants === 0 &&
    input.totalTeams === 0 &&
    input.totalProblems === 0
  ) {
    return "Setup Mode";
  }

  if (input.leaderboardPublished) {
    return "Results Live";
  }

  if (input.totalTeams > 0 && input.totalJudges > 0) {
    return "Hackathon Active";
  }

  return "Registrations Open";
}

export async function getPublicHomeData(): Promise<PublicHomeData> {
  await connectDB();

  const [
    totalParticipants,
    totalTeams,
    totalProblems,
    totalJudges,
    rawProblems,
    rawAnnouncements,
    leaderboardSettings,
  ] = await Promise.all([
    User.countDocuments({ role: "participant", isApproved: true }),
    Team.countDocuments({}),
    ProblemStatement.countDocuments({ status: "Published", isActive: true }),
    User.countDocuments({ role: "judge", isApproved: true }),
    ProblemStatement.find({ status: "Published", isActive: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    Announcement.find({})
      .sort({ pinned: -1, createdAt: -1 })
      .limit(3)
      .lean(),
    LeaderboardSettings.findOne({ key: "global" }).lean(),
  ]);

  const featuredProblems = await Promise.all(
    rawProblems.map(async (problem: any) => ({
      id: String(problem._id),
      title: problem.title || "Untitled Problem",
      slug: problem.slug || "",
      shortDescription: problem.shortDescription || "",
      category: problem.category || "General",
      difficulty: (problem.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
      teamsInterested: await Team.countDocuments({
        problemStatement: problem._id,
      }),
    }))
  );

  const announcements = rawAnnouncements.map((item: any) => ({
    id: String(item._id),
    title: item.title || "Announcement",
    message: item.message || "",
    category: item.category || "general",
    pinned: Boolean(item.pinned),
    createdAt: formatDate(item.createdAt),
  }));

  const leaderboardPublished = Boolean(leaderboardSettings?.isPublished);
  const leaderboardData = leaderboardPublished
    ? await buildAdminLeaderboardData()
    : null;

  const leaderboard = leaderboardPublished
    ? leaderboardData!.topThree.map((entry) => ({
        rank: entry.rank,
        teamName: entry.teamName,
        projectTitle: entry.projectTitle,
        score: entry.finalScore,
        reviewsCount: entry.reviewsCount,
      }))
    : [];

  const deadlineDate = getSubmissionDeadlineDate();
  const submissionStatus = deadlineDate
    ? isSubmissionActive()
      ? "Submissions Open"
      : "Submissions Closed"
    : "Deadline Not Configured";

  return {
    stats: {
      totalParticipants,
      totalTeams,
      totalProblems,
      totalJudges,
    },
    platform: {
      state: getPlatformState({
        totalParticipants,
        totalTeams,
        totalProblems,
        totalJudges,
        leaderboardPublished,
      }),
      submissionWindowLabel: formatSubmissionDeadline(),
      submissionStatus,
      leaderboardPublished,
      latestAnnouncementDate: announcements[0]?.createdAt || "No updates yet",
    },
    featuredProblems,
    announcements,
    leaderboard,
  };
}
