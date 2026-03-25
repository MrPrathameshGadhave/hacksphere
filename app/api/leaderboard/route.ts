import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { buildAdminLeaderboardData } from "@/lib/leaderboard";
import LeaderboardSettings from "@/models/LeaderboardSettings";

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const [leaderboardData, settings] = await Promise.all([
      buildAdminLeaderboardData(),
      LeaderboardSettings.findOne({ key: "global" }).lean(),
    ]);

    const isPublished = Boolean(settings?.isPublished);

    const items = isPublished
      ? leaderboardData.rows.map((row) => ({
          rank: row.rank,
          teamId: row.teamId,
          teamName: row.teamName,
          averageScore: row.finalScore,
          reviewsCount: row.reviewsCount,
          membersCount: row.members,
          status: row.reviewStatus === "Completed" ? "completed" : "pending",
          problemTitle: row.problemTitle,
          submissionId: row.submissionId,
          submittedAt: row.submissionTime,
          projectTitle: row.projectTitle,
        }))
      : [];

    const topThree = isPublished
      ? leaderboardData.topThree.map((row) => ({
          rank: row.rank,
          teamId: row.teamId,
          teamName: row.teamName,
          averageScore: row.finalScore,
          reviewsCount: row.reviewsCount,
          membersCount: row.members,
          status: row.reviewStatus === "Completed" ? "completed" : "pending",
          problemTitle: row.problemTitle,
          submissionId: row.submissionId,
          submittedAt: row.submissionTime,
          projectTitle: row.projectTitle,
        }))
      : [];

    return NextResponse.json({
      success: true,
      published: isPublished,
      items,
      leaderboard: items,
      topThree,
    });
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch leaderboard." },
      { status: 500 }
    );
  }
}