import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validatedFields = forgotPasswordSchema.safeParse(body);

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

    const { email } = validatedFields.data;

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Forgot password request received. Reset password flow will be connected next.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}