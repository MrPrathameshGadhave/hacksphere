"use client";

import Link from "next/link";
import { LogOut, Settings, UserCircle2, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ProfileDropdownProps = {
  name: string;
  role: string;
  initials: string;
  profileHref: string;
};

export default function ProfileDropdown({
  name,
  role,
  initials,
  profileHref,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    alert("Logout backend/session clearing will be connected next.");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="hidden items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 transition hover:border-[#A01C33] sm:flex"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A01C33] text-sm font-bold text-white">
          {initials}
        </div>

        <div className="text-left leading-tight">
          <p className="text-sm font-semibold text-[#3B3C3E]">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm font-bold text-[#A01C33] transition hover:border-[#A01C33] sm:hidden"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 rounded-[24px] border border-gray-200 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="rounded-[20px] bg-[#f8f8f9] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33] text-sm font-bold text-white">
                {initials}
              </div>

              <div>
                <p className="text-sm font-bold text-[#3B3C3E]">{name}</p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:bg-[#f8f8f9] hover:text-[#A01C33]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A01C33]/10 text-[#A01C33]">
                <UserCircle2 className="h-5 w-5" />
              </span>
              My Profile
            </Link>

            <button
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:bg-[#f8f8f9] hover:text-[#A01C33]"
              onClick={() => {
                setOpen(false);
                alert("Settings UI can be added next.");
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A01C33]/10 text-[#A01C33]">
                <Settings className="h-5 w-5" />
              </span>
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <LogOut className="h-5 w-5" />
              </span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}