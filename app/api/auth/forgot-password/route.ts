import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendAppEmail } from "@/lib/mailer";

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

    const user = await User.findOne({ email });

    // For security, always return success even if email doesn't exist
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, you will receive password reset instructions",
        },
        { status: 200 }
      );
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token before storing in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save the hashed token and expiry to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    // Create reset URL
    const resetURL = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #A01C33; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #A01C33; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetURL}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    const emailText = `
Password Reset Request

Hi ${user.name},

We received a request to reset your password. Visit the link below to create a new password:

${resetURL}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.
    `;

    await sendAppEmail({
      to: user.email,
      subject: "Reset Your HackSphere Password",
      html: emailHTML,
      text: emailText,
    });

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions",
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