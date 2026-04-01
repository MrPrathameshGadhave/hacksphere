import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    const name = normalizeText(body?.name);
    const email = normalizeText(body?.email).toLowerCase();
    const college = normalizeText(body?.college);
    const phone = normalizeText(body?.phone);
    const bio = normalizeText(body?.bio);

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        { status: 400 }
      );
    }

    const existingUserWithEmail = await User.findOne({
      email,
      _id: { $ne: decoded.userId },
    });

    if (existingUserWithEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "This email is already in use by another account",
        },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        name,
        email,
        college,
        phone,
        bio,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(
      "name email college phone bio avatar role isApproved judgeStatus createdAt updatedAt"
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
