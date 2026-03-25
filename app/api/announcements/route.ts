import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Announcement from "@/models/Announcement";

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

    const limitParam = Number(request.nextUrl.searchParams.get("limit") || "5");
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 20)
        : 5;

    const announcements = await Announcement.find({})
      .sort({ pinned: -1, createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "name role");

    return NextResponse.json(
      {
        success: true,
        announcements,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get announcements error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}