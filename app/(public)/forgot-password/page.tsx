"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import { ArrowRight, Code2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ForgotPasswordContent() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      if (response.data?.success) {
        setSubmitted(true);
        toast.success("Check your email for password reset instructions");
      } else {
        toast.error(response.data?.message || "Failed to process request");
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
                Reset Your Password
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/85">
                Don't worry! We'll help you regain access to your HackSphere account and get back to building amazing projects.
              </p>

              <div className="mt-8 h-px w-full bg-white/20" />

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <p className="text-base text-white/85">
                    Enter your email address
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <p className="text-base text-white/85">
                    Check your email for reset instructions
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <p className="text-base text-white/85">
                    Create your new password
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
                Forgot Password?
              </h2>
              <p className="mt-3 text-base text-gray-500">
                {submitted
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive password reset instructions"}
              </p>
            </div>

            {submitted ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-center">
                  <p className="text-sm text-green-700">
                    <strong>Check your email!</strong> We've sent password reset instructions to <strong>{email}</strong>. The link will expire in 1 hour.
                  </p>
                </div>

                <p className="text-center text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    className="font-semibold text-[#A01C33] hover:underline"
                  >
                    try again
                  </button>
                </p>

                <button
                  onClick={() => router.push("/login")}
                  className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.26)] transition hover:bg-[#89172c]"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#374151]"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="student@dypatil.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-13 w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.26)] transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Sending..." : "Send Reset Instructions"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33] transition hover:gap-3"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
