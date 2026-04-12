"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ttlogo from "@/app/utils/tt.jpeg";
import { usePublicAuthState } from "@/components/public/PublicAuthActions";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Hackathon", href: "/about" },
  { label: "Tech Titans", href: "/techtitans" },
  { label: "Problem Statements", href: "/problem-statements" },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status, workspaceHref, workspaceLabel } = usePublicAuthState();

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#F8E9ED] ring-1 ring-[#A01C33]/10 transition duration-300 group-hover:scale-105 group-hover:shadow-[0_14px_28px_rgba(160,28,51,0.18)]">
            <Image
              src={ttlogo}
              alt="Tech Titans logo"
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="text-2xl font-black tracking-tight text-[#A01C33]">
              HackSphere
            </div>
            <div className="text-xs font-medium text-[#6B7280]">
              Organized by Tech Titans Technical Club of DPGU
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          {navLinks.map((item) => {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative text-black transition duration-300 hover:text-[#A01C33] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[#A01C33] after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            );
          })}

          {status === "guest" ? (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[#A01C33]/20 bg-[#F8E9ED] px-5 py-2.5 text-[#A01C33] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#A01C33] hover:bg-white hover:shadow-[0_14px_30px_rgba(160,28,51,0.14)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-5 py-2.5 text-white shadow-[0_16px_34px_rgba(160,28,51,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(160,28,51,0.30)]"
              >
                Register
              </Link>
            </>
          ) : null}

          {status === "authenticated" ? (
            <Link
              href={workspaceHref}
              className="rounded-full bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-5 py-2.5 text-white shadow-[0_16px_34px_rgba(160,28,51,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(160,28,51,0.30)]"
            >
              {workspaceLabel}
            </Link>
          ) : null}
        </nav>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/50 text-[#3B3C3E] backdrop-blur md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/20 bg-white/70 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4">
            {navLinks.map((item) => {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    "text-black hover:bg-white/80 hover:text-[#A01C33]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {status === "guest" ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-[#A01C33]/20 bg-[#F8E9ED] px-4 py-3 text-sm font-semibold text-[#A01C33]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-[#A01C33] px-4 py-3 text-sm font-semibold text-white shadow-md"
                >
                  Register
                </Link>
              </>
            ) : null}

            {status === "authenticated" ? (
              <Link
                href={workspaceHref}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-[#A01C33] px-4 py-3 text-sm font-semibold text-white shadow-md"
              >
                {workspaceLabel}
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
