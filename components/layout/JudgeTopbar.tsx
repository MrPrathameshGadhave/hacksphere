"use client";

import { Bell, Menu, Search } from "lucide-react";
import ProfileDropdown from "@/components/layout/ProfileDropdown";

export default function JudgeTopbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-[#3B3C3E] lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A01C33]/80">
              HackSphere
            </p>
            <h2 className="truncate text-xl font-bold text-[#3B3C3E]">
              Judge Workspace
            </h2>
          </div>
        </div>

        <div className="hidden w-full max-w-md items-center lg:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions, teams..."
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
            name="Dr. Kiran Patil"
            role="Judge"
            initials="KP"
            profileHref="/judge/profile"
          />
        </div>
      </div>
    </header>
  );
}