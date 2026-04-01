import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { recordAdminAuditLog } from "@/lib/admin/audit";
import { buildParticipantResponse } from "@/lib/admin/participants";
import User from "@/models/User";

export async function POST(request: NextRequest) {
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
          message: "Only admins can approve participants in bulk",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { participantIds } = body;

    // Validate input
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "participantIds must be a non-empty array",
        },
        { status: 400 }
      );
    }

    // Validate all IDs
    const validIds = participantIds.filter((id) =>
      Types.ObjectId.isValid(String(id))
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid participant IDs provided",
        },
        { status: 400 }
      );
    }

    if (validIds.length !== participantIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: `${participantIds.length - validIds.length} invalid ID(s) in request`,
        },
        { status: 400 }
      );
    }

    const existingParticipants = await User.find({
      _id: { $in: validIds },
      role: "participant",
    })
      .select("_id name email isApproved")
      .lean();

    const pendingParticipantIds = existingParticipants
      .filter((participant) => !participant.isApproved)
      .map((participant) => String(participant._id));

    if (pendingParticipantIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected participants are already approved",
        },
        { status: 400 }
      );
    }

    // Update all pending participants to approved
    const result = await User.updateMany(
      {
        _id: { $in: pendingParticipantIds },
        role: "participant",
      },
      {
        $set: { isApproved: true },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No participants found with the provided IDs",
        },
        { status: 404 }
      );
    }

    const approvedParticipants = (
      await Promise.all(
        pendingParticipantIds.map((participantId) =>
          buildParticipantResponse(participantId)
        )
      )
    ).filter(Boolean);

    await recordAdminAuditLog({
      action: "bulk_approve_participants",
      adminId: decoded.userId,
      targetType: "participant",
      targetLabel: `${result.modifiedCount} participants approved`,
      details: {
        requested: participantIds.length,
        valid: validIds.length,
        matched: result.matchedCount,
        modified: result.modifiedCount,
        participantIds: pendingParticipantIds,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully approved ${result.modifiedCount} participant(s)`,
        metadata: {
          requested: participantIds.length,
          valid: pendingParticipantIds.length,
          matched: result.matchedCount,
          modified: result.modifiedCount,
          acknowledgedAt: new Date().toISOString(),
          approvedBy: decoded.userId,
        },
        participants: approvedParticipants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/participants/bulk-approve error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
