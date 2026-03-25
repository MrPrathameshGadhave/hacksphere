import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import TeamInvite from "@/models/TeamInvite";
import User from "@/models/User";
import "@/models/Team";
import "@/models/User";
import { hashInviteToken } from "@/lib/team-invite";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = String(
      request.nextUrl.searchParams.get("token") || ""
    ).trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invite token is required",
        },
        { status: 400 }
      );
    }

    const tokenHash = hashInviteToken(token);

    const invite = await TeamInvite.findOne({ tokenHash })
      .populate("team", "teamName status maxSize")
      .populate("invitedBy", "name email")
      .lean();

    if (!invite) {
      return NextResponse.json(
        {
          success: false,
          message: "Invitation not found or invalid",
        },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "This invitation is no longer active",
        },
        { status: 400 }
      );
    }

    const expired = new Date(invite.expiresAt).getTime() < Date.now();

    if (expired) {
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

    const registeredUser = await User.findOne({
      email: invite.invitedEmail,
      role: "participant",
    })
      .select("_id")
      .lean();

    return NextResponse.json(
      {
        success: true,
        invite: {
          teamName:
            invite.team &&
            typeof invite.team === "object" &&
            "teamName" in invite.team
              ? String(invite.team.teamName)
              : "Unknown Team",
          invitedEmail: invite.invitedEmail,
          expiresAt: invite.expiresAt,
          status: invite.status,
          isRegistered: !!registeredUser,
          inviterName:
            invite.invitedBy &&
            typeof invite.invitedBy === "object" &&
            "name" in invite.invitedBy
              ? String(invite.invitedBy.name)
              : "Team Leader",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Invite preview error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}