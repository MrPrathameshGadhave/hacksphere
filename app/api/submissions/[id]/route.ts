import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import { isSubmissionDeadlinePassed } from "@/lib/hackathon";
import "@/models/User";
import "@/models/ProblemStatement";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTechStack(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function validateFinalSubmission(input: {
  projectTitle: string;
  description: string;
  githubLink: string;
  demoLink: string;
  techStack: string[];
}) {
  if (input.projectTitle.length < 3) {
    return "Project title is required";
  }

  if (input.description.length < 20) {
    return "Project description must be at least 20 characters";
  }

  if (!input.githubLink) {
    return "GitHub repository link is required";
  }

  if (!input.demoLink) {
    return "Demo link is required";
  }

  if (input.techStack.length === 0) {
    return "Tech stack is required";
  }

  return null;
}

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
        { success: false, message: "Only participants can update submissions" },
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

    const { id } = await context.params;

    const team = await getLeaderTeam(decoded.userId);

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the team leader can update the submission",
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
          message: "Select a problem statement before updating a submission",
        },
        { status: 400 }
      );
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found",
        },
        { status: 404 }
      );
    }

    if (String(submission.team) !== String(team._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update your own team submission",
        },
        { status: 403 }
      );
    }

    if (submission.status === "locked") {
      return NextResponse.json(
        {
          success: false,
          message: "This submission is locked and cannot be edited",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const projectTitle = normalizeText(body?.projectTitle);
    const description = normalizeText(body?.description);
    const githubLink = normalizeText(body?.githubLink);
    const demoLink = normalizeText(body?.demoLink);
    const pptLink = normalizeText(body?.pptLink);
    const videoLink = normalizeText(body?.videoLink);
    const techStack = normalizeTechStack(body?.techStack);
    const nextStatus: "draft" | "submitted" =
      body?.status === "submitted" ? "submitted" : "draft";

    if (nextStatus === "submitted") {
      const validationMessage = validateFinalSubmission({
        projectTitle,
        description,
        githubLink,
        demoLink,
        techStack,
      });

      if (validationMessage) {
        return NextResponse.json(
          {
            success: false,
            message: validationMessage,
          },
          { status: 400 }
        );
      }
    }

    submission.projectTitle = projectTitle;
    submission.description = description;
    submission.githubLink = githubLink;
    submission.demoLink = demoLink;
    submission.pptLink = pptLink;
    submission.videoLink = videoLink;
    submission.techStack = techStack;
    submission.status = nextStatus;
    submission.submittedAt =
      nextStatus === "submitted"
        ? submission.submittedAt || new Date()
        : null;

    await submission.save();

    const populatedSubmission = await getPopulatedSubmission(String(submission._id));

    return NextResponse.json(
      {
        success: true,
        message:
          nextStatus === "submitted"
            ? "Project submitted successfully"
            : "Draft updated successfully",
        submission: populatedSubmission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}