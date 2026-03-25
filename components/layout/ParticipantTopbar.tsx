"use client";

import { Bell, Menu, Search } from "lucide-react";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ParticipantTopbar({
  onMenuClick,
}: ParticipantTopbarProps) {
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

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A01C33]/80">
              HackSphere
            </p>
            <h2 className="truncate text-xl font-bold text-[#3B3C3E]">
              Participant Workspace
            </h2>
          </div>
        </div>

        <div className="hidden w-full max-w-md items-center lg:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams, announcements, problems..."
              className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#A01C33]" />
          </button>

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