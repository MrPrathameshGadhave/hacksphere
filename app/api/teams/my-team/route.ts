import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Team from "@/models/Team";
import "@/models/ProblemStatement";
export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const token = _request.cookies.get("hacksphere_token")?.value;

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

    const team = await Team.findOne({
      $or: [{ leader: decoded.userId }, { members: decoded.userId }],
    })
      .populate("leader", "name email college avatar role isApproved")
      .populate("members", "name email college avatar role isApproved")
      .populate(
        "problemStatement",
        "title shortDescription category difficulty"
      );

    return NextResponse.json(
      {
        success: true,
        team,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get my team error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}