import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";
import { sendAppEmail } from "@/lib/mailer";
import {
  signupEmailRequestSchema,
} from "@/lib/validations/auth";
import {
  generateVerificationCode,
  getVerificationExpiryDate,
  hashVerificationValue,
  maskEmailAddress,
  PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
  SIGNUP_VERIFICATION_EXPIRY_MINUTES,
  SIGNUP_VERIFICATION_RESEND_COOLDOWN_SECONDS,
} from "@/lib/signup-verification";
import SignupVerification from "@/models/SignupVerification";
import User from "@/models/User";

function buildVerificationEmail({
  code,
  email,
}: {
  code: string;
  email: string;
}) {
  const expiryLabel = `${SIGNUP_VERIFICATION_EXPIRY_MINUTES} minutes`;

  return {
    subject: "HackSphere signup verification code",
    text: `Your HackSphere participant signup verification code is ${code}.

This code expires in ${expiryLabel}.

If you did not request this code for ${email}, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #2f2f2f; line-height: 1.6;">
        <h2 style="color: #A01C33;">Verify your HackSphere email</h2>
        <p>Use the verification code below to continue your participant registration.</p>
        <div style="display:inline-block;margin:20px 0;padding:14px 20px;border-radius:16px;border:1px solid #ead7de;background:#fff4f6;font-size:28px;font-weight:700;letter-spacing:8px;color:#A01C33;">
          ${code}
        </div>
        <p>This code expires in <strong>${expiryLabel}</strong>.</p>
        <p>If you did not request this code for <strong>${email}</strong>, you can safely ignore this email.</p>
      </div>
    `,
  };
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedFields = signupEmailRequestSchema.safeParse(body);

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

    const existingVerification = await SignupVerification.findOne({
      email,
      purpose: PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
    }).lean();

    if (existingVerification?.lastSentAt) {
      const secondsSinceLastSend = Math.floor(
        (Date.now() - new Date(existingVerification.lastSentAt).getTime()) / 1000
      );

      if (secondsSinceLastSend < SIGNUP_VERIFICATION_RESEND_COOLDOWN_SECONDS) {
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${
              SIGNUP_VERIFICATION_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend
            } seconds before requesting another code`,
          },
          { status: 429 }
        );
      }
    }

    const code = generateVerificationCode();
    const expiresAt = getVerificationExpiryDate();

    await SignupVerification.findOneAndUpdate(
      {
        email,
        purpose: PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
      },
      {
        email,
        purpose: PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE,
        codeHash: hashVerificationValue(code),
        verifiedTokenHash: "",
        verifiedAt: null,
        attemptCount: 0,
        lastSentAt: new Date(),
        expiresAt,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const emailPayload = buildVerificationEmail({ code, email });

    await sendAppEmail({
      to: email,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Verification code sent to ${maskEmailAddress(email)}`,
        maskedEmail: maskEmailAddress(email),
        expiresInMinutes: SIGNUP_VERIFICATION_EXPIRY_MINUTES,
        resendCooldownSeconds: SIGNUP_VERIFICATION_RESEND_COOLDOWN_SECONDS,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Participant signup send-code error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send verification code",
      },
      { status: 500 }
    );
  }
}
