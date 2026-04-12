"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ClipboardList,
  History,
  Medal,
  Menu,
  Sparkles,
  Users,
} from "lucide-react";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { cn } from "@/lib/utils";

type AdminTopbarProps = {
  onMenuClick?: () => void;
};

type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  role: "participant" | "judge" | "admin";
  college?: string;
};

type AuthMeResponse = {
  success: boolean;
  user: CurrentUser;
  message?: string;
};

const workspaceLinks = [
  {
    label: "Participants",
    href: "/admin/participants",
    icon: Users,
  },
  {
    label: "Submissions",
    href: "/admin/submissions",
    icon: ClipboardList,
  },
  {
    label: "Leaderboard",
    href: "/admin/leaderboard",
    icon: Medal,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: History,
  },
];

function getInitials(name?: string) {
  if (!name) return "AD";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "AD";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function getWorkspaceTitle(pathname: string) {
  if (pathname.startsWith("/admin/participants")) return "Participant Operations";
  if (pathname.startsWith("/admin/judges")) return "Judge Operations";
  if (pathname.startsWith("/admin/teams")) return "Team Oversight";
  if (pathname.startsWith("/admin/problems")) return "Problem Library";
  if (pathname.startsWith("/admin/submissions")) return "Submission Control";
  if (pathname.startsWith("/admin/announcements")) return "Communication Control";
  if (pathname.startsWith("/admin/audit-logs")) return "Audit Timeline";
  if (pathname.startsWith("/admin/certificates")) return "Certificate Studio";
  if (pathname.startsWith("/admin/leaderboard")) return "Ranking Control";
  if (pathname.startsWith("/admin/profile")) return "Profile & Access";
  return "Admin Command Center";
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
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
        console.error("Admin topbar user fetch error:", error);
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const workspaceTitle = useMemo(() => getWorkspaceTitle(pathname), [pathname]);
  const profileName = user?.name || "Admin";
  const profileRole = user?.college?.trim()
    ? `${user.college.trim()} Organizer`
    : "Organizer";
  const profileInitials = useMemo(() => getInitials(user?.name), [user?.name]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur-xl">
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
              Admin Workspace
            </div>
            <h2 className="mt-2 truncate text-xl font-bold text-[#1f2937]">
              {workspaceTitle}
            </h2>
          </div>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          {workspaceLinks.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

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
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 lg:flex">
            <Activity className="h-4 w-4" />
            Organizer Access Active
          </div>

          <ProfileDropdown
            name={profileName}
            role={profileRole}
            initials={profileInitials}
            profileHref="/admin/profile"
          />
        </div>
      </div>
    </header>
  );
}
