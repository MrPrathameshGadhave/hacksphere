import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import User from "@/models/User";
import TeamInvite from "@/models/TeamInvite";
import { sendAppEmail } from "@/lib/mailer";
import {
  generateInviteToken,
  getInviteExpiryDate,
  hashInviteToken,
} from "@/lib/team-invite";
import "@/models/ProblemStatement";

function generateInviteCode() {
  return `HS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function generateUniqueInviteCode() {
  let code = generateInviteCode();

  while (await Team.findOne({ inviteCode: code })) {
    code = generateInviteCode();
  }

  return code;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("hacksphere_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "participant") {
      return NextResponse.json(
        { success: false, message: "Only participants can send invites" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const recipientEmail = String(body?.email || "").trim().toLowerCase();

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, message: "Recipient email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address" },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ leader: decoded.userId }).populate(
      "leader",
      "name email"
    );

    if (!team) {
      return NextResponse.json(
        { success: false, message: "Only the team leader can send invites" },
        { status: 403 }
      );
    }

    if (team.status === "disqualified") {
      return NextResponse.json(
        {
          success: false,
          message: "This team is not allowed to invite new members",
        },
        { status: 403 }
      );
    }

    const currentMemberCount = 1 + team.members.length;

    if (currentMemberCount >= team.maxSize) {
      return NextResponse.json(
        { success: false, message: "Your team is already full" },
        { status: 400 }
      );
    }

    const leaderName =
      typeof team.leader === "object" && team.leader && "name" in team.leader
        ? String(team.leader.name)
        : "Team Leader";

    const leaderEmail =
      typeof team.leader === "object" && team.leader && "email" in team.leader
        ? String(team.leader.email).toLowerCase()
        : "";

    if (recipientEmail === leaderEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot invite your own email address",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: recipientEmail })
      .select("_id role email")
      .lean();

    if (existingUser) {
      if (existingUser.role !== "participant") {
        return NextResponse.json(
          {
            success: false,
            message: "Only participant accounts can join a participant team",
          },
          { status: 400 }
        );
      }

      const existingUserTeam = await Team.findOne({
        $or: [{ leader: existingUser._id }, { members: existingUser._id }],
      })
        .select("_id teamName")
        .lean();

      if (existingUserTeam) {
        if (String(existingUserTeam._id) === String(team._id)) {
          return NextResponse.json(
            {
              success: false,
              message: "This participant already belongs to your team",
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            message: "This participant already belongs to another team",
          },
          { status: 400 }
        );
      }
    }

    if (!team.inviteCode) {
      team.inviteCode = await generateUniqueInviteCode();
      await team.save();
    }

    await TeamInvite.updateMany(
      {
        team: team._id,
        invitedEmail: recipientEmail,
        status: "pending",
      },
      {
        $set: { status: "revoked" },
      }
    );

    const rawInviteToken = generateInviteToken();
    const tokenHash = hashInviteToken(rawInviteToken);
    const expiresAt = getInviteExpiryDate();

    await TeamInvite.create({
      team: team._id,
      invitedBy: decoded.userId,
      invitedEmail: recipientEmail,
      tokenHash,
      status: "pending",
      expiresAt,
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const acceptLink = `${appUrl}/invite/accept?token=${encodeURIComponent(
      rawInviteToken
    )}`;

    const fallbackCode = team.inviteCode || "";
    const fallbackCodeLink = `${appUrl}/participant/my-team?inviteCode=${encodeURIComponent(
      fallbackCode
    )}&autoJoin=true`;

    await sendAppEmail({
      to: recipientEmail,
      subject: `HackSphere Team Invite - ${team.teamName}`,
      text: `${leaderName} invited you to join the team "${team.teamName}" on HackSphere.

Accept invite:
${acceptLink}

Fallback invite code:
${fallbackCode}

If you do not have an account yet, register first using this same email address: ${recipientEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2f2f2f;">
          <h2 style="color: #A01C33;">HackSphere Team Invitation</h2>

          <p><strong>${leaderName}</strong> invited you to join the team <strong>${team.teamName}</strong>.</p>

          <p>
            Use the secure button below to accept the invite. If you are not registered yet,
            create your HackSphere participant account first using
            <strong>${recipientEmail}</strong>.
          </p>

          <p style="margin: 20px 0;">
            <a
              href="${acceptLink}"
              style="display:inline-block;background:#A01C33;color:white;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600;"
            >
              Accept Invitation
            </a>
          </p>

          <p style="margin-top: 18px;">Fallback invite code:</p>
          <div style="display:inline-block;background:#f8f8f9;border:1px solid #e5e7eb;padding:12px 16px;border-radius:12px;font-size:18px;font-weight:700;letter-spacing:3px;color:#A01C33;">
            ${fallbackCode}
          </div>

          <p style="margin-top: 18px;">
            Fallback link:
            <a href="${fallbackCodeLink}" style="color:#A01C33;">Join with invite code</a>
          </p>

          <p style="margin-top:20px;color:#6b7280;">
            This invitation expires on ${expiresAt.toLocaleString("en-IN")}.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invite email sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send invite email error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}