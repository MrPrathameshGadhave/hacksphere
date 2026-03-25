import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";

import User from "@/models/User";
import Team from "@/models/Team";
import ProblemStatement from "@/models/ProblemStatement";
import Submission from "@/models/Submission";
import Evaluation from "@/models/Evaluation";
import Announcement from "@/models/Announcement";
import JudgeAssignment from "@/models/JudgeAssignment";
import LeaderboardSettings from "@/models/LeaderboardSettings";

type Accent = "warning" | "success" | "info";
type Tone = "info" | "success" | "warning";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== "admin") {
    return null;
  }

  return decoded;
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function calculatePercentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function getPlatformState({
  totalParticipants,
  totalTeams,
  totalSubmissions,
  pendingParticipantApprovals,
  blockedJudges,
  pendingTeams,
  readyForJudging,
  pendingReviews,
}: {
  totalParticipants: number;
  totalTeams: number;
  totalSubmissions: number;
  pendingParticipantApprovals: number;
  blockedJudges: number;
  pendingTeams: number;
  readyForJudging: number;
  pendingReviews: number;
}) {
  if (totalParticipants === 0 && totalTeams === 0 && totalSubmissions === 0) {
    return "Setup Mode";
  }

  if (
    pendingParticipantApprovals > 0 ||
    blockedJudges > 0 ||
    pendingTeams > 0
  ) {
    return "Attention Needed";
  }

  if (readyForJudging > 0 || pendingReviews > 0) {
    return "Operational";
  }

  return "Stable";
}

function buildQuickActionMeta({
  totalParticipants,
  pendingParticipantApprovals,
  pendingTeams,
  teamsWithoutProblem,
  totalJudges,
  blockedJudges,
  totalProblems,
  publishedProblems,
  totalSubmissions,
  readyForJudging,
  leaderboardPublished,
}: {
  totalParticipants: number;
  pendingParticipantApprovals: number;
  pendingTeams: number;
  teamsWithoutProblem: number;
  totalJudges: number;
  blockedJudges: number;
  totalProblems: number;
  publishedProblems: number;
  totalSubmissions: number;
  readyForJudging: number;
  leaderboardPublished: boolean;
}) {
  return {
    participants: {
      badge:
        pendingParticipantApprovals > 0
          ? `${pendingParticipantApprovals} pending`
          : totalParticipants > 0
          ? "Healthy"
          : "No users",
      accent:
        pendingParticipantApprovals > 0
          ? ("warning" as Accent)
          : totalParticipants > 0
          ? ("success" as Accent)
          : ("info" as Accent),
    },
    teams: {
      badge:
        pendingTeams > 0
          ? `${pendingTeams} pending`
          : teamsWithoutProblem > 0
          ? `${teamsWithoutProblem} without problem`
          : "Healthy",
      accent:
        pendingTeams > 0
          ? ("warning" as Accent)
          : teamsWithoutProblem > 0
          ? ("info" as Accent)
          : ("success" as Accent),
    },
    judges: {
      badge:
        blockedJudges > 0
          ? `${blockedJudges} blocked`
          : totalJudges > 0
          ? "Ready"
          : "No judges",
      accent:
        blockedJudges > 0
          ? ("warning" as Accent)
          : totalJudges > 0
          ? ("success" as Accent)
          : ("info" as Accent),
    },
    problems: {
      badge:
        totalProblems === 0
          ? "No problems"
          : publishedProblems === 0
          ? "Draft only"
          : `${publishedProblems}/${totalProblems} live`,
      accent:
        totalProblems === 0
          ? ("info" as Accent)
          : publishedProblems === 0
          ? ("warning" as Accent)
          : ("success" as Accent),
    },
    submissions: {
      badge:
        readyForJudging > 0
          ? `${readyForJudging} queued`
          : totalSubmissions > 0
          ? "Calm"
          : "No submissions",
      accent:
        readyForJudging > 0
          ? ("info" as Accent)
          : totalSubmissions > 0
          ? ("success" as Accent)
          : ("info" as Accent),
    },
    leaderboard: {
      badge: leaderboardPublished ? "Published" : "Draft",
      accent: leaderboardPublished
        ? ("success" as Accent)
        : ("info" as Accent),
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const [
      totalParticipants,
      pendingParticipantApprovals,
      totalJudges,
      blockedJudges,
      totalTeams,
      pendingTeams,
      teamsWithoutProblem,
      totalProblems,
      publishedProblems,
      totalSubmissions,
      readyForJudging,
      lockedSubmissions,
      totalAnnouncements,
      pinnedAnnouncements,
      totalAssignedReviews,
      completedReviews,
      leaderboardSettings,
      latestSubmission,
      latestAnnouncement,
      latestCompletedEvaluation,
    ] = await Promise.all([
      User.countDocuments({ role: "participant" }),
      User.countDocuments({ role: "participant", isApproved: false }),

      User.countDocuments({ role: "judge" }),
      User.countDocuments({ role: "judge", judgeStatus: "blocked" }),

      Team.countDocuments({}),
      Team.countDocuments({ status: "pending" }),
      Team.countDocuments({
        $or: [{ problemStatement: { $exists: false } }, { problemStatement: null }],
      }),

      ProblemStatement.countDocuments({}),
      ProblemStatement.countDocuments({ status: "Published" }),

      Submission.countDocuments({}),
      Submission.countDocuments({ status: { $in: ["submitted", "locked"] } }),
      Submission.countDocuments({ status: "locked" }),

      Announcement.countDocuments({}),
      Announcement.countDocuments({ pinned: true }),

      JudgeAssignment.countDocuments({}),
      Evaluation.countDocuments({ status: "submitted" }),

      LeaderboardSettings.findOne({ key: "global" }).select("isPublished").lean(),

      Submission.findOne({})
        .sort({ updatedAt: -1 })
        .select("projectTitle status updatedAt")
        .lean(),

      Announcement.findOne({})
        .sort({ createdAt: -1 })
        .select("title category pinned createdAt")
        .lean(),

      Evaluation.findOne({ status: "submitted" })
        .sort({ submittedAt: -1, updatedAt: -1 })
        .select("submittedAt updatedAt totalScore")
        .lean(),
    ]);

    const pendingReviews = Math.max(totalAssignedReviews - completedReviews, 0);
    const reviewCoverage = calculatePercentage(
      completedReviews,
      totalAssignedReviews
    );

    const leaderboardPublished = Boolean(leaderboardSettings?.isPublished);
    const leaderboardState = leaderboardPublished ? "Published" : "Draft";

    const platformState = getPlatformState({
      totalParticipants,
      totalTeams,
      totalSubmissions,
      pendingParticipantApprovals,
      blockedJudges,
      pendingTeams,
      readyForJudging,
      pendingReviews,
    });

    const recentActivity: {
      title: string;
      meta: string;
      tone: Tone;
    }[] = [];

    if (latestSubmission) {
      recentActivity.push({
        title: "Latest submission activity",
        meta: `${
          latestSubmission.projectTitle || "A project"
        } is currently ${latestSubmission.status}. Updated on ${formatDateTime(
          latestSubmission.updatedAt
        )}.`,
        tone: latestSubmission.status === "locked" ? "success" : "info",
      });
    }

    if (latestAnnouncement) {
      recentActivity.push({
        title: latestAnnouncement.pinned
          ? "Pinned announcement updated"
          : "Latest announcement posted",
        meta: `${
          latestAnnouncement.title || "Announcement"
        } was recorded on ${formatDateTime(latestAnnouncement.createdAt)}.`,
        tone: latestAnnouncement.pinned ? "warning" : "info",
      });
    }

    if (latestCompletedEvaluation) {
      recentActivity.push({
        title: "Submitted reviews are flowing",
        meta: `A completed review was recorded on ${formatDateTime(
          latestCompletedEvaluation.submittedAt ||
            latestCompletedEvaluation.updatedAt
        )}.`,
        tone: "success",
      });
    }

    if (pendingParticipantApprovals > 0) {
      recentActivity.push({
        title: "Participant approvals pending",
        meta: `${pendingParticipantApprovals} participant account(s) still need admin approval.`,
        tone: "warning",
      });
    }

    if (readyForJudging > 0) {
      recentActivity.push({
        title:
          pendingReviews > 0 ? "Judging queue is active" : "Submissions await review coverage",
        meta:
          pendingReviews > 0
            ? `${readyForJudging} submission(s) are in the judging-ready queue, with ${pendingReviews} assigned review task(s) still pending completion.`
            : `${readyForJudging} submission(s) are ready for judging, but pending assigned review tasks are currently low or not tracked yet.`,
        tone: pendingReviews > 0 ? "info" : "warning",
      });
    }

    if (recentActivity.length === 0) {
      recentActivity.push({
        title: "System is ready",
        meta: "Core HackSphere modules are connected and waiting for live event activity.",
        tone: "info",
      });
    }

    return NextResponse.json({
      success: true,
      hero: {
        platformState,
        leaderboardState,
        reviewCoverage,
        readyForJudging,
      },
      stats: {
        totalParticipants,
        totalTeams,
        totalJudges,
        totalSubmissions,
        pendingReviews,
        announcements: totalAnnouncements,
      },
      overview: {
        completedReviews,
        reviewCoverage,
        pendingParticipantApprovals,
        blockedJudges,
        pendingTeams,
        teamsWithoutProblem,
        publishedProblems,
        totalProblems,
        readyForJudging,
        lockedSubmissions,
        pinnedAnnouncements,
        leaderboardState,
      },
      quickActionMeta: buildQuickActionMeta({
        totalParticipants,
        pendingParticipantApprovals,
        pendingTeams,
        teamsWithoutProblem,
        totalJudges,
        blockedJudges,
        totalProblems,
        publishedProblems,
        totalSubmissions,
        readyForJudging,
        leaderboardPublished,
      }),
      recentActivity: recentActivity.slice(0, 5),
      message: "Admin dashboard loaded successfully.",
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin dashboard.",
      },
      { status: 500 }
    );
  }
}