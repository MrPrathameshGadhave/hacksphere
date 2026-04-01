"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import PublicAuthShell from "@/components/public/PublicAuthShell";

type AdminRegisterFormData = {
  name: string;
  email: string;
  accessCode: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export default function AdminRegisterSecretPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<AdminRegisterFormData>({
    name: "",
    email: "",
    accessCode: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Enter a valid email address");
      return false;
    }

    if (!formData.accessCode.trim()) {
      toast.error("Admin access code is required");
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
      toast.error("Please accept the admin access and security guidelines");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const signupResponse = await axios.post("/api/auth/signup/admin", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        accessCode: formData.accessCode.trim(),
        password: formData.password,
      });

      if (!signupResponse.data?.success) {
        toast.error(signupResponse.data?.message || "Admin registration failed");
        return;
      }

      const loginResponse = await axios.post("/api/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (loginResponse.data?.success) {
        toast.success("Admin account created successfully");
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        toast.success("Admin account created successfully. Please login.");
        router.push("/login");
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
    <PublicAuthShell
      eyebrow="Restricted Admin Access"
      title="Provision an organizer-grade control workspace."
      description="This private registration route is reserved for official TechTitans organizers who manage the full HackSphere lifecycle, from approvals and assignments to leaderboard publishing."
      highlights={[
        {
          title: "Operations Command",
          text: "Manage participants, judges, submissions, and event settings from one connected admin system.",
          icon: UserCog,
        },
        {
          title: "Publishing Control",
          text: "Handle announcements, challenge visibility, results, and certificate distribution with proper authority.",
          icon: Sparkles,
        },
        {
          title: "Protected Access",
          text: "Admin accounts are reserved for verified organizers and secured by secret access codes.",
          icon: ShieldCheck,
        },
      ]}
    >
      <div className="w-full max-w-xl rounded-[30px] border border-[#eadfe3] bg-white/92 p-8 shadow-[0_16px_48px_rgba(74,36,48,0.08)] sm:p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-[#ead7de] bg-[#fff6f4] px-4 py-2 text-sm font-semibold text-[#9a6773]">
            Private Admin Registration
          </div>

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
            <Shield className="h-7 w-7" />
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-[#1f2937]">
            Admin Registration
          </h2>
          <p className="mt-3 text-base leading-7 text-gray-500">
            Create an organizer account using the issued secure access code. This
            route is reserved for the official HackSphere management team.
          </p>
        </div>

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
                placeholder="admin@college.edu"
                value={formData.email}
                onChange={handleChange}
                className="h-[52px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="accessCode"
              className="mb-2 block text-sm font-semibold text-[#374151]"
            >
              Admin Access Code
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="accessCode"
                name="accessCode"
                type={showAccessCode ? "text" : "password"}
                placeholder="Enter secure admin code"
                value={formData.accessCode}
                onChange={handleChange}
                className="h-[52px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
              />
              <button
                type="button"
                onClick={() => setShowAccessCode((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#A01C33]"
              >
                {showAccessCode ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
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

          <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfafb] px-4 py-3 text-sm text-gray-600">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#A01C33]"
            />
            <span>
              I understand this is restricted organizer access and I will use
              HackSphere only for official event management and operational work.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(160,28,51,0.26)] transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating Admin Account..." : "Create Admin Account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#A01C33] hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This page is for authorized TechTitans organizers only.
          </div>
        </div>
      </div>
    </PublicAuthShell>
  );
}
