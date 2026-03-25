import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import { isSubmissionDeadlinePassed } from "@/lib/hackathon";
import "@/models/User";
import "@/models/ProblemStatement";

async function getPopulatedTeam(userId: string) {
  return Team.findOne({
    $or: [{ leader: userId }, { members: userId }],
  })
    .populate("leader", "name email college avatar role isApproved")
    .populate("members", "name email college avatar role isApproved")
    .populate(
      "problemStatement",
      "title slug shortDescription fullDescription category difficulty suggestedTechnologies submissionRequirements isActive"
    );
}

async function getPopulatedSubmission(teamId: string) {
  return Submission.findOne({ team: teamId }).populate({
    path: "team",
    populate: [
      {
        path: "leader",
        select: "name email college avatar role isApproved",
      },
      {
        path: "members",
        select: "name email college avatar role isApproved",
      },
      {
        path: "problemStatement",
        select:
          "title slug shortDescription fullDescription category difficulty suggestedTechnologies submissionRequirements isActive",
      },
    ],
  });
}

export async function GET(request: NextRequest) {
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
          message: "Only participants can access this route",
        },
        { status: 403 }
      );
    }

    const team = await getPopulatedTeam(decoded.userId);

    if (!team) {
      return NextResponse.json(
        {
          success: true,
          team: null,
          submission: null,
        },
        { status: 200 }
      );
    }

    let submission = await getPopulatedSubmission(String(team._id));

    if (
      submission &&
      isSubmissionDeadlinePassed() &&
      submission.status !== "locked"
    ) {
      submission.status = "locked";
      await submission.save();

      submission = await getPopulatedSubmission(String(team._id));
    }

    return NextResponse.json(
      {
        success: true,
        team,
        submission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get my submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}