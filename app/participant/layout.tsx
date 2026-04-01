"use client";

import { useEffect, useState } from "react";
import ParticipantSidebar from "@/components/layout/ParticipantSidebar";
import ParticipantTopbar from "@/components/layout/ParticipantTopbar";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff4f7_0%,#f8fafc_34%,#eef2f7_100%)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-72 w-72 rounded-full bg-[#A01C33]/10 blur-3xl" />
        <div className="absolute right-[6%] top-[8%] h-72 w-72 rounded-full bg-[#d3aa57]/12 blur-3xl" />
      </div>

      <div className="flex min-h-screen">
        <ParticipantSidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <div className="relative flex min-w-0 flex-1 flex-col lg:pl-[290px]">
          <ParticipantTopbar onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1560px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
