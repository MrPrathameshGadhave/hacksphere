import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import "@/models/ProblemStatement";
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("hacksphere_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    if (decoded.role !== "participant") {
      return NextResponse.json(
        {
          success: false,
          message: "Only participants can update a team",
        },
        { status: 403 }
      );
    }

    const team = await Team.findOne({ leader: decoded.userId });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the team leader can update the team",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const teamName = String(body?.teamName || "").trim();
    const teamDescription = String(body?.teamDescription || "").trim();
    const maxSize = Number(body?.maxSize) || team.maxSize;

    if (!teamName) {
      return NextResponse.json(
        {
          success: false,
          message: "Team name is required",
        },
        { status: 400 }
      );
    }

    if (maxSize < 2 || maxSize > 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Team size must be between 2 and 4",
        },
        { status: 400 }
      );
    }

    const currentMemberCount = 1 + team.members.length;

    if (maxSize < currentMemberCount) {
      return NextResponse.json(
        {
          success: false,
          message: `Team size cannot be less than current member count (${currentMemberCount})`,
        },
        { status: 400 }
      );
    }

    team.teamName = teamName;
    team.teamDescription = teamDescription;
    team.maxSize = maxSize;

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "name email college avatar role isApproved")
      .populate("members", "name email college avatar role isApproved")
      .populate(
        "problemStatement",
        "title shortDescription category difficulty"
      );

    return NextResponse.json(
      {
        success: true,
        message: "Team updated successfully",
        team: populatedTeam,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update team error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}