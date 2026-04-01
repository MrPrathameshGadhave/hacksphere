import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import { isSubmissionDeadlinePassed } from "@/lib/hackathon";
import { submissionCreateSchema } from "@/lib/validations/submission";
import "@/models/User";
import "@/models/ProblemStatement";

async function getLeaderTeam(userId: string) {
  return Team.findOne({ leader: userId })
    .populate("leader", "name email college avatar role isApproved")
    .populate("members", "name email college avatar role isApproved")
    .populate(
      "problemStatement",
      "title slug shortDescription fullDescription category difficulty suggestedTechnologies submissionRequirements isActive"
    );
}

async function getPopulatedSubmission(submissionId: string) {
  return Submission.findById(submissionId).populate({
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("hacksphere_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "participant") {
      return NextResponse.json(
        { success: false, message: "Only participants can create submissions" },
        { status: 403 }
      );
    }

    if (isSubmissionDeadlinePassed()) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission deadline has passed. Editing is now locked.",
        },
        { status: 403 }
      );
    }

    const team = await getLeaderTeam(decoded.userId);

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the team leader can create the submission",
        },
        { status: 403 }
      );
    }

    if (team.status === "disqualified") {
      return NextResponse.json(
        {
          success: false,
          message: "This team is not allowed to create or edit submissions",
        },
        { status: 403 }
      );
    }

    if (!team.problemStatement) {
      return NextResponse.json(
        {
          success: false,
          message: "Select a problem statement before creating a submission",
        },
        { status: 400 }
      );
    }

    const existingSubmission = await Submission.findOne({ team: team._id });

    if (existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission already exists for this team",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedFields = submissionCreateSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      projectTitle,
      description,
      githubLink,
      demoLink,
      pptLink,
      videoLink,
      techStack,
      images,
      status,
    } = validatedFields.data;

    const submission = await Submission.create({
      team: team._id,
      projectTitle,
      description,
      githubLink,
      demoLink,
      pptLink,
      videoLink,
      techStack,
      images,
      status,
      submittedAt: status === "submitted" ? new Date() : null,
    });

    const populatedSubmission = await getPopulatedSubmission(String(submission._id));

    return NextResponse.json(
      {
        success: true,
        message:
          status === "submitted"
            ? "Project submitted successfully"
            : "Draft saved successfully",
        submission: populatedSubmission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
