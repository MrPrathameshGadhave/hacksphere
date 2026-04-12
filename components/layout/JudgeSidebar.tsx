"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import {
  ChevronRight,
  ClipboardCheck,
  Code2,
  LayoutDashboard,
  LogOut,
  Trophy,
  UserCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  {
    label: "Dashboard",
    href: "/judge/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Review Queue",
    href: "/judge/reviews",
    icon: ClipboardCheck,
  },
  {
    label: "Leaderboard",
    href: "/judge/leaderboard",
    icon: Trophy,
  },
  {
    label: "Profile",
    href: "/judge/profile",
    icon: UserCircle2,
  },
];

type JudgeSidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarContentProps = {
  pathname: string;
  isLoggingOut: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  showMobileClose?: boolean;
  onClose?: () => void;
};

function SidebarContent({
  pathname,
  isLoggingOut,
  onLogout,
  onNavigate,
  showMobileClose = false,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex h-24 items-center justify-between border-b border-[#efe3e7] px-6">
        <Link href="/" className="flex items-center gap-4" onClick={onNavigate}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#a01c33_0%,#7e1528_100%)] text-white shadow-[0_16px_30px_rgba(160,28,51,0.18)]">
            <Code2 className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#A01C33]">
              HackSphere
            </h1>
            <p className="text-xs font-medium text-[#3B3C3E]/70">
              Organized by TechTitans
            </p>
          </div>
        </Link>

        {showMobileClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="px-4 pt-5">
        <div className="rounded-[26px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfb_0%,#fff4f2_100%)] p-5 shadow-[0_16px_36px_rgba(74,36,48,0.08)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9a6773]">
            Evaluation Desk
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-6 text-[#2a1d22]">
            Review fairly. Score clearly. Shape the final rankings.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#6f5b62]">
            Your workspace is focused on assigned reviews, consistent scoring,
            and constructive evaluation feedback.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                isActive
                  ? "bg-[#A01C33] text-white shadow-[0_10px_20px_rgba(160,28,51,0.18)]"
                  : "text-[#3B3C3E] hover:bg-[#f7f7f8]"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition",
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-[#f3f4f6] text-[#A01C33] group-hover:bg-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "h-4 w-4 transition",
                  isActive ? "text-white/80" : "text-gray-400"
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6] text-[#A01C33]">
              <LogOut className="h-5 w-5" />
            </span>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </>
  );
}

export default function JudgeSidebar({
  mobileOpen = false,
  onClose,
}: JudgeSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeSidebarOnNavigate = useEffectEvent(() => {
    if (mobileOpen && onClose) {
      onClose();
    }
  });

  useEffect(() => {
    closeSidebarOnNavigate();
  }, [pathname, mobileOpen, onClose]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed");
      }

      if (onClose) {
        onClose();
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Judge sidebar logout error:", error);
      toast.error("Unable to logout right now. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] border-r border-[#efe3e7] bg-white/92 backdrop-blur-xl lg:flex lg:flex-col">
        <SidebarContent
          pathname={pathname}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
        />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="h-full w-full"
          aria-label="Close sidebar overlay"
        />
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-[#efe3e7] bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          pathname={pathname}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          onNavigate={onClose}
          showMobileClose
          onClose={onClose}
        />
      </aside>
    </>
  );
}
