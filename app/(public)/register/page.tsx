"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

type RegisterFormData = {
  name: string;
  email: string;
  college: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

type VerificationStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "verified";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = String(searchParams.get("redirect") || "").trim();
  const invitedEmail = String(searchParams.get("email") || "")
    .trim()
    .toLowerCase();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [verificationToken, setVerificationToken] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    college: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    if (!invitedEmail) return;

    setFormData((prev) => ({
      ...prev,
      email: invitedEmail,
    }));
  }, [invitedEmail]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const passwordChecks = useMemo(
    () => ({
      minLength: formData.password.length >= 6,
      hasLetter: /[A-Za-z]/.test(formData.password),
      hasNumber: /[0-9]/.test(formData.password),
    }),
    [formData.password]
  );

  const isPasswordStrong =
    passwordChecks.minLength &&
    passwordChecks.hasLetter &&
    passwordChecks.hasNumber;
  const normalizedEmail = formData.email.trim().toLowerCase();
  const isInvitedEmail = Boolean(invitedEmail);
  const isEmailVerified =
    verificationStatus === "verified" &&
    verifiedEmail.length > 0 &&
    verifiedEmail === normalizedEmail &&
    verificationToken.length > 0;
  const showVerificationCodeInput =
    verificationStatus === "sent" || verificationStatus === "verifying";
  const createAccountDisabled = loading || !isEmailVerified;

  const getApprovalPendingPath = () => {
    const params = new URLSearchParams();

    if (redirectTarget) {
      params.set("redirect", redirectTarget);
    }

    params.set("fromSignup", "1");

    return `/participant/approval-pending?${params.toString()}`;
  };

  const resetVerificationState = () => {
    setEmailVerificationCode("");
    setVerificationStatus("idle");
    setVerificationToken("");
    setVerifiedEmail("");
    setResendCooldown(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
      return;
    }

    if (name === "email") {
      const nextEmail = value.trim().toLowerCase();

      setFormData((prev) => ({
        ...prev,
        email: value,
      }));

      if (nextEmail !== normalizedEmail) {
        resetVerificationState();
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!isEmailVerified) {
      toast.error("Verify your email before creating the account");
      return false;
    }

    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }

    if (!formData.college.trim()) {
      toast.error("College name is required");
      return false;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }

    if (!isPasswordStrong) {
      toast.error(
        "Password must be at least 6 characters and include letters and numbers"
      );
      return false;
    }

    if (!formData.confirmPassword) {
      toast.error("Please confirm your password");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSendVerificationCode = async () => {
    if (!normalizedEmail) {
      toast.error("Email is required");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setVerificationStatus("sending");

      const response = await axios.post("/api/auth/signup/send-code", {
        email: normalizedEmail,
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to send verification code");
        setVerificationStatus("idle");
        return;
      }

      setVerificationStatus("sent");
      setEmailVerificationCode("");
      setVerificationToken("");
      setVerifiedEmail("");
      setResendCooldown(response.data?.resendCooldownSeconds || 45);
      toast.success(response.data?.message || "Verification code sent");
    } catch (error: any) {
      setVerificationStatus("idle");
      toast.error(
        error?.response?.data?.message ||
          "Failed to send verification code. Please try again."
      );
    }
  };

  const handleVerifyCode = async () => {
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      toast.error("Enter a valid email address first");
      return;
    }

    if (!/^\d{6}$/.test(emailVerificationCode.trim())) {
      toast.error("Enter the 6-digit code sent to your email");
      return;
    }

    try {
      setVerificationStatus("verifying");

      const response = await axios.post("/api/auth/signup/verify-code", {
        email: normalizedEmail,
        code: emailVerificationCode.trim(),
      });

      if (!response.data?.success || !response.data?.verificationToken) {
        setVerificationStatus("sent");
        toast.error(response.data?.message || "Failed to verify email");
        return;
      }

      setVerificationStatus("verified");
      setVerificationToken(response.data.verificationToken);
      setVerifiedEmail(normalizedEmail);
      setEmailVerificationCode("");
      toast.success("Email verified. You can now complete your account.");
    } catch (error: any) {
      setVerificationStatus("sent");
      toast.error(
        error?.response?.data?.message ||
          "Failed to verify the code. Please try again."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const signupResponse = await axios.post("/api/auth/signup", {
        name: formData.name.trim(),
        email: normalizedEmail,
        college: formData.college.trim(),
        password: formData.password,
        verificationToken,
      });

      if (!signupResponse.data?.success) {
        toast.error(signupResponse.data?.message || "Registration failed");
        return;
      }

      try {
        const loginResponse = await axios.post("/api/auth/login", {
          email: normalizedEmail,
          password: formData.password,
        });

        if (loginResponse.data?.success) {
          toast.success("Account created successfully");
          router.replace(redirectTarget || "/participant/dashboard");
          router.refresh();
          return;
        }
      } catch (loginError: any) {
        if (loginError?.response?.data?.isApprovalPending) {
          toast.success(
            "Account created successfully. Join the WhatsApp group while approval is pending."
          );
          router.replace(getApprovalPendingPath());
          router.refresh();
          return;
        }

        toast.success("Account created successfully. Please login.");
        router.replace(
          `/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`
        );
        return;
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
        <section className="relative hidden w-[47%] overflow-hidden lg:flex">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-[#A01C33]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_22%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-12 xl:px-14">
            <div>
              <Link href="/" className="inline-flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#A01C33] shadow-lg">
                  <Code2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight text-white">
                    HackSphere
                  </h1>
                  <p className="mt-1 text-sm text-white/80">
                    Organized by TechTitans Club
                  </p>
                </div>
              </Link>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                Participant Registration
              </div>

              <h2 className="mt-6 text-4xl font-bold leading-tight text-white xl:text-5xl">
                Start your hackathon journey with HackSphere.
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/85">
                Create your participant account to explore challenges, form a
                team, submit innovative projects, and compete in a platform
                powered by TechTitans.
              </p>

              <div className="mt-8 h-px w-full bg-white/20" />

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Join teams and collaborate with innovators
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Build impactful solutions for real problem statements
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Track submissions, announcements, and leaderboard progress
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs tracking-wide text-white/65">
              HACKSPHERE • TECHTITANS • STUDENT INNOVATION PLATFORM
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-[#fbfbfb] px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-lg rounded-[28px] border border-[#ececec] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-10">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center lg:hidden">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 text-[#A01C33]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33] text-white">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold">HackSphere</p>
                    <p className="text-xs text-[#3B3C3E]/70">
                      by TechTitans Club
                    </p>
                  </div>
                </Link>
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-[#1f2937]">
                Create Account
              </h2>
              <p className="mt-3 text-base text-gray-500">
                Complete everything here on one form. Verify your email first, then create the account.
              </p>
            </div>

            {invitedEmail ? (
              <div className="mb-5 rounded-2xl border border-[#A01C33]/15 bg-[#A01C33]/[0.03] px-4 py-3 text-sm text-[#3B3C3E]">
                You were invited using <strong>{invitedEmail}</strong>. This email
                must be verified before you continue the team invite flow.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-[52px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="mt-2 text-lg font-bold text-[#1f2937]">
                      Verify your email address
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isEmailVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isEmailVerified ? "Email Verified" : "Verification Required"}
                  </span>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#374151]"
                  >
                    Email Address
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="student@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={isEmailVerified || isInvitedEmail}
                        className="h-[52px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 read-only:bg-[#f8fafc]"
                      />
                    </div>

                    {isEmailVerified ? (
                      <button
                        type="button"
                        onClick={resetVerificationState}
                        disabled={isInvitedEmail}
                        className="h-[52px] rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Change Email
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={
                          verificationStatus === "sending" ||
                          verificationStatus === "verifying" ||
                          !isValidEmail(normalizedEmail) ||
                          resendCooldown > 0
                        }
                        className="h-[52px] rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.18)] transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {verificationStatus === "sending"
                          ? "Sending..."
                          : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : verificationStatus === "sent"
                          ? "Resend OTP"
                          : "Send OTP"}
                      </button>
                    )}
                  </div>
                </div>

                {!isEmailVerified ? (
                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    We will send a 6-digit OTP to this email. Verify it here, then create your account below.
                  </p>
                ) : (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Email verified successfully.
                  </div>
                )}

                {showVerificationCodeInput ? (
                  <div className="mt-5 rounded-2xl border border-[#eadfe3] bg-white p-4">
                    <label
                      htmlFor="verificationCode"
                      className="mb-2 block text-sm font-semibold text-[#374151]"
                    >
                      Enter OTP
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        id="verificationCode"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={emailVerificationCode}
                        onChange={(event) =>
                          setEmailVerificationCode(
                            event.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        className="h-[52px] flex-1 rounded-2xl border border-gray-300 bg-white px-4 text-sm tracking-[0.3em] text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={
                          verificationStatus === "verifying" ||
                          emailVerificationCode.trim().length !== 6
                        }
                        className="h-[52px] rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {verificationStatus === "verifying"
                          ? "Verifying..."
                          : "Verify Email"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="college"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  College Name
                </label>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="college"
                    name="college"
                    type="text"
                    placeholder="Enter your college name"
                    value={formData.college}
                    onChange={handleChange}
                    className="h-[52px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-[52px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#A01C33]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div
                    className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                      passwordChecks.minLength
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    6+ characters
                  </div>
                  <div
                    className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                      passwordChecks.hasLetter
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    Includes letters
                  </div>
                  <div
                    className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                      passwordChecks.hasNumber
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    Includes numbers
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-[52px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#A01C33]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#A01C33]"
                />
                <span>
                  I agree to the platform terms, hackathon rules, and participant
                  guidelines of HackSphere.
                </span>
              </label>

              <button
                type="submit"
                disabled={createAccountDisabled}
                className="mt-2 inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.26)] transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Creating Account..."
                  : isEmailVerified
                  ? "Create Account"
                  : "Verify Email To Continue"}
                {!loading && isEmailVerified ? <ArrowRight className="h-4 w-4" /> : null}
              </button>

              <div className="rounded-2xl border border-[#eadfe3] bg-[#fcfcfd] px-4 py-3 text-sm text-[#3B3C3E]">
                After signup, you will land on the approval screen and can
                join the participant WhatsApp group while admin approval is pending.
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href={`/login${
                    redirectTarget
                      ? `?redirect=${encodeURIComponent(redirectTarget)}`
                      : ""
                  }`}
                  className="font-semibold text-[#A01C33] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6]" />}>
      <RegisterContent />
    </Suspense>
  );
}
