"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import {
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/reset-password", {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data?.success) {
        setSuccess(true);
        toast.success("Password reset successful!");
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } else {
        toast.error(response.data?.message || "Failed to reset password");
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

  if (!token) {
    return (
      <main className="min-h-screen bg-[#f3f4f6] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
          <section className="flex flex-1 items-center justify-center bg-[#fbfbfb] px-4 py-8 sm:px-8 lg:px-12">
            <div className="w-full max-w-md rounded-[28px] border border-[#ececec] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#1f2937]">
                Invalid Reset Link
              </h2>
              <p className="mt-3 text-sm text-gray-500">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.26)] transition hover:bg-[#89172c]"
              >
                Request New Reset Link
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
        <section className="relative hidden w-[48%] overflow-hidden lg:flex">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-[#A01C33]/88" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_22%)]" />

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
              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Create New Password
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/85">
                Choose a strong password to secure your HackSphere account. Make sure it's something you'll remember!
              </p>

              <div className="mt-8 h-px w-full bg-white/20" />

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Use at least 6 characters
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Confirm your password matches
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs tracking-wide text-white/65">
              HACKSPHERE • TECHTITANS • COLLEGE HACKATHON PLATFORM
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-[#fbfbfb] px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-[28px] border border-[#ececec] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-10">
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
                Create New Password
              </h2>
              <p className="mt-3 text-base text-gray-500">
                Enter your new password below
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-center">
                  <p className="text-sm text-green-700">
                    <strong>Password reset successful!</strong> You can now login with your new password. Redirecting you to login...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#374151]"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`h-13 w-full rounded-2xl border py-3 pl-12 pr-12 text-sm outline-none transition ${
                        errors.password
                          ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-300/15"
                          : "border-gray-300 bg-white focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                      } text-[#111827]`}
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
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
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
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`h-13 w-full rounded-2xl border py-3 pl-12 pr-12 text-sm outline-none transition ${
                        errors.confirmPassword
                          ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-300/15"
                          : "border-gray-300 bg-white focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                      } text-[#111827]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#A01C33]"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.26)] transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#A01C33] hover:underline"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
