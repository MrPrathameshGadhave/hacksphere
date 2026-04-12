import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import {
  signupEmailCodeVerifySchema,
} from "@/lib/validations/auth";
import {
  generateVerificationToken,
  hashVerificationValue,
  PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
  SIGNUP_VERIFICATION_MAX_ATTEMPTS,
} from "@/lib/signup-verification";
import SignupVerification from "@/models/SignupVerification";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedFields = signupEmailCodeVerifySchema.safeParse(body);

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

    const { email, code } = validatedFields.data;

    const existingUser = await User.findOne({ email }).select("_id").lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account already exists with this email address",
        },
        { status: 409 }
      );
    }

    const verification = await SignupVerification.findOne({
      email,
      purpose: PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
    });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message: "No active verification request was found for this email",
        },
        { status: 404 }
      );
    }

    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      await SignupVerification.deleteOne({ _id: verification._id });

      return NextResponse.json(
        {
          success: false,
          message: "This verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    if (verification.attemptCount >= SIGNUP_VERIFICATION_MAX_ATTEMPTS) {
      await SignupVerification.deleteOne({ _id: verification._id });

      return NextResponse.json(
        {
          success: false,
          message: "Too many invalid attempts. Please request a new verification code.",
        },
        { status: 429 }
      );
    }

    const providedCodeHash = hashVerificationValue(code);

    if (verification.codeHash !== providedCodeHash) {
      verification.attemptCount += 1;
      await verification.save();

      const attemptsRemaining = Math.max(
        SIGNUP_VERIFICATION_MAX_ATTEMPTS - verification.attemptCount,
        0
      );

      if (attemptsRemaining === 0) {
        await SignupVerification.deleteOne({ _id: verification._id });

        return NextResponse.json(
          {
            success: false,
            message:
              "Too many invalid attempts. Please request a new verification code.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Incorrect verification code. ${attemptsRemaining} attempt(s) remaining.`,
        },
        { status: 400 }
      );
    }

    const verificationToken = generateVerificationToken();

    verification.verifiedAt = new Date();
    verification.verifiedTokenHash = hashVerificationValue(verificationToken);
    verification.attemptCount = 0;
    await verification.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
        verificationToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Participant signup verify-code error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to verify the email code",
      },
      { status: 500 }
    );
  }
}
