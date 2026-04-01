import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { recordAdminAuditLog } from "@/lib/admin/audit";

import "@/models/ProblemStatement";
import "@/models/User";

import User from "@/models/User";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import Evaluation from "@/models/Evaluation";
import JudgeAssignment from "@/models/JudgeAssignment";

function formatDate(date?: Date | string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const currentUser = verifyToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

function getJudgeDisplayStatus(judge: any) {
  if (judge?.judgeStatus === "blocked") return "Blocked";
  if (judge?.judgeStatus === "pending" || judge?.isApproved === false) {
    return "Pending";
  }
  return "Active";
}

function getAssignmentDisplayStatus(
  assignedProjects: number,
  completedReviews: number
) {
  if (assignedProjects === 0) return "Not Assigned";
  if (completedReviews < assignedProjects) return "Partially Assigned";
  return "Assigned";
}

function getReviewStatus(evaluation?: { status?: string } | null) {
  if (!evaluation) return "Pending Review";
  if (evaluation.status === "submitted") return "Reviewed";
  return "In Progress";
}

function buildSubmissionCard(submission: any) {
  const team = submission?.team;
  const problem = team?.problemStatement || null;

  return {
    submissionId: String(submission._id),
    projectTitle: submission?.projectTitle || "Untitled Project",
    teamName: team?.teamName || "Untitled Team",
    problemTitle: problem?.title || "Problem not selected",
    submissionStatus: submission?.status || "draft",
    submittedAt: formatDate(submission?.submittedAt || submission?.createdAt),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const judge = await User.findOne({
      _id: id,
      role: "judge",
    })
      .select("name email college avatar isApproved judgeStatus createdAt")
      .lean();

    if (!judge) {
      return NextResponse.json({ message: "Judge not found." }, { status: 404 });
    }

const currentAssignments = await JudgeAssignment.find({
  judge: id,
})
  .populate({
    path: "submission",
    model: Submission,
    populate: {
      path: "team",
      model: Team,
      populate: {
        path: "problemStatement",
        select: "title category difficulty",
      },
    },
  })
  .sort({ createdAt: -1 })
  .lean();

const validAssignments = currentAssignments.filter(
  (assignment: any) => assignment?.submission && assignment?.submission?.team
);
const assignedSubmissionIds = validAssignments
  .map((assignment) => assignment?.submission?._id)
  .filter(Boolean)
  .map((id) => String(id));

    const evaluations = assignedSubmissionIds.length
      ? await Evaluation.find({
          judge: id,
          submission: { $in: assignedSubmissionIds },
        })
          .select("submission status totalScore updatedAt")
          .lean()
      : [];

    const evaluationBySubmission = new Map(
      evaluations.map((evaluation: any) => [
        String(evaluation.submission),
        evaluation,
      ])
    );

    const allReviewableSubmissions = await Submission.find({
      status: { $in: ["submitted", "locked"] },
    })
      .populate({
        path: "team",
        model: Team,
        populate: {
          path: "problemStatement",
          select: "title category difficulty",
        },
      })
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    const allReviewableSubmissionIds = allReviewableSubmissions.map(
      (submission) => submission._id
    );

    const assignmentCounts = allReviewableSubmissionIds.length
      ? await JudgeAssignment.aggregate([
          {
            $match: {
              submission: { $in: allReviewableSubmissionIds },
            },
          },
          {
            $group: {
              _id: "$submission",
              count: { $sum: 1 },
            },
          },
        ])
      : [];

    const assignmentCountMap = new Map(
      assignmentCounts.map((item: any) => [String(item._id), item.count])
    );

    const assignedCards = currentAssignments
      .filter((assignment: any) => assignment?.submission && assignment?.submission?.team)
      .map((assignment: any) => {
        const submission = assignment.submission;
        const evaluation =
          evaluationBySubmission.get(String(submission._id)) || null;

        return {
          assignmentId: String(assignment._id),
          ...buildSubmissionCard(submission),
          reviewStatus: getReviewStatus(evaluation),
          evaluationStatus: evaluation?.status || null,
          totalScore:
            typeof evaluation?.totalScore === "number"
              ? evaluation.totalScore
              : null,
          canUnassign: !evaluation,
        };
      });

    const assignedSubmissionIdSet = new Set(
      assignedCards.map((item) => item.submissionId)
    );

    const availableCards = allReviewableSubmissions
      .filter(
        (submission: any) =>
          submission?.team && !assignedSubmissionIdSet.has(String(submission._id))
      )
      .map((submission: any) => ({
        ...buildSubmissionCard(submission),
        assignedJudgesCount:
          assignmentCountMap.get(String(submission._id)) || 0,
      }));

    const completedReviews = evaluations.filter(
      (evaluation) => evaluation.status === "submitted"
    ).length;
    const assignedProjects = assignedCards.length;
    const pendingReviews = Math.max(assignedProjects - completedReviews, 0);

    const categories = Array.from(
      new Set(
        currentAssignments
          .map(
            (assignment: any) =>
              assignment?.submission?.team?.problemStatement?.category
          )
          .filter(Boolean)
      )
    );

    return NextResponse.json({
      judge: {
        id: String(judge._id),
        name: judge.name || "Unnamed Judge",
        email: judge.email || "",
        institution: judge.college || "Not Provided",
        expertise:
          categories.length > 0
            ? categories.slice(0, 2).join(" / ")
            : "General Review",
        assignedProjects,
        completedReviews,
        pendingReviews,
        assignmentStatus: getAssignmentDisplayStatus(
          assignedProjects,
          completedReviews
        ),
        status: getJudgeDisplayStatus(judge),
        joinedAt: formatDate(judge.createdAt),
      },
      summary: {
        reviewableSubmissions: allReviewableSubmissions.length,
        assignedProjects,
        completedReviews,
        pendingReviews,
      },
      assignedSubmissions: assignedCards,
      availableSubmissions: availableCards,
    });
  } catch (error) {
    console.error("GET /api/admin/judges/[id]/assignments error:", error);

    return NextResponse.json(
      { message: "Failed to fetch judge assignment details." },
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const judge = await User.findOne({
      _id: id,
      role: "judge",
    }).select("_id name email");

    if (!judge) {
      return NextResponse.json({ message: "Judge not found." }, { status: 404 });
    }

  const submissionIds: string[] = Array.isArray(body?.submissionIds)
  ? Array.from(
      new Set(
        body.submissionIds.filter(
          (id: unknown): id is string =>
            typeof id === "string" && id.trim().length > 0
        )
      )
    )
  : [];

    if (submissionIds.length === 0) {
      return NextResponse.json(
        { message: "Select at least one submission." },
        { status: 400 }
      );
    }

    const validSubmissions = await Submission.find({
      _id: { $in: submissionIds },
      status: { $in: ["submitted", "locked"] },
    }).select("_id");

    const validSubmissionIds = validSubmissions.map((submission) =>
      String(submission._id)
    );

    if (validSubmissionIds.length === 0) {
      return NextResponse.json(
        { message: "No valid reviewable submissions were selected." },
        { status: 400 }
      );
    }

    const existingAssignments = await JudgeAssignment.find({
      judge: id,
      submission: { $in: validSubmissionIds },
    }).select("submission");

    const existingSubmissionIdSet = new Set(
      existingAssignments.map((assignment) => String(assignment.submission))
    );

    const toCreate = validSubmissionIds.filter(
      (submissionId) => !existingSubmissionIdSet.has(submissionId)
    );

    if (toCreate.length === 0) {
      return NextResponse.json({
        message: "Selected submissions are already assigned to this judge.",
        createdCount: 0,
      });
    }

    await JudgeAssignment.insertMany(
      toCreate.map((submissionId) => ({
        judge: id,
        submission: submissionId,
        assignedBy: currentUser.userId,
      }))
    );

    await recordAdminAuditLog({
      action: "assign_judge_submissions",
      adminId: currentUser.userId,
      targetType: "judge",
      targetId: id,
      targetLabel: judge.name || judge.email || "Judge",
      details: {
        submissionIds: toCreate,
        createdCount: toCreate.length,
      },
    });

    return NextResponse.json({
      message: "Submissions assigned successfully.",
      createdCount: toCreate.length,
    });
  } catch (error) {
    console.error("POST /api/admin/judges/[id]/assignments error:", error);

    return NextResponse.json(
      { message: "Failed to assign submissions." },
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const submissionId =
      typeof body?.submissionId === "string" ? body.submissionId : "";

    if (!submissionId) {
      return NextResponse.json(
        { message: "Submission id is required." },
        { status: 400 }
      );
    }

    const existingEvaluation = await Evaluation.findOne({
      judge: id,
      submission: submissionId,
    }).select("_id status");

    if (existingEvaluation) {
      return NextResponse.json(
        {
          message:
            "This assignment cannot be removed because the judge has already started or submitted a review.",
        },
        { status: 400 }
      );
    }

    const deletedAssignment = await JudgeAssignment.findOneAndDelete({
      judge: id,
      submission: submissionId,
    });

    if (!deletedAssignment) {
      return NextResponse.json(
        { message: "Assignment not found." },
        { status: 404 }
      );
    }

    await recordAdminAuditLog({
      action: "remove_judge_submission_assignment",
      adminId: currentUser.userId,
      targetType: "judge",
      targetId: id,
      targetLabel: id,
      details: {
        submissionId,
      },
    });

    return NextResponse.json({
      message: "Assignment removed successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/judges/[id]/assignments error:", error);

    return NextResponse.json(
      { message: "Failed to remove assignment." },
      { status: 500 }
    );
  }
}
