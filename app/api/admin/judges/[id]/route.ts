import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";

import "@/models/ProblemStatement";
import "@/models/User";

import User from "@/models/User";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import Evaluation from "@/models/Evaluation";
import JudgeAssignment from "@/models/JudgeAssignment";

type DisplayJudgeStatus = "Active" | "Pending" | "Blocked";
type DisplayAssignmentStatus = "Assigned" | "Partially Assigned" | "Not Assigned";

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

function getJudgeDisplayStatus(judge: any): DisplayJudgeStatus {
  if (judge?.judgeStatus === "blocked") return "Blocked";
  if (judge?.judgeStatus === "pending" || judge?.isApproved === false) {
    return "Pending";
  }
  return "Active";
}

function getAssignmentDisplayStatus(
  assignedProjects: number,
  completedReviews: number
): DisplayAssignmentStatus {
  if (assignedProjects === 0) return "Not Assigned";
  if (completedReviews < assignedProjects) return "Partially Assigned";
  return "Assigned";
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const judges = await User.find({ role: "judge" })
      .select(
        "name email college avatar isApproved judgeStatus createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const judgeIds = judges.map((judge) => judge._id);

    const assignments = judgeIds.length
      ? await JudgeAssignment.find({
          judge: { $in: judgeIds },
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
          .lean()
      : [];

    const evaluations = judgeIds.length
      ? await Evaluation.find({
          judge: { $in: judgeIds },
        })
          .select("judge submission status")
          .lean()
      : [];

    const assignmentsByJudge = new Map<string, any[]>();
    const evaluationsByJudge = new Map<string, any[]>();

    for (const assignment of assignments) {
      const judgeId = String(assignment.judge);
      const existing = assignmentsByJudge.get(judgeId) || [];
      existing.push(assignment);
      assignmentsByJudge.set(judgeId, existing);
    }

    for (const evaluation of evaluations) {
      const judgeId = String(evaluation.judge);
      const existing = evaluationsByJudge.get(judgeId) || [];
      existing.push(evaluation);
      evaluationsByJudge.set(judgeId, existing);
    }

    const items = judges.map((judge) => {
      const judgeId = String(judge._id);
      const judgeAssignments = assignmentsByJudge.get(judgeId) || [];
      const judgeEvaluations = evaluationsByJudge.get(judgeId) || [];

      const assignedProjects = judgeAssignments.length;
      const completedReviews = judgeEvaluations.filter(
        (evaluation) => evaluation.status === "submitted"
      ).length;
      const pendingReviews = Math.max(assignedProjects - completedReviews, 0);

      const categories = Array.from(
        new Set(
          judgeAssignments
            .map(
              (assignment) =>
                (assignment as any)?.submission?.team?.problemStatement?.category
            )
            .filter(Boolean)
        )
      );

      const expertise =
        categories.length > 0
          ? categories.slice(0, 2).join(" / ")
          : "General Review";

      const status = getJudgeDisplayStatus(judge);
      const assignmentStatus = getAssignmentDisplayStatus(
        assignedProjects,
        completedReviews
      );

      return {
        id: judgeId,
        name: judge.name || "Unnamed Judge",
        email: judge.email || "",
        institution: judge.college || "Not Provided",
        expertise,
        assignedProjects,
        completedReviews,
        pendingReviews,
        assignmentStatus,
        status,
        joinedAt: formatDate(judge.createdAt),
      };
    });

    const stats = {
      total: items.length,
      active: items.filter((judge) => judge.status === "Active").length,
      pending: items.filter((judge) => judge.status === "Pending").length,
      blocked: items.filter((judge) => judge.status === "Blocked").length,
      assigned: items.filter((judge) => judge.assignedProjects > 0).length,
      totalReviews: items.reduce(
        (sum, judge) => sum + judge.completedReviews,
        0
      ),
    };

    return NextResponse.json({
      items,
      stats,
    });
  } catch (error) {
    console.error("GET /api/admin/judges error:", error);

    return NextResponse.json(
      { message: "Failed to fetch judges." },
      { status: 500 }
    );
  }
}