"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  Megaphone,
  Pin,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  college?: string;
  avatar?: string;
  role?: "participant" | "judge" | "admin";
  isApproved?: boolean;
};

type AnnouncementData = {
  _id: string;
  title: string;
  message: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  updatedAt?: string;
};

type AuthMeResponse = {
  success: boolean;
  user: BasicUser;
  message?: string;
};

type AnnouncementsResponse = {
  success: boolean;
  announcements: AnnouncementData[];
  message?: string;
};

const categoryStyles: Record<string, string> = {
  Important: "bg-[#A01C33]/10 text-[#A01C33]",
  Deadline: "bg-amber-100 text-amber-700",
  General: "bg-blue-100 text-blue-700",
  Results: "bg-green-100 text-green-700",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

function formatAnnouncementDate(value?: string) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes} min ago`;
  }
  if (diffMs < day) {
    const hours = Math.max(1, Math.floor(diffMs / hour));
    return `${hours} hr ago`;
  }
  if (diffMs < 7 * day) {
    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeCategory(category?: string) {
  if (!category) return "General";
  return category.trim();
}

export default function ParticipantAnnouncementsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const [me, announcementsRes] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<AnnouncementsResponse>("/api/announcements"),
        ]);

        if (!isMounted) return;

        const sortedAnnouncements = [...(announcementsRes.announcements || [])].sort(
          (a, b) => {
            if (a.pinned !== b.pinned) {
              return a.pinned ? -1 : 1;
            }

            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            return bTime - aTime;
          }
        );

        setUser(me.user);
        setAnnouncements(sortedAnnouncements);
      } catch (error) {
        const message = getErrorMessage(error);

        if (message === "UNAUTHORIZED") {
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(announcements.map((item) => normalizeCategory(item.category)))
    );

    return ["All", ...uniqueCategories];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const category = normalizeCategory(item.category);

      const matchesSearch =
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [announcements, searchTerm, categoryFilter]);

  const pinnedAnnouncements = useMemo(() => {
    return filteredAnnouncements.filter((item) => item.pinned);
  }, [filteredAnnouncements]);

  const pinnedAnnouncement = pinnedAnnouncements[0] || null;

  const regularAnnouncements = useMemo(() => {
    return filteredAnnouncements.filter((item) => item._id !== pinnedAnnouncement?._id);
  }, [filteredAnnouncements, pinnedAnnouncement]);

  const totalPinnedCount = useMemo(() => {
    return announcements.filter((item) => item.pinned).length;
  }, [announcements]);

  return (
    <section className="space-y-8">
      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-[linear-gradient(135deg,#fff8f8_0%,#fff0f0_100%)] px-5 py-4 text-sm text-red-700 shadow-[0_10px_30px_rgba(185,28,28,0.08)]">
          {error}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[34px] border border-[#ead8dd] bg-[linear-gradient(135deg,#fffdf9_0%,#fff3f1_52%,#fffaf6_100%)] p-6 shadow-[0_28px_80px_rgba(120,67,78,0.12)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#f8dde3] blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-[#fde6db] blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.92fr] xl:items-start">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#ead7de] bg-white/80 px-4 py-2 text-sm font-medium text-[#8d5d6a] shadow-sm">
              Announcements | Official TechTitans Updates
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[#26161d] sm:text-4xl lg:text-[2.7rem]">
              Stay updated with every important event notice and deadline.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4d53] sm:text-base">
              Follow official updates, hackathon instructions, schedule alerts,
              submission notices, and result announcements published by the
              organizing team.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] border border-[#eadfe3] bg-white/85 p-5 shadow-[0_16px_36px_rgba(74,36,48,0.06)]">
              <p className="text-sm font-medium text-[#8d5d6a]">Total Updates</p>
              <h3 className="mt-2 text-2xl font-bold text-[#26161d]">
                {loading ? "..." : announcements.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                Active participant-facing notices available.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#eadfe3] bg-white/85 p-5 shadow-[0_16px_36px_rgba(74,36,48,0.06)]">
              <p className="text-sm font-medium text-[#8d5d6a]">Pinned Notice</p>
              <h3 className="mt-2 text-2xl font-bold text-[#26161d]">
                {loading ? "..." : totalPinnedCount > 0 ? `${totalPinnedCount} Active` : "None"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                Pinned notices contain high-priority instructions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">
                  Announcement Feed
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Latest official updates
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[240px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search announcements..."
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-[#A01C33]/15 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <SkeletonBlock className="h-14 w-14 rounded-2xl" />
                  <div className="min-w-[240px] flex-1">
                    <SkeletonBlock className="h-6 w-36 rounded-full" />
                    <SkeletonBlock className="mt-4 h-8 w-80" />
                    <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
                    <SkeletonBlock className="mt-2 h-4 w-5/6 max-w-xl" />
                  </div>
                </div>

                <SkeletonBlock className="h-10 w-24 rounded-2xl" />
              </div>
            </div>
          ) : pinnedAnnouncement ? (
            <div className="rounded-[28px] border border-[#A01C33]/15 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33] text-white shadow-sm">
                    <Pin className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                      Pinned Announcement
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                      {pinnedAnnouncement.title}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500">
                      {pinnedAnnouncement.message}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                  {formatAnnouncementDate(pinnedAnnouncement.createdAt)}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <SkeletonBlock className="h-12 w-12 rounded-2xl" />

                        <div className="min-w-[240px] flex-1">
                          <SkeletonBlock className="h-6 w-24 rounded-full" />
                          <SkeletonBlock className="mt-4 h-6 w-72" />
                          <SkeletonBlock className="mt-3 h-4 w-full" />
                          <SkeletonBlock className="mt-2 h-4 w-5/6" />
                        </div>
                      </div>

                      <SkeletonBlock className="h-10 w-24 rounded-2xl" />
                    </div>
                  </div>
                ))
              ) : regularAnnouncements.length > 0 ? (
                regularAnnouncements.map((item) => (
                  <div
                    key={item._id}
                    className="group rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:-translate-y-0.5 hover:border-[#A01C33]/20 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <Megaphone className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              categoryStyles[normalizeCategory(item.category)] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {normalizeCategory(item.category)}
                          </div>

                          <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                            {item.title}
                          </h3>

                          <p className="mt-2 text-sm leading-7 text-gray-500">
                            {item.message}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                        {formatAnnouncementDate(item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-gray-300 bg-[#fafafa] p-8 text-center">
                  <h3 className="text-lg font-bold text-[#3B3C3E]">
                    {announcements.length === 0
                      ? "No announcements yet"
                      : "No announcements match your search"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    {announcements.length === 0
                      ? "Official participant updates will appear here once published by the organizing team."
                      : "Try changing your search or category filter to see more updates."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Update Types</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              What to watch for
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Important</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Core instructions and crucial notices from TechTitans.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Deadlines</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Team formation, submission, and schedule-related alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Results</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Score publication and leaderboard result updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Participant Reminder</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Stay in sync
            </h2>

            <div className="mt-6 rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-[#3B3C3E]">
                    Check announcements regularly
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Missing a deadline or instruction can affect team workflow,
                    problem selection, or final submission readiness.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-[#3B3C3E]">Best practice</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Review updates before working on team setup, problem locking,
                    and final project submission.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm font-medium text-[#A01C33]">Signed in as</p>
              <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                {loading ? "Loading..." : user?.name || "Participant"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                {loading
                  ? "Checking your session..."
                  : "You are viewing the live participant announcement feed."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
