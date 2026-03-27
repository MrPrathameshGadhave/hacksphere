import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Team from "@/models/Team";

const VALID_BACKEND_STATUSES = new Set(["active", "pending", "disqualified"]);

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const nextStatus = String(body.status || "").trim();

    if (!VALID_BACKEND_STATUSES.has(nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid team status",
        },
        { status: 400 }
      );
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      {
        status: nextStatus,
      },
      {
        new: true,
      }
    )
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate("problemStatement", "title slug");

    if (!updatedTeam) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Team status updated successfully",
        team: serializeTeam(updatedTeam.toObject()),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update team status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}