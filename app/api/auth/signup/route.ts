import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";
import SignupVerification from "@/models/SignupVerification";
import { participantSignupSchema } from "@/lib/validations/auth";
import {
  hashVerificationValue,
  PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
} from "@/lib/signup-verification";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedFields = participantSignupSchema.safeParse(body);

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

    const { name, email, password, college, verificationToken } =
      validatedFields.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists with this email",
        },
        { status: 409 }
      );
    }

    const signupVerification = await SignupVerification.findOne({
      email,
      purpose: PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
    });

    if (
      !signupVerification ||
      !signupVerification.verifiedAt ||
      !signupVerification.verifiedTokenHash ||
      signupVerification.verifiedTokenHash !==
        hashVerificationValue(verificationToken) ||
      new Date(signupVerification.expiresAt).getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify your email address with the code before creating your account",
        },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      college: college || "",
      role: "participant",
      isApproved: false,
    });

    await SignupVerification.deleteMany({
      email,
      purpose: PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Participant account created successfully! Your account is pending admin approval. You'll receive a notification once approved.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          college: newUser.college,
          avatar: newUser.avatar,
          isApproved: newUser.isApproved,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
