import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import "@/models/ProblemStatement";
export async function POST(request: NextRequest) {
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
          message: "Only participants can join a team",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const inviteCode = String(body?.inviteCode || "").trim().toUpperCase();

    if (!inviteCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Invite code is required",
        },
        { status: 400 }
      );
    }

    const existingTeam = await Team.findOne({
      $or: [{ leader: decoded.userId }, { members: decoded.userId }],
    });

    if (existingTeam) {
      return NextResponse.json(
        {
          success: false,
          message: "You already belong to a team",
        },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ inviteCode });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid invite code",
        },
        { status: 404 }
      );
    }

    if (team.status === "disqualified") {
      return NextResponse.json(
        {
          success: false,
          message: "This team is blocked from accepting new members",
        },
        { status: 400 }
      );
    }

    const currentMemberCount = 1 + team.members.length;

    if (currentMemberCount >= team.maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "This team is already full",
        },
        { status: 400 }
      );
    }

    team.members.push(decoded.userId);
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
        message: "Joined team successfully",
        team: populatedTeam,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Join team error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}