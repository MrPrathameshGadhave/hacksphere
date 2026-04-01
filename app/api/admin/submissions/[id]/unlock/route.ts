import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { recordAdminAuditLog } from "@/lib/admin/audit";
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

function normalizeUser(user: any) {
  if (!user) return null;

  return {
    id: user._id?.toString?.() || "",
    name: user.name || "",
    email: user.email || "",
    college: user.college || "",
    avatar: user.avatar || "",
    isApproved: user.isApproved ?? false,
    role: user.role || "",
  };
}

function normalizeTeam(team: any) {
  if (!team) return null;

  const leader = normalizeUser(team.leader);
  const members = Array.isArray(team.members)
    ? team.members.map(normalizeUser).filter(Boolean)
    : [];

  return {
    id: team._id?.toString?.() || "",
    teamName: team.teamName || "",
    leader,
    members,
    status: team.status || "pending",
    problemStatement: team.problemStatement || null,
  };
}

function transformSubmission(dbSubmission: any) {
  if (!dbSubmission) return null;

  const submission = dbSubmission.toObject?.() || dbSubmission;
  const team = normalizeTeam(submission.team);
  const leader = team?.leader;
  const allMembers = team
    ? [team.leader, ...team.members].filter((m) => m !== null)
    : [];
  const problemStatement = team?.problemStatement || null;

  return {
    id: submission._id?.toString?.() || "",
    teamId: team?.id || "",
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

export async function POST(
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

    const submission = await Submission.findById(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Check if submission is locked
    if (submission.status !== "locked") {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot unlock submission with status "${submission.status}". Only locked submissions can be unlocked.`,
        },
        { status: 400 }
      );
    }

    // Unlock the submission by setting it back to "submitted"
    // This allows the team to edit and resubmit
    const previousStatus = submission.status;
    submission.status = "submitted";
    await submission.save();

    const updatedSubmission = await getSubmissionById(id);

    await recordAdminAuditLog({
      action: "unlock_submission",
      adminId: admin.userId,
      targetType: "submission",
      targetId: id,
      targetLabel:
        updatedSubmission?.projectTitle || submission.projectTitle || "Submission",
      details: {
        previousStatus,
        nextStatus: "submitted",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Submission unlocked successfully. Team can now edit and resubmit.",
        submission: transformSubmission(updatedSubmission),
        metadata: {
          unlockedAt: new Date().toISOString(),
          unlockedBy: admin.userId,
          previousStatus,
          newStatus: "submitted",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/submissions/[id]/unlock error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
