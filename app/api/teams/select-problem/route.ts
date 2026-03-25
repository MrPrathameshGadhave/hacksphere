import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import ProblemStatement from "@/models/ProblemStatement";
import "@/models/User";

async function getPopulatedTeam(teamId: string | Types.ObjectId) {
  return Team.findById(teamId)
    .populate("leader", "name email college avatar role isApproved")
    .populate("members", "name email college avatar role isApproved")
    .populate(
      "problemStatement",
      "title slug shortDescription category difficulty isActive"
    );
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
          message: "Only participants can select a problem",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const problemId = String(body?.problemId || "").trim();

    if (!problemId) {
      return NextResponse.json(
        {
          success: false,
          message: "Problem ID is required",
        },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(problemId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid problem ID",
        },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ leader: decoded.userId })
      .populate("leader", "name email college avatar role isApproved")
      .populate("members", "name email college avatar role isApproved");

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the team leader can select a problem statement",
        },
        { status: 403 }
      );
    }

    if (team.status === "disqualified") {
      return NextResponse.json(
        {
          success: false,
          message: "This team is not allowed to select a problem statement",
        },
        { status: 403 }
      );
    }

    const allParticipants = [team.leader, ...team.members] as Array<{
      isApproved?: boolean;
    }>;

    const hasUnapprovedParticipants = allParticipants.some(
      (participant) => participant?.isApproved === false
    );

    if (hasUnapprovedParticipants) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All team participants must be approved by admin before selecting a problem statement",
        },
        { status: 403 }
      );
    }

    const problem = await ProblemStatement.findById(problemId);

    if (!problem) {
      return NextResponse.json(
        {
          success: false,
          message: "Problem statement not found",
        },
        { status: 404 }
      );
    }

    const isSelectable =
      problem.isActive === true ||
      (typeof (problem as any).status === "string" &&
        (problem as any).status === "Published");

    if (!isSelectable) {
      return NextResponse.json(
        {
          success: false,
          message: "Only active problem statements can be selected",
        },
        { status: 400 }
      );
    }

    const currentProblemId = team.problemStatement
      ? String(team.problemStatement)
      : "";

    if (currentProblemId === problemId) {
      const populatedTeam = await getPopulatedTeam(team._id);

      return NextResponse.json(
        {
          success: true,
          message: "Problem statement is already selected",
          team: populatedTeam,
        },
        { status: 200 }
      );
    }

    team.problemStatement = problem._id;
    await team.save();

    const populatedTeam = await getPopulatedTeam(team._id);

    return NextResponse.json(
      {
        success: true,
        message: "Problem statement selected successfully",
        team: populatedTeam,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Select problem error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}