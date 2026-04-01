import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { recordAdminAuditLog } from "@/lib/admin/audit";
import { buildParticipantResponse } from "@/lib/admin/participants";
import User from "@/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          message: "Only admins can update participant records",
        },
        { status: 403 }
      );
    }

    const id = (await params).id;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid participant ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body?.isApproved !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isApproved must be a boolean value",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user || user.role !== "participant") {
      return NextResponse.json(
        {
          success: false,
          message: "Participant not found",
        },
        { status: 404 }
      );
    }

    const previousStatus = user.isApproved ? "Approved" : "Pending";
    user.isApproved = body.isApproved;
    await user.save();

    const participant = await buildParticipantResponse(id);

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "Participant not found after update",
        },
        { status: 404 }
      );
    }

    await recordAdminAuditLog({
      action: body.isApproved ? "approve_participant" : "mark_participant_pending",
      adminId: decoded.userId,
      targetType: "participant",
      targetId: id,
      targetLabel: participant.name || user.email || "Participant",
      details: {
        previousStatus,
        nextStatus: participant.status,
        participantEmail: participant.email,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: body.isApproved
          ? "Participant approved successfully"
          : "Participant moved to pending successfully",
        participant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update participant status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
