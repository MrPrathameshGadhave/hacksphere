import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { buildAdminLeaderboardData } from "@/lib/leaderboard";
import User from "@/models/User";

async function ensureActiveJudge(userId: string) {
  const judge = await User.findOne({
    _id: userId,
    role: "judge",
  }).select("isApproved judgeStatus");

  if (!judge) {
    return NextResponse.json(
      { success: false, message: "Forbidden." },
      { status: 403 }
    );
  }

  if (judge.judgeStatus === "blocked") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Your judge account has been blocked. Please contact the organizers.",
      },
      { status: 403 }
    );
  }

  if (judge.judgeStatus !== "active" || judge.isApproved === false) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Your judge account is pending admin approval. Please wait for approval before accessing judge tools.",
      },
      { status: 403 }
    );
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("hacksphere_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const currentUser = verifyToken(token);

    if (!currentUser || currentUser.role !== "judge") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    const judgeAccessError = await ensureActiveJudge(currentUser.userId);

    if (judgeAccessError) {
      return judgeAccessError;
    }

    const leaderboard = await buildAdminLeaderboardData();

    return NextResponse.json({
      success: true,
      items: leaderboard.rows.map((row) => ({
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
      })),
      topThree: leaderboard.topThree.map((row) => ({
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
      })),
    });
  } catch (error) {
    console.error("GET /api/judge/leaderboard error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch judge leaderboard." },
      { status: 500 }
    );
  }
}
