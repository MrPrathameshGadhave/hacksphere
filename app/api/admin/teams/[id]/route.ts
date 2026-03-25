import mongoose from "mongoose";
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

function mapUiStatusToDb(status: string): DbTeamStatus | null {
  const normalized = status.trim().toLowerCase();

  if (normalized === "active") return "active";
  if (normalized === "incomplete") return "pending";
  if (normalized === "blocked") return "disqualified";

  if (normalized === "pending") return "pending";
  if (normalized === "disqualified") return "disqualified";

  return null;
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
    members,
    allMembers,
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

async function getPopulatedTeamById(id: string) {
  return Team.findById(id)
    .populate("leader", "name email college avatar isApproved role")
    .populate("members", "name email college avatar isApproved role")
    .populate("problemStatement", "title slug category difficulty status isActive");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid team id" },
        { status: 400 }
      );
    }

    await connectDB();

    const team = await getPopulatedTeamById(id);

    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: transformTeam(team),
    });
  } catch (error) {
    console.error("GET /api/admin/teams/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid team id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const nextStatus = mapUiStatusToDb(body?.status || "");

    if (!nextStatus) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Use Active, Incomplete, Blocked, active, pending, or disqualified.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingTeam = await Team.findById(id);

    if (!existingTeam) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    existingTeam.status = nextStatus;
    await existingTeam.save();

    const updatedTeam = await getPopulatedTeamById(id);

    return NextResponse.json({
      success: true,
      message: "Team status updated successfully",
      team: transformTeam(updatedTeam),
    });
  } catch (error) {
    console.error("PATCH /api/admin/teams/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update team status",
      },
      { status: 500 }
    );
  }
}