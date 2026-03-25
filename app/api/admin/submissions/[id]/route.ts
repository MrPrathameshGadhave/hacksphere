import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Submission from "@/models/Submission";
import "@/models/Team";
import "@/models/User";
import "@/models/ProblemStatement";

type DbSubmissionStatus = "draft" | "submitted" | "locked";
type UiSubmissionStatus = "Draft" | "Submitted" | "Locked";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== "admin") {
    return null;
  }

  return decoded;
}

function mapDbStatusToUi(status: DbSubmissionStatus): UiSubmissionStatus {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "locked":
      return "Locked";
    default:
      return "Draft";
  }
}

function mapInputStatusToDb(status: string): DbSubmissionStatus | null {
  const normalized = status.trim().toLowerCase();

  if (normalized === "draft") return "draft";
  if (normalized === "submitted") return "submitted";
  if (normalized === "locked") return "locked";

  return null;
}

function normalizeUser(user: any) {
  if (!user) return null;

  return {
    id: user._id?.toString?.() || "",
    name: user.name || "",
    email: user.email || "",
    college: user.college || "",
    avatar: user.avatar || "",
    isApproved: Boolean(user.isApproved),
    role: user.role || "participant",
  };
}

function transformSubmission(submission: any) {
  const team = submission.team || null;

  const leader = normalizeUser(team?.leader);

  const memberDocs = Array.isArray(team?.members)
    ? team.members.map((member: any) => normalizeUser(member)).filter(Boolean)
    : [];

  const allMembersMap = new Map<string, any>();

  if (leader?.id) {
    allMembersMap.set(leader.id, leader);
  }

  for (const member of memberDocs) {
    if (member?.id) {
      allMembersMap.set(member.id, member);
    }
  }

  const allMembers = Array.from(allMembersMap.values());

  const problemStatement = team?.problemStatement
    ? {
        id: team.problemStatement._id?.toString?.() || "",
        title: team.problemStatement.title || "",
        slug: team.problemStatement.slug || "",
        category: team.problemStatement.category || "",
        difficulty: team.problemStatement.difficulty || "",
        status: team.problemStatement.status || "",
        isActive: Boolean(team.problemStatement.isActive),
      }
    : null;

  return {
    id: submission._id?.toString?.() || "",
    teamId: team?._id?.toString?.() || "",
    teamName: team?.teamName || "Unknown team",
    teamStatus: team?.status || "pending",
    leader: leader?.name || "Unknown",
    leaderEmail: leader?.email || "",
    memberCount: allMembers.length,
    members: allMembers.map((member) => member.name).filter(Boolean),
    selectedProblem: problemStatement?.title || "Not selected",
    problemStatement,
    projectTitle: submission.projectTitle || "Untitled project",
    description: submission.description || "",
    githubLink: submission.githubLink || "",
    demoLink: submission.demoLink || "",
    pptLink: submission.pptLink || "",
    videoLink: submission.videoLink || "",
    hasGithubLink: Boolean(submission.githubLink),
    hasDemoLink: Boolean(submission.demoLink),
    hasPptLink: Boolean(submission.pptLink),
    hasVideoLink: Boolean(submission.videoLink),
    images: Array.isArray(submission.images) ? submission.images : [],
    imagesCount: Array.isArray(submission.images) ? submission.images.length : 0,
    techStack: Array.isArray(submission.techStack) ? submission.techStack : [],
    status: mapDbStatusToUi(submission.status),
    dbStatus: submission.status,
    submittedAt: submission.submittedAt || null,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

async function getSubmissionById(id: string) {
  return Submission.findById(id).populate({
    path: "team",
    select: "teamName leader members problemStatement status",
    populate: [
      {
        path: "leader",
        select: "name email college avatar isApproved role",
      },
      {
        path: "members",
        select: "name email college avatar isApproved role",
      },
      {
        path: "problemStatement",
        select: "title slug category difficulty status isActive",
      },
    ],
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid submission id" },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await getSubmissionById(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: transformSubmission(submission),
    });
  } catch (error) {
    console.error("GET /api/admin/submissions/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch submission",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid submission id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const nextStatus = mapInputStatusToDb(body?.status || "");

    if (!nextStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status. Use draft, submitted, or locked.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await Submission.findById(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    submission.status = nextStatus;

    if (nextStatus === "draft") {
      submission.submittedAt = null;
    } else if (!submission.submittedAt) {
      submission.submittedAt = new Date();
    }

    await submission.save();

    const updatedSubmission = await getSubmissionById(id);

    return NextResponse.json({
      success: true,
      message: "Submission status updated successfully",
      submission: transformSubmission(updatedSubmission),
    });
  } catch (error) {
    console.error("PATCH /api/admin/submissions/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update submission status",
      },
      { status: 500 }
    );
  }
}