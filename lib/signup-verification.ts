import crypto from "crypto";

export const PARTICIPANT_SIGNUP_VERIFICATION_PURPOSE = "participant_signup";
export const SIGNUP_VERIFICATION_EXPIRY_MINUTES = 10;
export const SIGNUP_VERIFICATION_RESEND_COOLDOWN_SECONDS = 45;
export const SIGNUP_VERIFICATION_MAX_ATTEMPTS = 5;

export function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashVerificationValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getVerificationExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + SIGNUP_VERIFICATION_EXPIRY_MINUTES
  );
  return expiresAt;
}

export function maskEmailAddress(email: string) {
  const [localPart, domainPart] = email.trim().toLowerCase().split("@");

  if (!localPart || !domainPart) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] || ""}*@${domainPart}`;
  }

  return `${localPart.slice(0, 2)}${"*".repeat(
    Math.max(localPart.length - 2, 2)
  )}@${domainPart}`;
}
