import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Team from "@/models/Team";

function serializeTeam(team: any) {
  const backendStatus = team.status as "active" | "pending" | "disqualified";

  const uiStatus =
    backendStatus === "active"
      ? "Active"
      : backendStatus === "pending"
      ? "Incomplete"
      : "Blocked";

  const selectedProblem = team.problemStatement?.title || "Not Selected";
  const problemStatus = team.problemStatement ? "Selected" : "Not Selected";

  return {
    id: String(team._id),
    teamName: team.teamName,
    leader: team.leader?.name || "Unknown Leader",
    leaderEmail: team.leader?.email || "",
    memberCount: Array.isArray(team.members) ? team.members.length : 0,
    members: Array.isArray(team.members)
      ? team.members.map((member: any) => member?.name).filter(Boolean)
      : [],
    selectedProblem,
    problemStatus,
    status: uiStatus,
    backendStatus,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const teams = await Team.find({})
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate("problemStatement", "title slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        teams: teams.map(serializeTeam),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admin teams error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}