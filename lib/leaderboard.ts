import "@/models/User";
import "@/models/ProblemStatement";

import Team from "@/models/Team";
import Submission from "@/models/Submission";
import Evaluation from "@/models/Evaluation";
import JudgeAssignment from "@/models/JudgeAssignment";

export type AdminLeaderboardRow = {
  id: string;
  rank: number;
  teamId: string;
  submissionId: string;
  teamName: string;
  projectTitle: string;
  problemTitle: string;
  members: number;
  finalScore: number;
  reviewsCount: number;
  assignedJudges: number;
  pendingJudges: number;
  reviewStatus: "Completed" | "Pending";
  submissionTime: string;
  submittedAtRaw: string | null;
  scoreBreakdown: {
    innovation: number;
    technicalComplexity: number;
    uiUx: number;
    impact: number;
    presentation: number;
  };
};

export type AdminLeaderboardStats = {
  totalTeams: number;
  completedReviews: number;
  highestScore: number;
  averageScore: string;
};

function roundToOne(value: number) {
  return Math.round(value * 10) / 10;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getUniqueMemberCount(team: any) {
  const ids = new Set<string>();

  if (team?.leader?._id) {
    ids.add(String(team.leader._id));
  }

  if (Array.isArray(team?.members)) {
    team.members.forEach((member: any) => {
      if (member?._id) {
        ids.add(String(member._id));
      }
    });
  }

  return ids.size;
}

export async function buildAdminLeaderboardData(): Promise<{
  rows: AdminLeaderboardRow[];
  stats: AdminLeaderboardStats;
  topThree: AdminLeaderboardRow[];
}> {
  // The leaderboard is intentionally derived on demand from the latest
  // submitted evaluations so admins always review current ranking data.
  const submissions = (await Submission.find({
    status: { $in: ["submitted", "locked"] },
  })
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
          select: "title slug category difficulty",
        },
      ],
    })
    .sort({ submittedAt: 1, createdAt: 1 })
    .lean()) as any[];

  const submissionIds = submissions.map((submission) => submission._id);

  const submittedEvaluations = submissionIds.length
    ? ((await Evaluation.find({
        submission: { $in: submissionIds },
        status: "submitted",
      }).lean()) as any[])
    : [];

  const assignmentCounts = submissionIds.length
    ? ((await JudgeAssignment.aggregate([
        {
          $match: {
            submission: { $in: submissionIds },
          },
        },
        {
          $group: {
            _id: "$submission",
            count: { $sum: 1 },
          },
        },
      ])) as any[])
    : [];

  const evaluationsBySubmission = new Map<string, any[]>();
  const assignmentCountMap = new Map<string, number>();

  submittedEvaluations.forEach((evaluation) => {
    const key = String(evaluation.submission);
    const list = evaluationsBySubmission.get(key) || [];
    list.push(evaluation);
    evaluationsBySubmission.set(key, list);
  });

  assignmentCounts.forEach((item) => {
    assignmentCountMap.set(String(item._id), item.count);
  });

  const unsortedRows: AdminLeaderboardRow[] = submissions
    .filter((submission) => submission?.team)
    .map((submission) => {
      const submissionId = String(submission._id);
      const team = submission.team;
      const problem = team?.problemStatement || null;
      const evaluationList = evaluationsBySubmission.get(submissionId) || [];
      const reviewsCount = evaluationList.length;
      const assignedJudges = assignmentCountMap.get(submissionId) || 0;
      const pendingJudges = Math.max(assignedJudges - reviewsCount, 0);

      const totals = evaluationList.reduce(
        (acc, evaluation) => {
          acc.totalScore += Number(evaluation.totalScore || 0);
          acc.innovation += Number(evaluation.innovation || 0);
          acc.technicalComplexity += Number(evaluation.technicalComplexity || 0);
          acc.uiUx += Number(evaluation.uiUx || 0);
          acc.impact += Number(evaluation.impact || 0);
          acc.presentation += Number(evaluation.presentation || 0);
          return acc;
        },
        {
          totalScore: 0,
          innovation: 0,
          technicalComplexity: 0,
          uiUx: 0,
          impact: 0,
          presentation: 0,
        }
      );

      const finalScore =
        reviewsCount > 0 ? roundToOne(totals.totalScore / reviewsCount) : 0;

      const scoreBreakdown =
        reviewsCount > 0
          ? {
              innovation: roundToOne(totals.innovation / reviewsCount),
              technicalComplexity: roundToOne(
                totals.technicalComplexity / reviewsCount
              ),
              uiUx: roundToOne(totals.uiUx / reviewsCount),
              impact: roundToOne(totals.impact / reviewsCount),
              presentation: roundToOne(totals.presentation / reviewsCount),
            }
          : {
              innovation: 0,
              technicalComplexity: 0,
              uiUx: 0,
              impact: 0,
              presentation: 0,
            };

      const reviewStatus =
        assignedJudges > 0
          ? reviewsCount >= assignedJudges
            ? "Completed"
            : "Pending"
          : reviewsCount > 0
            ? "Completed"
            : "Pending";

      return {
        id: submissionId,
        rank: 0,
        teamId: team?._id ? String(team._id) : "",
        submissionId,
        teamName: team?.teamName || "Untitled Team",
        projectTitle: submission?.projectTitle || "Untitled Project",
        problemTitle: problem?.title || "Problem not selected",
        members: getUniqueMemberCount(team),
        finalScore,
        reviewsCount,
        assignedJudges,
        pendingJudges,
        reviewStatus,
        submissionTime: formatDate(submission?.submittedAt || submission?.createdAt),
        submittedAtRaw: submission?.submittedAt
          ? new Date(submission.submittedAt).toISOString()
          : submission?.createdAt
            ? new Date(submission.createdAt).toISOString()
            : null,
        scoreBreakdown,
      };
    });

  const rows = [...unsortedRows]
    .sort((a, b) => {
      // Ranking priority:
      // 1. Teams with at least one submitted review
      // 2. Higher average final score
      // 3. Greater completed review count
      // 4. Earlier submission time
      const aReviewed = a.reviewsCount > 0 ? 1 : 0;
      const bReviewed = b.reviewsCount > 0 ? 1 : 0;

      if (bReviewed !== aReviewed) return bReviewed - aReviewed;
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.reviewsCount !== a.reviewsCount) return b.reviewsCount - a.reviewsCount;

      const aTime = a.submittedAtRaw ? new Date(a.submittedAtRaw).getTime() : 0;
      const bTime = b.submittedAtRaw ? new Date(b.submittedAtRaw).getTime() : 0;

      return aTime - bTime;
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

  const reviewedRows = rows.filter((row) => row.reviewsCount > 0);

  const stats: AdminLeaderboardStats = {
    totalTeams: rows.length,
    completedReviews: rows.filter((row) => row.reviewStatus === "Completed")
      .length,
    highestScore: reviewedRows.length ? reviewedRows[0].finalScore : 0,
    averageScore: reviewedRows.length
      ? roundToOne(
          reviewedRows.reduce((sum, row) => sum + row.finalScore, 0) /
            reviewedRows.length
        ).toFixed(1)
      : "0.0",
  };

  return {
    rows,
    stats,
    topThree: rows.slice(0, 3),
  };
}
