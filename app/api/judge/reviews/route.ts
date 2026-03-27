import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";

import "@/models/User";
import "@/models/ProblemStatement";

import Submission from "@/models/Submission";
import Team from "@/models/Team";
import Evaluation from "@/models/Evaluation";
import JudgeAssignment from "@/models/JudgeAssignment";

function getReviewStatus(evaluation?: { status?: string } | null) {
  if (!evaluation) return "pending";
  if (evaluation.status === "submitted") return "reviewed";
  return "in-progress";
}

function getUniqueMemberCount(team: any) {
  const ids = new Set<string>();

  if (team?.leader?._id) {
    ids.add(String(team.leader._id));
  }

  if (Array.isArray(team?.members)) {
    team.members.forEach((member: any) => {
      if (member?._id) ids.add(String(member._id));
    });
  }

  return ids.size;
}

function buildReviewItem({
  submission,
  assignment,
  evaluation,
}: {
  submission: any;
  assignment: any;
  evaluation?: any | null;
}) {
  const team = submission?.team;
  const problem = team?.problemStatement || null;

  if (!submission || !team || !assignment?._id) return null;

  return {
    id: String(assignment._id),
    assignmentId: String(assignment._id),
    submissionId: String(submission._id),
    teamId: team?._id ? String(team._id) : "",
    teamName: team?.teamName || "Untitled Team",
    projectTitle: submission?.projectTitle || "Untitled Project",
    description: submission?.description || "",
    problemTitle: problem?.title || "Problem not selected",
    problemSlug: problem?.slug || "",
    problemCategory: problem?.category || "",
    problemDifficulty: problem?.difficulty || "",
    memberCount: getUniqueMemberCount(team),
    githubLink: submission?.githubLink || "",
    demoLink: submission?.demoLink || "",
    pptLink: submission?.pptLink || "",
    videoLink: submission?.videoLink || "",
    techStack: Array.isArray(submission?.techStack) ? submission.techStack : [],
    images: Array.isArray(submission?.images) ? submission.images : [],
    submissionStatus: submission?.status || "draft",
    submittedAt: submission?.submittedAt || null,
    reviewStatus: getReviewStatus(evaluation),
    evaluation: evaluation
      ? {
          status: evaluation.status || "draft",
          totalScore:
            typeof evaluation.totalScore === "number"
              ? evaluation.totalScore
              : 0,
          updatedAt: evaluation.updatedAt || null,
        }
      : null,
    source: "assigned" as const,
    isAssigned: true,
    assignedAt: assignment?.createdAt || null,
    createdAt: submission?.createdAt || null,
    updatedAt: submission?.updatedAt || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("hacksphere_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = verifyToken(token);

    if (!currentUser || currentUser.role !== "judge") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const assignments = (await JudgeAssignment.find({
      judge: currentUser.userId,
    })
      .populate({
        path: "submission",
        model: Submission,
        populate: {
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
              select: "title slug category difficulty status fullDescription",
            },
          ],
        },
      })
      .sort({ createdAt: -1 })
      .lean()) as any[];

    const validAssignments = assignments.filter(
      (assignment) => assignment?.submission && assignment?.submission?.team
    );

    const submissionIds = validAssignments
      .map((assignment) => assignment?.submission?._id)
      .filter(Boolean);

    const evaluations = submissionIds.length
      ? await Evaluation.find({
          judge: currentUser.userId,
          submission: { $in: submissionIds },
        })
          .select(
            "submission innovation technicalComplexity uiUx impact presentation totalScore feedback status submittedAt updatedAt"
          )
          .lean()
      : [];

    const evaluationMap = new Map(
      evaluations.map((evaluation: any) => [
        String(evaluation.submission),
        evaluation,
      ])
    );

    const items = validAssignments
      .map((assignment) =>
        buildReviewItem({
          submission: assignment.submission,
          assignment,
          evaluation:
            evaluationMap.get(String(assignment.submission?._id)) || null,
        })
      )
      .filter(Boolean);

    const counts = {
      total: items.length,
      pending: items.filter((item: any) => item.reviewStatus === "pending")
        .length,
      inProgress: items.filter(
        (item: any) => item.reviewStatus === "in-progress"
      ).length,
      reviewed: items.filter((item: any) => item.reviewStatus === "reviewed")
        .length,
    };

    return NextResponse.json({
      items,
      counts,
    });
  } catch (error) {
    console.error("GET /api/judge/reviews error:", error);

    return NextResponse.json(
      { message: "Failed to fetch judge reviews." },
      { status: 500 }
    );
  }
}