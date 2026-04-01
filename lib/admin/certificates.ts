import { buildAdminLeaderboardData, type AdminLeaderboardRow } from "@/lib/leaderboard";
import type {
  AdminCertificateItem,
  AdminCertificateMeta,
  CertificateAwardCategory,
  CertificatePublishState,
} from "@/lib/certificate-types";
import LeaderboardSettings from "@/models/LeaderboardSettings";
import Team from "@/models/Team";
import "@/models/User";

type TeamParticipant = {
  userId: string;
  participantName: string;
  participantEmail: string;
  college: string;
  roleLabel: string;
};

function getAwardDetails(
  row: AdminLeaderboardRow
): Pick<
  AdminCertificateItem,
  "awardCategory" | "awardTitle" | "awardLabel" | "awardCitation"
> {
  if (row.reviewsCount > 0 && row.rank === 1) {
    return {
      awardCategory: "champion",
      awardTitle: "Champion Laureate",
      awardLabel: "1st Place",
      awardCitation:
        "for achieving the highest overall standing in HackSphere through exceptional innovation, execution, and impact.",
    };
  }

  if (row.reviewsCount > 0 && row.rank === 2) {
    return {
      awardCategory: "first_runner_up",
      awardTitle: "First Runner-Up",
      awardLabel: "2nd Place",
      awardCitation:
        "for earning second place with an outstanding project presentation and a strong judging performance.",
    };
  }

  if (row.reviewsCount > 0 && row.rank === 3) {
    return {
      awardCategory: "second_runner_up",
      awardTitle: "Second Runner-Up",
      awardLabel: "3rd Place",
      awardCitation:
        "for securing a podium finish and demonstrating remarkable technical quality during final evaluations.",
    };
  }

  if (row.reviewsCount > 0) {
    return {
      awardCategory: "finalist",
      awardTitle: "Finalist Recognition",
      awardLabel: "Finalist",
      awardCitation:
        "for reaching the ranked finalist pool and representing the team with a judged project submission in HackSphere.",
    };
  }

  return {
    awardCategory: "participation",
    awardTitle: "Participation Distinction",
    awardLabel: "Participant",
    awardCitation:
      "for representing the team with an official project submission and contributing to the HackSphere innovation journey.",
  };
}

function createCertificateNumber(
  row: AdminLeaderboardRow,
  userId: string,
  awardCategory: CertificateAwardCategory,
  issuedAt: string
) {
  const year = new Date(issuedAt).getFullYear();
  const teamFragment = row.teamId.slice(-4).toUpperCase();
  const userFragment = userId.slice(-4).toUpperCase();
  const awardFragment = awardCategory.replace(/_/g, "").slice(0, 4).toUpperCase();

  return `HS-${year}-${String(row.rank).padStart(2, "0")}-${awardFragment}-${teamFragment}${userFragment}`;
}

function getTeamParticipants(team: any): TeamParticipant[] {
  const participants: TeamParticipant[] = [];
  const seen = new Set<string>();

  const pushParticipant = (user: any, roleLabel: string) => {
    const userId = user?._id ? String(user._id) : "";

    if (!userId || seen.has(userId)) {
      return;
    }

    seen.add(userId);
    participants.push({
      userId,
      participantName: user?.name || "Participant",
      participantEmail: user?.email || "",
      college: user?.college || "",
      roleLabel,
    });
  };

  pushParticipant(team?.leader, "Team Leader");

  if (Array.isArray(team?.members)) {
    team.members.forEach((member: any) => {
      pushParticipant(member, "Team Member");
    });
  }

  return participants;
}

export async function buildAdminCertificateCatalog(): Promise<{
  items: AdminCertificateItem[];
  meta: AdminCertificateMeta;
}> {
  const [leaderboard, settings] = await Promise.all([
    buildAdminLeaderboardData(),
    LeaderboardSettings.findOne({ key: "global" }).lean(),
  ]);

  const publishState: CertificatePublishState = settings?.isPublished
    ? "Published"
    : "Draft";
  const publishedAt =
    settings?.publishedAt instanceof Date
      ? settings.publishedAt.toISOString()
      : settings?.publishedAt
      ? new Date(settings.publishedAt).toISOString()
      : null;
  const issuedAt = publishedAt || new Date().toISOString();

  const teamIds = leaderboard.rows.map((row) => row.teamId).filter(Boolean);

  const teams = teamIds.length
    ? ((await Team.find({
        _id: { $in: teamIds },
      })
        .populate("leader", "name email college")
        .populate("members", "name email college")
        .lean()) as any[])
    : [];

  const teamById = new Map<string, any>(
    teams.map((team) => [String(team._id), team])
  );

  const countsByAward: Record<CertificateAwardCategory, number> = {
    champion: 0,
    first_runner_up: 0,
    second_runner_up: 0,
    finalist: 0,
    participation: 0,
  };

  const items = leaderboard.rows.flatMap((row) => {
    const team = teamById.get(row.teamId);

    if (!team) {
      return [];
    }

    const awardDetails = getAwardDetails(row);
    const participants = getTeamParticipants(team);

    return participants.map((participant) => {
      countsByAward[awardDetails.awardCategory] += 1;

      return {
        id: `${row.teamId}:${participant.userId}`,
        teamId: row.teamId,
        userId: participant.userId,
        participantName: participant.participantName,
        participantEmail: participant.participantEmail,
        college: participant.college,
        roleLabel: participant.roleLabel,
        teamName: row.teamName,
        projectTitle: row.projectTitle,
        problemTitle: row.problemTitle,
        rank: row.rank,
        finalScore: row.finalScore,
        reviewsCount: row.reviewsCount,
        assignedJudges: row.assignedJudges,
        pendingJudges: row.pendingJudges,
        awardCategory: awardDetails.awardCategory,
        awardTitle: awardDetails.awardTitle,
        awardLabel: awardDetails.awardLabel,
        awardCitation: awardDetails.awardCitation,
        certificateNumber: createCertificateNumber(
          row,
          participant.userId,
          awardDetails.awardCategory,
          issuedAt
        ),
        issuedAt,
        publishState,
      };
    });
  });

  items.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.teamName !== b.teamName) return a.teamName.localeCompare(b.teamName);
    return a.participantName.localeCompare(b.participantName);
  });

  return {
    items,
    meta: {
      publishState,
      publishedAt,
      issuedAt,
      totalCertificates: items.length,
      totalTeams: leaderboard.rows.length,
      countsByAward,
    },
  };
}
