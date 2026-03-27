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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function normalizeScore(value: unknown) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) return null;
  if (numericValue < 0 || numericValue > 10) return null;

  return numericValue;
}

function hasSubmittedEvaluationChanged(
  existingEvaluation: any,
  nextValues: {
    innovation: number;
    technicalComplexity: number;
    uiUx: number;
    impact: number;
    presentation: number;
    feedback: string;
    status: "draft" | "submitted";
  }
) {
  if (!existingEvaluation) return true;

  return (
    existingEvaluation.innovation !== nextValues.innovation ||
    existingEvaluation.technicalComplexity !==
      nextValues.technicalComplexity ||
    existingEvaluation.uiUx !== nextValues.uiUx ||
    existingEvaluation.impact !== nextValues.impact ||
    existingEvaluation.presentation !== nextValues.presentation ||
    (existingEvaluation.feedback || "") !== nextValues.feedback ||
    existingEvaluation.status !== nextValues.status
  );
}

async function getPopulatedAssignment(assignmentId: string, judgeId: string) {
  return (await JudgeAssignment.findOne({
    _id: assignmentId,
    judge: judgeId,
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
    .lean()) as any;
}

function buildDetailPayload({
  submission,
  evaluation,
  assignmentId,
}: {
  submission: any;
  evaluation?: any | null;
  assignmentId: string;
}) {
  const team = submission?.team;
  const problem = team?.problemStatement || null;

  const memberMap = new Map<string, any>();

  if (team?.leader?._id) {
    memberMap.set(String(team.leader._id), {
      id: String(team.leader._id),
      name: team.leader.name || "Unnamed User",
      email: team.leader.email || "",
      college: team.leader.college || "",
      avatar: team.leader.avatar || "",
      isApproved: Boolean(team.leader.isApproved),
      role: "Team Leader",
      initials: getInitials(team.leader.name || "TL"),
    });
  }

  if (Array.isArray(team?.members)) {
    team.members.forEach((member: any) => {
      if (!member?._id) return;

      const memberId = String(member._id);

      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          id: memberId,
          name: member.name || "Unnamed User",
          email: member.email || "",
          college: member.college || "",
          avatar: member.avatar || "",
          isApproved: Boolean(member.isApproved),
          role: "Team Member",
          initials: getInitials(member.name || "TM"),
        });
      }
    });
  }

  return {
    id: assignmentId,
    assignmentId,
    submissionId: String(submission._id),
    teamId: team?._id ? String(team._id) : "",
    teamName: team?.teamName || "Untitled Team",
    projectTitle: submission?.projectTitle || "Untitled Project",
    description: submission?.description || "",
    selectedProblem:
      problem?.fullDescription || problem?.title || "Problem not selected",
    problemTitle: problem?.title || "Problem not selected",
    category: problem?.category || "",
    difficulty: problem?.difficulty || "",
    members: Array.from(memberMap.values()),
    techStack: Array.isArray(submission?.techStack) ? submission.techStack : [],
    githubLink: submission?.githubLink || "",
    demoLink: submission?.demoLink || "",
    pptLink: submission?.pptLink || "",
    videoLink: submission?.videoLink || "",
    screenshots: Array.isArray(submission?.images) ? submission.images : [],
    submissionStatus: submission?.status || "draft",
    submittedAt: submission?.submittedAt || null,
    reviewStatus: getReviewStatus(evaluation),
    source: "assigned" as const,
    evaluation: evaluation
      ? {
          innovation: evaluation.innovation ?? 0,
          technicalComplexity: evaluation.technicalComplexity ?? 0,
          uiUx: evaluation.uiUx ?? 0,
          impact: evaluation.impact ?? 0,
          presentation: evaluation.presentation ?? 0,
          totalScore: evaluation.totalScore ?? 0,
          feedback: evaluation.feedback || "",
          status: evaluation.status || "draft",
          submittedAt: evaluation.submittedAt || null,
          updatedAt: evaluation.updatedAt || null,
        }
      : null,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validates: Only the assigned judge can fetch this review detail
    const assignment = await getPopulatedAssignment(id, currentUser.userId);

    if (!assignment?.submission || !assignment?.submission?.team) {
      return NextResponse.json(
        { message: "Assigned review not found." },
        { status: 404 }
      );
    }

    const evaluation = (await Evaluation.findOne({
      submission: assignment.submission._id,
      judge: currentUser.userId,
    }).lean()) as any | null;

    return NextResponse.json({
      item: buildDetailPayload({
        submission: assignment.submission,
        evaluation,
        assignmentId: String(assignment._id),
      }),
    });
  } catch (error) {
    console.error("GET /api/judge/reviews/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to fetch review details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validates: Only submissions explicitly assigned to this judge can be updated
    const assignment = await JudgeAssignment.findOne({
      _id: id,
      judge: currentUser.userId,
    }).select("submission");

    if (!assignment?.submission) {
      return NextResponse.json(
        { message: "Assigned review not found." },
        { status: 404 }
      );
    }

    const submissionId = String(assignment.submission);

    const body = await request.json();
    const confirmSubmittedEdit = Boolean(body?.confirmSubmittedEdit);

    const innovation = normalizeScore(body?.innovation);
    const technicalComplexity = normalizeScore(body?.technicalComplexity);
    const uiUx = normalizeScore(body?.uiUx);
    const impact = normalizeScore(body?.impact);
    const presentation = normalizeScore(body?.presentation);

    if (
      innovation === null ||
      technicalComplexity === null ||
      uiUx === null ||
      impact === null ||
      presentation === null
    ) {
      return NextResponse.json(
        { message: "Each score must be between 0 and 10." },
        { status: 400 }
      );
    }

    const feedback =
      typeof body?.feedback === "string" ? body.feedback.trim() : "";

    const status = body?.status === "submitted" ? "submitted" : "draft";

    const totalScore =
      innovation +
      technicalComplexity +
      uiUx +
      impact +
      presentation;

    if (status === "submitted") {
      const allScored = [
        innovation,
        technicalComplexity,
        uiUx,
        impact,
        presentation,
      ].every((value) => value > 0);

      if (!allScored) {
        return NextResponse.json(
          { message: "Please score all criteria before submitting." },
          { status: 400 }
        );
      }

      if (feedback.length < 20) {
        return NextResponse.json(
          {
            message:
              "Please provide meaningful feedback of at least 20 characters before submitting.",
          },
          { status: 400 }
        );
      }
    }

    const existingEvaluation = await Evaluation.findOne({
      submission: submissionId,
      judge: currentUser.userId,
    });

    if (existingEvaluation?.status === "submitted" && status !== "submitted") {
      return NextResponse.json(
        { message: "Submitted reviews cannot be moved back to draft." },
        { status: 400 }
      );
    }

    if (existingEvaluation?.status === "submitted") {
      const submittedReviewChanged = hasSubmittedEvaluationChanged(
        existingEvaluation,
        {
          innovation,
          technicalComplexity,
          uiUx,
          impact,
          presentation,
          feedback,
          status,
        }
      );

      if (!submittedReviewChanged) {
        return NextResponse.json({
          message: "No changes detected in the submitted review.",
          evaluation: {
            innovation: existingEvaluation.innovation,
            technicalComplexity: existingEvaluation.technicalComplexity,
            uiUx: existingEvaluation.uiUx,
            impact: existingEvaluation.impact,
            presentation: existingEvaluation.presentation,
            totalScore: existingEvaluation.totalScore,
            feedback: existingEvaluation.feedback,
            status: existingEvaluation.status,
            submittedAt: existingEvaluation.submittedAt,
            updatedAt: existingEvaluation.updatedAt,
          },
          reviewStatus: getReviewStatus(existingEvaluation),
        });
      }

      if (!confirmSubmittedEdit) {
        return NextResponse.json(
          {
            message:
              "This review has already been submitted. Confirm before updating it.",
            requiresConfirmation: true,
            evaluation: {
              innovation: existingEvaluation.innovation,
              technicalComplexity: existingEvaluation.technicalComplexity,
              uiUx: existingEvaluation.uiUx,
              impact: existingEvaluation.impact,
              presentation: existingEvaluation.presentation,
              totalScore: existingEvaluation.totalScore,
              feedback: existingEvaluation.feedback,
              status: existingEvaluation.status,
              submittedAt: existingEvaluation.submittedAt,
              updatedAt: existingEvaluation.updatedAt,
            },
            reviewStatus: getReviewStatus(existingEvaluation),
          },
          { status: 409 }
        );
      }
    }

    const evaluation =
      existingEvaluation ||
      new Evaluation({
        submission: submissionId,
        judge: currentUser.userId,
      });

    evaluation.innovation = innovation;
    evaluation.technicalComplexity = technicalComplexity;
    evaluation.uiUx = uiUx;
    evaluation.impact = impact;
    evaluation.presentation = presentation;
    evaluation.totalScore = totalScore;
    evaluation.feedback = feedback;
    evaluation.status = status;
    evaluation.submittedAt =
      status === "submitted" ? evaluation.submittedAt || new Date() : null;

    await evaluation.save();

    return NextResponse.json({
      message:
        status === "submitted"
          ? existingEvaluation?.status === "submitted"
            ? "Submitted review updated successfully."
            : "Review submitted successfully."
          : "Review draft saved successfully.",
      evaluation: {
        innovation: evaluation.innovation,
        technicalComplexity: evaluation.technicalComplexity,
        uiUx: evaluation.uiUx,
        impact: evaluation.impact,
        presentation: evaluation.presentation,
        totalScore: evaluation.totalScore,
        feedback: evaluation.feedback,
        status: evaluation.status,
        submittedAt: evaluation.submittedAt,
        updatedAt: evaluation.updatedAt,
      },
      reviewStatus: getReviewStatus(evaluation),
    });
  } catch (error) {
    console.error("PATCH /api/judge/reviews/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to save review." },
      { status: 500 }
    );
  }
}