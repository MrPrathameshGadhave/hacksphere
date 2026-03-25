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
          message: "Only participants can manage team members",
        },
        { status: 403 }
      );
    }

    const team = await Team.findOne({ leader: decoded.userId });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the team leader can remove members",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const memberId = String(body?.memberId || "").trim();

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required",
        },
        { status: 400 }
      );
    }

    const existsInTeam = team.members.some(
      (member) => member.toString() === memberId
    );

    if (!existsInTeam) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found in team",
        },
        { status: 404 }
      );
    }

    team.members = team.members.filter(
      (member) => member.toString() !== memberId
    );

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
        message: "Member removed successfully",
        team: populatedTeam,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove member error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}