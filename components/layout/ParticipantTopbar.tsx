"use client";

import Link from "next/link";
import { Bell, Menu, Sparkles, Trophy, Users } from "lucide-react";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  role: "participant" | "judge" | "admin";
  college?: string;
  avatar?: string;
  isApproved?: boolean;
};

type AuthMeResponse = {
  success: boolean;
  user: CurrentUser;
  message?: string;
};

type ParticipantTopbarProps = {
  onMenuClick?: () => void;
};

const workspaceLinks = [
  {
    label: "My Team",
    href: "/participant/my-team",
    icon: Users,
  },
  {
    label: "Announcements",
    href: "/participant/announcements",
    icon: Bell,
  },
  {
    label: "Leaderboard",
    href: "/participant/leaderboard",
    icon: Trophy,
  },
];

function getInitials(name?: string) {
  if (!name) return "HS";

  const parts = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "HS";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function getRoleLabel(role?: string) {
  if (!role) return "Participant";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getWorkspaceTitle(pathname: string) {
  if (pathname.startsWith("/participant/my-team")) return "Team Workspace";
  if (pathname.startsWith("/participant/problems")) return "Problem Library";
  if (pathname.startsWith("/participant/submission")) return "Submission Studio";
  if (pathname.startsWith("/participant/announcements")) return "Updates & Broadcasts";
  if (pathname.startsWith("/participant/leaderboard")) return "Results & Standings";
  if (pathname.startsWith("/participant/profile")) return "Profile & Access";
  if (pathname.startsWith("/participant/certificate")) return "Certificate Vault";
  if (pathname.startsWith("/participant/projects")) return "Project Brief";
  return "Mission Control";
}

export default function ParticipantTopbar({
  onMenuClick,
}: ParticipantTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data: AuthMeResponse = await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch current user");
        }

        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Participant topbar user fetch error:", error);
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const profileName = user?.name || "Participant";
  const profileRole = useMemo(() => getRoleLabel(user?.role), [user?.role]);
  const profileInitials = useMemo(() => getInitials(user?.name), [user?.name]);
  const workspaceTitle = useMemo(() => getWorkspaceTitle(pathname), [pathname]);
  const approvalLabel = user?.isApproved === false ? "Approval Pending" : "Workspace Active";
  const approvalTone =
    user?.isApproved === false
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#A01C33]/10 bg-[#A01C33]/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A01C33]">
              <Sparkles className="h-3.5 w-3.5" />
              Participant Workspace
            </div>
            <h2 className="mt-2 truncate text-xl font-bold text-[#1f2937]">
              {workspaceTitle}
            </h2>
          </div>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          {workspaceLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "border-[#A01C33]/20 bg-[#A01C33] text-white shadow-[0_10px_24px_rgba(160,28,51,0.18)]"
                    : "border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33]/20 hover:text-[#A01C33]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold lg:flex",
              approvalTone
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            {approvalLabel}
          </div>

          <ProfileDropdown
            name={profileName}
            role={profileRole}
            initials={profileInitials}
            profileHref="/participant/profile"
          />
        </div>
      </div>
    </header>
  );
}
