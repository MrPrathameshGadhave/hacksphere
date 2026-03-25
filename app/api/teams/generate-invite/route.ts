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

export async function POST(_request: NextRequest) {
  try {
    await connectDB();

    const token = _request.cookies.get("hacksphere_token")?.value;

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
          message: "Only participants can generate invite codes",
        },
        { status: 403 }
      );
    }

    const team = await Team.findOne({ leader: decoded.userId });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the team leader can generate invite codes",
        },
        { status: 403 }
      );
    }

    team.inviteCode = await generateUniqueInviteCode();
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
        message: "Invite code generated successfully",
        team: populatedTeam,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Generate invite error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}