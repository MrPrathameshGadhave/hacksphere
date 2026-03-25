import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Team from "@/models/Team";

type TeamStatus = "active" | "pending" | "disqualified";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("hacksphere_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can access participant records",
        },
        { status: 403 }
      );
    }

    const users = await User.find({ role: "participant" })
      .select("name email college isApproved createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((user) => String(user._id));

    const teams =
      userIds.length > 0
        ? await Team.find({
            $or: [{ leader: { $in: userIds } }, { members: { $in: userIds } }],
          })
            .select("teamName status leader members")
            .lean()
        : [];

    const teamMap = new Map<
      string,
      {
        teamId: string;
        teamName: string;
        teamStatus: TeamStatus;
        isLeader: boolean;
      }
    >();

    teams.forEach((team) => {
      const teamId = String(team._id);
      const teamName = team.teamName || "Unnamed Team";
      const teamStatus = (team.status || "pending") as TeamStatus;

      if (team.leader) {
        teamMap.set(String(team.leader), {
          teamId,
          teamName,
          teamStatus,
          isLeader: true,
        });
      }

      (team.members || []).forEach((memberId) => {
        teamMap.set(String(memberId), {
          teamId,
          teamName,
          teamStatus,
          isLeader: false,
        });
      });
    });

    const participants = users.map((user) => {
      const teamInfo = teamMap.get(String(user._id));

      return {
        id: String(user._id),
        name: user.name || "",
        email: user.email || "",
        college: user.college || "",
        team: teamInfo?.teamName || "Not Assigned",
        teamId: teamInfo?.teamId || null,
        teamStatus: teamInfo?.teamStatus || null,
        isLeader: teamInfo?.isLeader || false,
        status: user.isApproved ? "Approved" : "Pending",
        joinedAt: user.createdAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        participants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admin participants error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}