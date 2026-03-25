import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import "@/models/User";
import "@/models/ProblemStatement";

type DbTeamStatus = "active" | "pending" | "disqualified";
type UiTeamStatus = "Active" | "Incomplete" | "Blocked";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== "admin") {
    return null;
  }

  return decoded;
}

function mapDbStatusToUi(status: DbTeamStatus): UiTeamStatus {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "Incomplete";
    case "disqualified":
      return "Blocked";
    default:
      return "Incomplete";
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

function transformTeam(team: any) {
  const leader = normalizeUser(team.leader);

  const members = Array.isArray(team.members)
    ? team.members.map((member: any) => normalizeUser(member)).filter(Boolean)
    : [];

  const allMembersMap = new Map<string, any>();

  if (leader?.id) {
    allMembersMap.set(leader.id, leader);
  }

  for (const member of members) {
    if (member?.id) {
      allMembersMap.set(member.id, member);
    }
  }

  const allMembers = Array.from(allMembersMap.values());

  const approvedMembersCount = allMembers.filter(
    (member) => member.isApproved
  ).length;

  const pendingMembersCount = allMembers.length - approvedMembersCount;

  const problemStatement = team.problemStatement
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
    id: team._id?.toString?.() || "",
    teamName: team.teamName || "",
    teamDescription: team.teamDescription || "",
    leader,
    leaderName: leader?.name || "Unknown",
    leaderEmail: leader?.email || "",
    members, // non-leader members
    allMembers, // leader + members
    membersCount: allMembers.length,
    memberCount: allMembers.length,
    nonLeaderMembersCount: members.length,
    maxSize: team.maxSize || 4,
    availableSlots: Math.max((team.maxSize || 4) - allMembers.length, 0),
    isFull: allMembers.length >= (team.maxSize || 4),
    approvedMembersCount,
    pendingMembersCount,
    problemStatement,
    problemTitle: problemStatement?.title || "Not selected",
    status: mapDbStatusToUi(team.status),
    dbStatus: team.status,
    inviteCode: team.inviteCode || null,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
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

    const teams = await Team.find({})
      .populate("leader", "name email college avatar isApproved role")
      .populate("members", "name email college avatar isApproved role")
      .populate(
        "problemStatement",
        "title slug category difficulty status isActive"
      )
      .sort({ createdAt: -1 });

    const formattedTeams = teams.map(transformTeam);

    const meta = {
      totalTeams: formattedTeams.length,
      activeTeams: formattedTeams.filter((team) => team.dbStatus === "active")
        .length,
      pendingTeams: formattedTeams.filter((team) => team.dbStatus === "pending")
        .length,
      disqualifiedTeams: formattedTeams.filter(
        (team) => team.dbStatus === "disqualified"
      ).length,
      fullTeams: formattedTeams.filter((team) => team.isFull).length,
      teamsWithProblemSelected: formattedTeams.filter(
        (team) => team.problemStatement
      ).length,
    };

    return NextResponse.json({
      success: true,
      teams: formattedTeams,
      meta,
    });
  } catch (error) {
    console.error("GET /api/admin/teams error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch teams",
      },
      { status: 500 }
    );
  }
}