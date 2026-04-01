import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { signToken } from "@/lib/auth";

function isMongoConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    /Mongo/i.test(error.name) &&
    /(timeout|timed out|server selection|network|connect)/i.test(error.message)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedFields = loginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validatedFields.data;

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    if (user.role === "judge") {
      if (user.judgeStatus === "blocked") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your judge account has been blocked. Please contact the organizers.",
          },
          { status: 403 }
        );
      }

      if (user.judgeStatus !== "active") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your judge account is pending admin approval. Please wait for approval before signing in.",
          },
          { status: 403 }
        );
      }
    }

    if (!user.isApproved) {
      // Create a temporary token just for showing the pending page
      const tempToken = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const response = NextResponse.json(
        {
          success: false,
          message: "Your account is pending approval",
          isApprovalPending: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            isApproved: false,
          },
        },
        { status: 403 }
      );

      // Set temporary token for approval pending page access
      response.cookies.set("hacksphere_token", tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          avatar: user.avatar,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    response.cookies.set("hacksphere_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (isMongoConnectionError(error)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database connection is unavailable right now. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
