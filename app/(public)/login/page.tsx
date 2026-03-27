"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import {
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  GitBranch,
  Mail,
  LockKeyhole,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const redirect = searchParams.get("redirect") || "";
  const inviteEmail = String(searchParams.get("email") || "")
    .trim()
    .toLowerCase();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    if (!inviteEmail) return;

    setFormData((prev) => ({
      ...prev,
      email: inviteEmail,
    }));
  }, [inviteEmail]);

  const registerHref = useMemo(() => {
    const params = new URLSearchParams();

    if (inviteEmail) {
      params.set("email", inviteEmail);
    }

    if (redirect) {
      params.set("redirect", redirect);
    } else if (from) {
      params.set("redirect", from);
    }

    const query = params.toString();
    return query ? `/register?${query}` : "/register";
  }, [inviteEmail, redirect, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getRoleRedirectPath = (role: string) => {
    if (redirect) return redirect;
    if (from) return from;

    switch (role) {
      case "participant":
        return "/participant/dashboard";
      case "judge":
        return "/judge/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.data?.success) {
        toast.success("Login successful");
        const redirectPath = getRoleRedirectPath(response.data.user.role);
        router.replace(redirectPath);
        router.refresh();
      } else {
        toast.error(response.data?.message || "Login failed");
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
                Build. Innovate. Hack.
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/85">
                The premier platform where visionary students join hackathons,
                form stellar teams, submit groundbreaking projects, and compete
                on dynamic leaderboards powered by TechTitans.
              </p>

              <div className="mt-8 h-px w-full bg-white/20" />

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Join competitive hackathons
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Collaborate with innovative teams
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <p className="text-base font-medium text-white">
                    Submit projects and rise on the leaderboard
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
                Welcome Back
              </h2>
              <p className="mt-3 text-base text-gray-500">
                Please enter your details to sign in.
              </p>
            </div>

            {redirect ? (
              <div className="mb-5 rounded-2xl border border-[#A01C33]/15 bg-[#A01C33]/[0.03] px-4 py-3 text-sm text-[#3B3C3E]">
                Login to continue your team invitation or protected flow.
              </div>
            ) : null}

            {inviteEmail ? (
              <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Continue with <strong>{inviteEmail}</strong> to accept the team invitation.
              </div>
            ) : null}

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
                    name="email"
                    type="email"
                    placeholder="student@dypatil.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-13 w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-13 w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
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
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 accent-[#A01C33]"
                  />
                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#A01C33] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.26)] transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="pt-1 text-center">
                <p className="text-sm font-medium text-gray-500">
                  Or continue with
                </p>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href={registerHref}
                  className="font-semibold text-[#A01C33] hover:underline"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6]" />}>
      <LoginContent />
    </Suspense>
  );
}