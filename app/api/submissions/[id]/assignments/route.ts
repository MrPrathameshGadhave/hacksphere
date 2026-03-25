import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";

import "@/models/User";
import "@/models/ProblemStatement";

import User from "@/models/User";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import Evaluation from "@/models/Evaluation";
import JudgeAssignment from "@/models/JudgeAssignment";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const currentUser = verifyToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getJudgeStatus(judge: any): "Active" | "Pending" | "Blocked" {
  if (judge?.judgeStatus === "blocked") return "Blocked";
  if (judge?.judgeStatus === "pending" || judge?.isApproved === false) {
    return "Pending";
  }
  return "Active";
}

function getReviewStatus(evaluation?: { status?: string } | null) {
  if (!evaluation) return "Pending Review";
  if (evaluation.status === "submitted") return "Reviewed";
  return "In Progress";
}

function getAssignmentStatus(
  assignedProjects: number,
  completedReviews: number
): "Assigned" | "Partially Assigned" | "Not Assigned" {
  if (assignedProjects === 0) return "Not Assigned";
  if (completedReviews < assignedProjects) return "Partially Assigned";
  return "Assigned";
}

async function loadSubmission(submissionId: string) {
  return Submission.findById(submissionId)
    .populate({
      path: "team",
      model: Team,
      populate: [
        {
          path: "leader",
          select: "name email college avatar isApproved",
        },
        {
          path: "members",
          select: "name email college avatar isApproved",
        },
        {
          path: "problemStatement",
          select: "title category difficulty",
        },
      ],
    })
    .lean();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const submission = (await loadSubmission(id)) as any;

    if (!submission || !submission.team) {
      return NextResponse.json(
        { success: false, message: "Submission not found." },
        { status: 404 }
      );
    }

    const team = submission.team;
    const problem = team?.problemStatement || null;

    const assignments = (await JudgeAssignment.find({
      submission: id,
    })
      .populate({
        path: "judge",
        model: User,
        select: "name email college avatar isApproved judgeStatus createdAt",
      })
      .sort({ createdAt: -1 })
      .lean()) as any[];

    const assignedJudgeIds = assignments
      .map((assignment) => assignment?.judge?._id)
      .filter(Boolean)
      .map((judgeId) => String(judgeId));

    const evaluations = assignedJudgeIds.length
      ? ((await Evaluation.find({
          submission: id,
          judge: { $in: assignedJudgeIds },
        })
          .select("judge status totalScore updatedAt")
          .lean()) as any[])
      : [];

    const evaluationMap = new Map(
      evaluations.map((evaluation) => [String(evaluation.judge), evaluation])
    );

    const allJudges = (await User.find({
      role: "judge",
    })
      .select("name email college avatar isApproved judgeStatus createdAt")
      .sort({ createdAt: -1 })
      .lean()) as any[];

    const assignmentCountDocs = (await JudgeAssignment.aggregate([
      {
        $group: {
          _id: "$judge",
          count: { $sum: 1 },
        },
      },
    ])) as any[];

    const reviewCountDocs = (await Evaluation.aggregate([
      {
        $match: {
          status: "submitted",
        },
      },
      {
        $group: {
          _id: "$judge",
          count: { $sum: 1 },
        },
      },
    ])) as any[];

    const assignmentCountMap = new Map(
      assignmentCountDocs.map((item) => [String(item._id), item.count])
    );

    const reviewCountMap = new Map(
      reviewCountDocs.map((item) => [String(item._id), item.count])
    );

    const assignedJudges = assignments
      .filter((assignment) => assignment?.judge)
      .map((assignment) => {
        const judge = assignment.judge;
        const judgeId = String(judge._id);
        const evaluation = evaluationMap.get(judgeId) || null;

        return {
          id: judgeId,
          name: judge.name || "Unnamed Judge",
          email: judge.email || "",
          institution: judge.college || "Not Provided",
          status: getJudgeStatus(judge),
          assignedAt: formatDate(assignment.createdAt),
          reviewStatus: getReviewStatus(evaluation),
          evaluationStatus: evaluation?.status || null,
          totalScore:
            typeof evaluation?.totalScore === "number"
              ? evaluation.totalScore
              : null,
          canUnassign: !evaluation,
        };
      });

    const assignedJudgeIdSet = new Set(assignedJudges.map((judge) => judge.id));

    const availableJudges = allJudges
      .filter((judge) => !assignedJudgeIdSet.has(String(judge._id)))
      .map((judge) => {
        const judgeId = String(judge._id);
        const status = getJudgeStatus(judge);
        const assignedProjects = assignmentCountMap.get(judgeId) || 0;
        const completedReviews = reviewCountMap.get(judgeId) || 0;

        return {
          id: judgeId,
          name: judge.name || "Unnamed Judge",
          email: judge.email || "",
          institution: judge.college || "Not Provided",
          status,
          assignedProjects,
          completedReviews,
          assignmentStatus: getAssignmentStatus(
            assignedProjects,
            completedReviews
          ),
          canAssign: status === "Active",
        };
      });

    const completedReviews = assignedJudges.filter(
      (judge) => judge.reviewStatus === "Reviewed"
    ).length;

    const inProgressReviews = assignedJudges.filter(
      (judge) => judge.reviewStatus === "In Progress"
    ).length;

    const pendingReviews = assignedJudges.filter(
      (judge) => judge.reviewStatus === "Pending Review"
    ).length;

    return NextResponse.json({
      success: true,
      submission: {
        id: String(submission._id),
        teamId: team?._id ? String(team._id) : "",
        teamName: team?.teamName || "Untitled Team",
        projectTitle: submission?.projectTitle || "Untitled Project",
        problemTitle: problem?.title || "Problem not selected",
        submissionStatus: submission?.status || "draft",
        submittedAt: formatDate(submission?.submittedAt || submission?.updatedAt),
      },
      summary: {
        assignedJudges: assignedJudges.length,
        availableJudges: availableJudges.length,
        completedReviews,
        inProgressReviews,
        pendingReviews,
      },
      assignedJudges,
      availableJudges,
    });
  } catch (error) {
    console.error("GET /api/admin/submissions/[id]/assignments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch submission assignments.",
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const submission = await Submission.findOne({
      _id: id,
      status: { $in: ["submitted", "locked"] },
    }).select("_id status");

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Only submitted or locked submissions can be assigned.",
        },
        { status: 400 }
      );
    }

    const judgeIds = Array.isArray(body?.judgeIds)
      ? Array.from(new Set(body.judgeIds.filter(Boolean)))
      : [];

    if (judgeIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Select at least one judge." },
        { status: 400 }
      );
    }

    const judges = await User.find({
      _id: { $in: judgeIds },
      role: "judge",
    }).select("_id isApproved judgeStatus");

    const validJudgeIds = judges
      .filter((judge: any) => getJudgeStatus(judge) === "Active")
      .map((judge) => String(judge._id));

    if (validJudgeIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No active judges were selected." },
        { status: 400 }
      );
    }

    const existingAssignments = await JudgeAssignment.find({
      submission: id,
      judge: { $in: validJudgeIds },
    }).select("judge");

    const existingJudgeIdSet = new Set(
      existingAssignments.map((assignment) => String(assignment.judge))
    );

    const toCreate = validJudgeIds.filter(
      (judgeId) => !existingJudgeIdSet.has(judgeId)
    );

    if (toCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Selected judges are already assigned to this submission.",
        createdCount: 0,
      });
    }

    await JudgeAssignment.insertMany(
      toCreate.map((judgeId) => ({
        judge: judgeId,
        submission: id,
        assignedBy: currentUser.userId,
      }))
    );

    return NextResponse.json({
      success: true,
      message: "Judges assigned successfully.",
      createdCount: toCreate.length,
    });
  } catch (error) {
    console.error("POST /api/admin/submissions/[id]/assignments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign judges.",
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const judgeId = typeof body?.judgeId === "string" ? body.judgeId : "";

    if (!judgeId) {
      return NextResponse.json(
        { success: false, message: "Judge id is required." },
        { status: 400 }
      );
    }

    const existingEvaluation = await Evaluation.findOne({
      submission: id,
      judge: judgeId,
    }).select("_id status");

    if (existingEvaluation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This judge cannot be removed because review work already exists for this submission.",
        },
        { status: 400 }
      );
    }

    const deletedAssignment = await JudgeAssignment.findOneAndDelete({
      submission: id,
      judge: judgeId,
    });

    if (!deletedAssignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Judge removed from submission successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/submissions/[id]/assignments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove judge assignment.",
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}