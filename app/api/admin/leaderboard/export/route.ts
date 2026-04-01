import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { recordAdminAuditLog } from "@/lib/admin/audit";
import { buildAdminLeaderboardData } from "@/lib/leaderboard";
import { buildCsv } from "@/lib/csv";
import Evaluation from "@/models/Evaluation";
import "@/models/User";
import "@/models/Submission";
import "@/models/Team";
import "@/models/ProblemStatement";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const currentUser = verifyToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

function formatIsoDate(value?: string | Date | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const leaderboard = await buildAdminLeaderboardData();
    const evaluations = (await Evaluation.find({ status: "submitted" })
      .populate({
        path: "judge",
        select: "name email college",
      })
      .populate({
        path: "submission",
        select: "projectTitle status submittedAt createdAt team",
        populate: {
          path: "team",
          select: "teamName problemStatement",
          populate: {
            path: "problemStatement",
            select: "title",
          },
        },
      })
      .sort({ submittedAt: 1, updatedAt: 1 })
      .lean()) as any[];

    const leaderboardRowBySubmissionId = new Map(
      leaderboard.rows.map((row) => [row.submissionId, row])
    );

    const evaluationsBySubmissionId = new Map<string, any[]>();

    evaluations.forEach((evaluation) => {
      const submissionId = evaluation?.submission?._id
        ? String(evaluation.submission._id)
        : evaluation?.submission
        ? String(evaluation.submission)
        : "";

      if (!submissionId) return;

      const existing = evaluationsBySubmissionId.get(submissionId) || [];
      existing.push(evaluation);
      evaluationsBySubmissionId.set(submissionId, existing);
    });

    const headers = [
      "Rank",
      "Team Name",
      "Project Title",
      "Problem Title",
      "Submission ID",
      "Submission Status",
      "Submission Time",
      "Assigned Judges",
      "Completed Reviews",
      "Pending Judges",
      "Review Status",
      "Average Final Score",
      "Average Innovation",
      "Average Technical Complexity",
      "Average UI/UX",
      "Average Impact",
      "Average Presentation",
      "Judge Name",
      "Judge Email",
      "Judge College",
      "Evaluation Status",
      "Innovation Score",
      "Technical Complexity Score",
      "UI/UX Score",
      "Impact Score",
      "Presentation Score",
      "Judge Total Score",
      "Judge Feedback",
      "Evaluation Submitted At",
      "Evaluation Updated At",
    ];

    const csvRows = leaderboard.rows.flatMap((row) => {
      const submissionEvaluations =
        evaluationsBySubmissionId.get(row.submissionId) || [];

      if (submissionEvaluations.length === 0) {
        return [
          {
            Rank: row.rank,
            "Team Name": row.teamName,
            "Project Title": row.projectTitle,
            "Problem Title": row.problemTitle,
            "Submission ID": row.submissionId,
            "Submission Status": "",
            "Submission Time": row.submittedAtRaw || "",
            "Assigned Judges": row.assignedJudges,
            "Completed Reviews": row.reviewsCount,
            "Pending Judges": row.pendingJudges,
            "Review Status": row.reviewStatus,
            "Average Final Score": row.finalScore,
            "Average Innovation": row.scoreBreakdown.innovation,
            "Average Technical Complexity": row.scoreBreakdown.technicalComplexity,
            "Average UI/UX": row.scoreBreakdown.uiUx,
            "Average Impact": row.scoreBreakdown.impact,
            "Average Presentation": row.scoreBreakdown.presentation,
            "Judge Name": "",
            "Judge Email": "",
            "Judge College": "",
            "Evaluation Status": "",
            "Innovation Score": "",
            "Technical Complexity Score": "",
            "UI/UX Score": "",
            "Impact Score": "",
            "Presentation Score": "",
            "Judge Total Score": "",
            "Judge Feedback": "",
            "Evaluation Submitted At": "",
            "Evaluation Updated At": "",
          },
        ];
      }

      return submissionEvaluations.map((evaluation) => {
        const submission = evaluation?.submission;
        const judge = evaluation?.judge;
        const matchedRow =
          leaderboardRowBySubmissionId.get(
            submission?._id ? String(submission._id) : row.submissionId
          ) || row;

        return {
          Rank: matchedRow.rank,
          "Team Name":
            submission?.team?.teamName || matchedRow.teamName,
          "Project Title": submission?.projectTitle || matchedRow.projectTitle,
          "Problem Title":
            submission?.team?.problemStatement?.title || matchedRow.problemTitle,
          "Submission ID": matchedRow.submissionId,
          "Submission Status": submission?.status || "",
          "Submission Time":
            formatIsoDate(submission?.submittedAt || submission?.createdAt) ||
            matchedRow.submittedAtRaw ||
            "",
          "Assigned Judges": matchedRow.assignedJudges,
          "Completed Reviews": matchedRow.reviewsCount,
          "Pending Judges": matchedRow.pendingJudges,
          "Review Status": matchedRow.reviewStatus,
          "Average Final Score": matchedRow.finalScore,
          "Average Innovation": matchedRow.scoreBreakdown.innovation,
          "Average Technical Complexity":
            matchedRow.scoreBreakdown.technicalComplexity,
          "Average UI/UX": matchedRow.scoreBreakdown.uiUx,
          "Average Impact": matchedRow.scoreBreakdown.impact,
          "Average Presentation": matchedRow.scoreBreakdown.presentation,
          "Judge Name": judge?.name || "",
          "Judge Email": judge?.email || "",
          "Judge College": judge?.college || "",
          "Evaluation Status": evaluation?.status || "",
          "Innovation Score": evaluation?.innovation ?? "",
          "Technical Complexity Score":
            evaluation?.technicalComplexity ?? "",
          "UI/UX Score": evaluation?.uiUx ?? "",
          "Impact Score": evaluation?.impact ?? "",
          "Presentation Score": evaluation?.presentation ?? "",
          "Judge Total Score": evaluation?.totalScore ?? "",
          "Judge Feedback": evaluation?.feedback || "",
          "Evaluation Submitted At": formatIsoDate(evaluation?.submittedAt),
          "Evaluation Updated At": formatIsoDate(evaluation?.updatedAt),
        };
      });
    });

    const csv = "\uFEFF" + buildCsv(headers, csvRows);
    const generatedAt = new Date();
    const filename = `leaderboard-evaluations-${generatedAt
      .toISOString()
      .slice(0, 10)}.csv`;

    await recordAdminAuditLog({
      action: "export_leaderboard_evaluations_csv",
      adminId: currentUser.userId,
      targetType: "leaderboard",
      targetLabel: "Leaderboard evaluation export",
      details: {
        exportedAt: generatedAt.toISOString(),
        submittedEvaluationCount: evaluations.length,
        rankedSubmissionCount: leaderboard.rows.length,
      },
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/leaderboard/export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export leaderboard evaluations.",
      },
      { status: 500 }
    );
  }
}
