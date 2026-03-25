import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import "@/models/ProblemStatement";
function generateInviteCode() {
  return `HS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function generateUniqueInviteCode() {
  let code = generateInviteCode();

  while (await Team.findOne({ inviteCode: code })) {
    code = generateInviteCode();
  }

  return code;
}

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
          message: "Only participants can create a team",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const teamName = String(body?.teamName || "").trim();
    const teamDescription = String(body?.teamDescription || "").trim();
    const maxSize = Number(body?.maxSize) || 4;

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

    const inviteCode = await generateUniqueInviteCode();

    const team = await Team.create({
      teamName,
      teamDescription,
      leader: decoded.userId,
      members: [],
      maxSize,
      status: "active",
      problemStatement: null,
      inviteCode,
    });

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
        message: "Team created successfully",
        team: populatedTeam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create team error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}