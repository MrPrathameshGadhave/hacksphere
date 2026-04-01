import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { recordAdminAuditLog } from "@/lib/admin/audit";
import { buildAdminLeaderboardData } from "@/lib/leaderboard";
import LeaderboardSettings from "@/models/LeaderboardSettings";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const currentUser = verifyToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [leaderboard, settings] = await Promise.all([
      buildAdminLeaderboardData(),
      LeaderboardSettings.findOne({ key: "global" }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      publishState: settings?.isPublished ? "Published" : "Draft",
      publishedAt: settings?.publishedAt || null,
      recalculatedAt: new Date().toISOString(),
      rows: leaderboard.rows,
      stats: leaderboard.stats,
      topThree: leaderboard.topThree,
    });
  } catch (error) {
    console.error("GET /api/admin/leaderboard error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch leaderboard." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const nextState = body?.publishState;

    if (!["Draft", "Published"].includes(nextState)) {
      return NextResponse.json(
        { success: false, message: "Invalid publish state." },
        { status: 400 }
      );
    }

    const settings =
      (await LeaderboardSettings.findOne({ key: "global" })) ||
      new LeaderboardSettings({ key: "global" });

    if (nextState === "Published") {
      settings.isPublished = true;
      settings.publishedAt = new Date();
      settings.publishedBy = currentUser.userId as any;
    } else {
      settings.isPublished = false;
      settings.publishedAt = null;
      settings.publishedBy = null;
    }

    await settings.save();

    await recordAdminAuditLog({
      action:
        nextState === "Published"
          ? "publish_leaderboard"
          : "move_leaderboard_to_draft",
      adminId: currentUser.userId,
      targetType: "leaderboard",
      targetLabel: "Global leaderboard",
      details: {
        publishState: nextState,
        publishedAt: settings.publishedAt?.toISOString?.() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        nextState === "Published"
          ? "Leaderboard published successfully."
          : "Leaderboard moved back to draft.",
      publishState: nextState,
      recalculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/admin/leaderboard error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update leaderboard state." },
      { status: 500 }
    );
  }
}
