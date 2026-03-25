import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import TeamInvite from "@/models/TeamInvite";
import User from "@/models/User";
import "@/models/ProblemStatement";
import { hashInviteToken } from "@/lib/team-invite";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authToken = request.cookies.get("hacksphere_token")?.value;

    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(authToken);

    if (!decoded?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    if (decoded.role !== "participant") {
      return NextResponse.json(
        {
          success: false,
          message: "Only participants can accept team invites",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawToken = String(body?.token || "").trim();

    if (!rawToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invite token is required",
        },
        { status: 400 }
      );
    }

    const currentUser = await User.findById(decoded.userId)
      .select("name email role")
      .lean();

    if (!currentUser || currentUser.role !== "participant") {
      return NextResponse.json(
        {
          success: false,
          message: "Participant account not found",
        },
        { status: 404 }
      );
    }

    const tokenHash = hashInviteToken(rawToken);

    const invite = await TeamInvite.findOne({
      tokenHash,
      status: "pending",
    }).lean();

    if (!invite) {
      return NextResponse.json(
        {
          success: false,
          message: "Invitation not found or already used",
        },
        { status: 404 }
      );
    }

    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      await TeamInvite.updateOne(
        { _id: invite._id },
        { $set: { status: "expired" } }
      );

      return NextResponse.json(
        {
          success: false,
          message: "This invitation has expired",
        },
        { status: 400 }
      );
    }

    if (
      String(currentUser.email || "").trim().toLowerCase() !==
      String(invite.invitedEmail || "").trim().toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This invitation was sent to a different email address. Please login with the invited account.",
        },
        { status: 403 }
      );
    }

    const existingTeam = await Team.findOne({
      $or: [{ leader: currentUser._id }, { members: currentUser._id }],
    }).lean();

    if (existingTeam) {
      return NextResponse.json(
        {
          success: false,
          message: "You already belong to a team",
        },
        { status: 400 }
      );
    }

    const team = await Team.findById(invite.team);

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Target team not found",
        },
        { status: 404 }
      );
    }

    if (team.status === "disqualified") {
      return NextResponse.json(
        {
          success: false,
          message: "This team is blocked from accepting new members",
        },
        { status: 400 }
      );
    }

    const currentMemberCount = 1 + team.members.length;

    if (currentMemberCount >= team.maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "This team is already full",
        },
        { status: 400 }
      );
    }

    const alreadyMember = team.members.some(
      (memberId) => String(memberId) === String(currentUser._id)
    );

    if (String(team.leader) === String(currentUser._id) || alreadyMember) {
      return NextResponse.json(
        {
          success: false,
          message: "You already belong to this team",
        },
        { status: 400 }
      );
    }

    team.members.push(currentUser._id);
    await team.save();

    await TeamInvite.updateOne(
      { _id: invite._id },
      {
        $set: {
          status: "accepted",
          acceptedBy: currentUser._id,
          acceptedAt: new Date(),
        },
      }
    );

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "name email college avatar role isApproved")
      .populate("members", "name email college avatar role isApproved")
      .populate(
        "problemStatement",
        "title shortDescription category difficulty slug"
      );

    return NextResponse.json(
      {
        success: true,
        message: "You joined the team successfully",
        team: populatedTeam,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Accept invite error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}