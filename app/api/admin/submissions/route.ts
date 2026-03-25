import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Submission from "@/models/Submission";
import JudgeAssignment from "@/models/JudgeAssignment";
import Evaluation from "@/models/Evaluation";
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
    isApproved: Boolean(user.isApproved),
    role: user.role || "participant",
  };
}

function getCoverageStatus({
  assignedJudgesCount,
  completedReviewsCount,
  inProgressReviewsCount,
}: {
  assignedJudgesCount: number;
  completedReviewsCount: number;
  inProgressReviewsCount: number;
}) {
  if (assignedJudgesCount === 0) {
    return "Not Assigned";
  }

  if (completedReviewsCount === assignedJudgesCount) {
    return "Completed";
  }

  if (completedReviewsCount > 0 || inProgressReviewsCount > 0) {
    return "In Review";
  }

  return "Assigned";
}

function transformSubmission(
  submission: any,
  coverage: {
    assignedJudgesCount: number;
    completedReviewsCount: number;
    inProgressReviewsCount: number;
    pendingReviewsCount: number;
  }
) {
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
    reviewCoverage: {
      assignedJudgesCount: coverage.assignedJudgesCount,
      completedReviewsCount: coverage.completedReviewsCount,
      inProgressReviewsCount: coverage.inProgressReviewsCount,
      pendingReviewsCount: coverage.pendingReviewsCount,
      coverageStatus: getCoverageStatus(coverage),
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const submissions = await Submission.find({})
      .populate({
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
      })
      .sort({ updatedAt: -1 });

    const submissionIds = submissions.map((submission) =>
      submission._id?.toString?.()
    );

    const [assignments, evaluations] = await Promise.all([
      JudgeAssignment.find({
        submission: { $in: submissionIds },
      })
        .select("submission judge")
        .lean(),
      Evaluation.find({
        submission: { $in: submissionIds },
      })
        .select("submission judge status")
        .lean(),
    ]);

    const coverageMap = new Map<
      string,
      {
        assignedJudgeIds: Set<string>;
        completedJudgeIds: Set<string>;
        inProgressJudgeIds: Set<string>;
      }
    >();

    for (const assignment of assignments as any[]) {
      const submissionId = assignment?.submission?.toString?.();
      const judgeId = assignment?.judge?.toString?.();

      if (!submissionId || !judgeId) continue;

      if (!coverageMap.has(submissionId)) {
        coverageMap.set(submissionId, {
          assignedJudgeIds: new Set<string>(),
          completedJudgeIds: new Set<string>(),
          inProgressJudgeIds: new Set<string>(),
        });
      }

      coverageMap.get(submissionId)!.assignedJudgeIds.add(judgeId);
    }

    for (const evaluation of evaluations as any[]) {
      const submissionId = evaluation?.submission?.toString?.();
      const judgeId = evaluation?.judge?.toString?.();

      if (!submissionId || !judgeId) continue;

      if (!coverageMap.has(submissionId)) {
        coverageMap.set(submissionId, {
          assignedJudgeIds: new Set<string>(),
          completedJudgeIds: new Set<string>(),
          inProgressJudgeIds: new Set<string>(),
        });
      }

      if (evaluation.status === "submitted") {
        coverageMap.get(submissionId)!.completedJudgeIds.add(judgeId);
      } else {
        coverageMap.get(submissionId)!.inProgressJudgeIds.add(judgeId);
      }
    }

    const formattedSubmissions = submissions.map((submission: any) => {
      const submissionId = submission._id?.toString?.() || "";

      const coverageEntry = coverageMap.get(submissionId);

      const assignedJudgesCount = coverageEntry
        ? coverageEntry.assignedJudgeIds.size
        : 0;

      const completedReviewsCount = coverageEntry
        ? coverageEntry.completedJudgeIds.size
        : 0;

      const inProgressReviewsCount = coverageEntry
        ? coverageEntry.inProgressJudgeIds.size
        : 0;

      const pendingReviewsCount = Math.max(
        assignedJudgesCount - completedReviewsCount - inProgressReviewsCount,
        0
      );

      return transformSubmission(submission, {
        assignedJudgesCount,
        completedReviewsCount,
        inProgressReviewsCount,
        pendingReviewsCount,
      });
    });

    const meta = {
      total: formattedSubmissions.length,
      draft: formattedSubmissions.filter((item) => item.dbStatus === "draft")
        .length,
      submitted: formattedSubmissions.filter(
        (item) => item.dbStatus === "submitted"
      ).length,
      locked: formattedSubmissions.filter((item) => item.dbStatus === "locked")
        .length,
      readyForJudging: formattedSubmissions.filter(
        (item) => item.dbStatus === "submitted" || item.dbStatus === "locked"
      ).length,
      totalAssignedJudges: formattedSubmissions.reduce(
        (sum, item) => sum + item.reviewCoverage.assignedJudgesCount,
        0
      ),
      totalCompletedReviews: formattedSubmissions.reduce(
        (sum, item) => sum + item.reviewCoverage.completedReviewsCount,
        0
      ),
      totalInProgressReviews: formattedSubmissions.reduce(
        (sum, item) => sum + item.reviewCoverage.inProgressReviewsCount,
        0
      ),
      totalPendingReviews: formattedSubmissions.reduce(
        (sum, item) => sum + item.reviewCoverage.pendingReviewsCount,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
      meta,
    });
  } catch (error) {
    console.error("GET /api/admin/submissions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch submissions",
      },
      { status: 500 }
    );
  }
}
