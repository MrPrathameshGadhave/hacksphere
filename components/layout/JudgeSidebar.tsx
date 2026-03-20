"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ClipboardCheck,
  Code2,
  LayoutDashboard,
  LogOut,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/judge/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects to Review",
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

export default function JudgeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-24 items-center border-b border-gray-100 px-6">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33] text-white shadow-md">
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
      </div>

      <div className="px-4 pt-5">
        <div className="rounded-2xl bg-gradient-to-br from-[#A01C33] to-[#7e1528] p-4 text-white shadow-[0_12px_28px_rgba(160,28,51,0.22)]">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Judge Panel
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-6">
            Review fairly. Score accurately. Guide innovation.
          </h2>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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
        <button className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6] text-[#A01C33]">
              <LogOut className="h-5 w-5" />
            </span>
            Logout
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}