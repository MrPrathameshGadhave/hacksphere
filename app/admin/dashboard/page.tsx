"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Medal,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  SquareUserRound,
  Target,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";

type DashboardResponse = {
  success: boolean;
  hero: {
    platformState: string;
    leaderboardState: "Draft" | "Published";
    reviewCoverage: number;
    readyForJudging: number;
  };
  stats: {
    totalParticipants: number;
    totalTeams: number;
    totalJudges: number;
    totalSubmissions: number;
    pendingReviews: number;
    announcements: number;
  };
  overview: {
    completedReviews: number;
    reviewCoverage: number;
    pendingParticipantApprovals: number;
    blockedJudges: number;
    pendingTeams: number;
    teamsWithoutProblem: number;
    publishedProblems: number;
    totalProblems: number;
    readyForJudging: number;
    lockedSubmissions: number;
    pinnedAnnouncements: number;
    leaderboardState: "Draft" | "Published";
  };
  quickActionMeta: {
    participants: { badge: string; accent: "warning" | "success" | "info" };
    teams: { badge: string; accent: "warning" | "success" | "info" };
    judges: { badge: string; accent: "warning" | "success" | "info" };
    problems: { badge: string; accent: "warning" | "success" | "info" };
    submissions: { badge: string; accent: "warning" | "success" | "info" };
    leaderboard: { badge: string; accent: "warning" | "success" | "info" };
  };
  recentActivity: {
    title: string;
    meta: string;
    tone: "info" | "success" | "warning";
  }[];
  message?: string;
};

const quickActions = [
  {
    key: "participants",
    title: "Manage Participants",
    description: "Review registered users, approval state, and participant activity.",
    href: "/admin/participants",
    icon: SquareUserRound,
  },
  {
    key: "teams",
    title: "Manage Teams",
    description: "Track team creation, readiness, and unresolved team setup issues.",
    href: "/admin/teams",
    icon: Users,
  },
  {
    key: "judges",
    title: "Manage Judges",
    description: "Control judge accounts, assignments, and review readiness.",
    href: "/admin/judges",
    icon: UserCog,
  },
  {
    key: "problems",
    title: "Problem Statements",
    description: "Create, publish, and organize challenge statements for the event.",
    href: "/admin/problems",
    icon: Target,
  },
  {
    key: "submissions",
    title: "Submissions",
    description: "Inspect projects, manage review readiness, and assign judges.",
    href: "/admin/submissions",
    icon: ClipboardList,
  },
  {
    key: "leaderboard",
    title: "Publish Leaderboard",
    description: "Validate rankings and control public leaderboard visibility.",
    href: "/admin/leaderboard",
    icon: Medal,
  },
] as const;

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${className}`}
    />
  );
}

function getAccentClasses(accent: "warning" | "success" | "info") {
  if (accent === "warning") {
    return "bg-amber-100 text-amber-700";
  }

  if (accent === "success") {
    return "bg-green-100 text-green-700";
  }

  return "bg-blue-100 text-blue-700";
}

function getActivityClasses(tone: "info" | "success" | "warning") {
  if (tone === "success") {
    return {
      iconWrap: "bg-green-100 text-green-700",
      card: "border-green-200 bg-green-50/60",
    };
  }

  if (tone === "warning") {
    return {
      iconWrap: "bg-amber-100 text-amber-700",
      card: "border-amber-200 bg-amber-50/60",
    };
  }

  return {
    iconWrap: "bg-blue-100 text-blue-700",
    card: "border-blue-200 bg-blue-50/60",
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const result = (await response.json().catch(() => null)) as
        | DashboardResponse
        | { success?: false; message?: string }
        | null;

      if (!response.ok || !result || !("success" in result) || !result.success) {
        throw new Error(
          result && "message" in result
            ? result.message || "Failed to fetch dashboard."
            : "Failed to fetch dashboard."
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        title: "Total Participants",
        value: data.stats.totalParticipants,
        subtext: "Registered students in the system",
        icon: SquareUserRound,
      },
      {
        title: "Total Teams",
        value: data.stats.totalTeams,
        subtext: "Active team records across the event",
        icon: Users,
      },
      {
        title: "Total Judges",
        value: data.stats.totalJudges,
        subtext: "Judge accounts available for evaluations",
        icon: UserCog,
      },
      {
        title: "Total Submissions",
        value: data.stats.totalSubmissions,
        subtext: "Submission records stored in HackSphere",
        icon: ClipboardList,
      },
      {
        title: "Pending Reviews",
        value: data.stats.pendingReviews,
        subtext: "Review tasks still awaiting completion",
        icon: ShieldCheck,
      },
      {
        title: "Announcements",
        value: data.stats.announcements,
        subtext: "Notices published for event communication",
        icon: Bell,
      },
    ];
  }, [data]);

  const operationalAlerts = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: "Participant approvals",
        value: data.overview.pendingParticipantApprovals,
        helper:
          data.overview.pendingParticipantApprovals > 0
            ? "Needs admin attention"
            : "All participant approvals cleared",
        href: "/admin/participants",
        icon: SquareUserRound,
        accent:
          data.overview.pendingParticipantApprovals > 0 ? "warning" : "success",
      },
      {
        title: "Judge access issues",
        value: data.overview.blockedJudges,
        helper:
          data.overview.blockedJudges > 0
            ? "Blocked judges need review"
            : "Judge access looks healthy",
        href: "/admin/judges",
        icon: UserCog,
        accent: data.overview.blockedJudges > 0 ? "warning" : "success",
      },
      {
        title: "Teams pending setup",
        value: data.overview.pendingTeams,
        helper:
          data.overview.pendingTeams > 0
            ? "Some teams are still incomplete"
            : "Teams are mostly healthy",
        href: "/admin/teams",
        icon: Users,
        accent: data.overview.pendingTeams > 0 ? "warning" : "success",
      },
      {
        title: "Ready for judging",
        value: data.overview.readyForJudging,
        helper:
          data.overview.readyForJudging > 0
            ? "Submissions waiting in judging pipeline"
            : "No submissions in judging queue",
        href: "/admin/submissions",
        icon: ClipboardList,
        accent: data.overview.readyForJudging > 0 ? "info" : "success",
      },
    ];
  }, [data]);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_22px_70px_rgba(160,28,51,0.30)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Admin Dashboard • Event Control Center
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Manage the entire HackSphere event from one polished command center.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Track participants, teams, judges, submissions, review coverage,
              announcements, and leaderboard visibility across the full hackathon lifecycle.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/admin/submissions"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                View Submissions
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/admin/leaderboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Open Leaderboard
              </Link>

              <button
                onClick={() => void fetchDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Platform State</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">
                  {loading ? "..." : data?.hero.platformState || "Live"}
                </h3>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Event operations are active and trackable.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Leaderboard State</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">
                  {loading ? "..." : data?.hero.leaderboardState || "Draft"}
                </h3>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Medal className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Public leaderboard visibility is controlled here.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/80">Review Coverage</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">
                    {loading ? "..." : `${data?.hero.reviewCoverage || 0}%`}
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 h-2.5 rounded-full bg-white/15">
                <div
                  className="h-2.5 rounded-full bg-white"
                  style={{
                    width: `${loading ? 18 : Math.min(data?.hero.reviewCoverage || 0, 100)}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-white/75">
                {loading
                  ? "Loading review pipeline..."
                  : `${data?.hero.readyForJudging || 0} submissions are currently in the judging-ready queue.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"
              >
                <SkeletonBlock className="h-4 w-1/2" />
                <SkeletonBlock className="mt-4 h-9 w-24" />
                <SkeletonBlock className="mt-4 h-12 w-full" />
              </div>
            ))
          : stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{item.title}</p>
                      <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                        {item.value}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {item.subtext}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition group-hover:bg-[#A01C33] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Quick Actions</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Manage core modules
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <SkeletonBlock className="h-12 w-12" />
                      <SkeletonBlock className="mt-4 h-5 w-2/3" />
                      <SkeletonBlock className="mt-3 h-12 w-full" />
                    </div>
                  ))
                : quickActions.map((item) => {
                    const Icon = item.icon;
                    const meta = data?.quickActionMeta[item.key];

                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition group-hover:bg-[#A01C33] group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </div>

                          {meta ? (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAccentClasses(
                                meta.accent
                              )}`}
                            >
                              {meta.badge}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>

                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]">
                          Open
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Operational Focus</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              What needs attention now
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <SkeletonBlock className="h-4 w-1/2" />
                      <SkeletonBlock className="mt-4 h-8 w-20" />
                      <SkeletonBlock className="mt-3 h-10 w-full" />
                    </div>
                  ))
                : operationalAlerts.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/20 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition group-hover:bg-[#A01C33] group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </div>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAccentClasses(
                              item.accent as "warning" | "success" | "info"
                            )}`}
                          >
                            {item.value}
                          </span>
                        </div>

                        <h3 className="mt-4 text-base font-bold text-[#3B3C3E]">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {item.helper}
                        </p>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Recent Activity</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Event movement
            </h2>

            <div className="mt-6 space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <SkeletonBlock className="h-5 w-2/3" />
                      <SkeletonBlock className="mt-3 h-10 w-full" />
                    </div>
                  ))
                : (data?.recentActivity || []).map((item, index) => {
                    const styles = getActivityClasses(item.tone);

                    return (
                      <div
                        key={`${item.title}-${index}`}
                        className={`rounded-[22px] border p-5 ${styles.card}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}
                          >
                            {item.tone === "warning" ? (
                              <AlertTriangle className="h-5 w-5" />
                            ) : item.tone === "success" ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Activity className="h-5 w-5" />
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-[#3B3C3E]">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                              {item.meta}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

              {!loading && (data?.recentActivity || []).length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-gray-200 bg-[#fcfcfd] p-5">
                  <p className="text-sm text-gray-500">
                    No recent activity has been recorded yet.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Admin Reminder</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Publishing discipline
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">
                      Review before publish
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-gray-500">
                      Ensure evaluations are complete and verified before publishing
                      final rankings and result announcements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <BarChart3 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">
                      Review coverage at a glance
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-gray-500">
                      {loading
                        ? "Loading coverage..."
                        : `${data?.overview.completedReviews || 0} completed reviews are recorded with ${data?.overview.reviewCoverage || 0}% pipeline coverage.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <Target className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">
                      Problem publishing health
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-gray-500">
                      {loading
                        ? "Loading problem status..."
                        : `${data?.overview.publishedProblems || 0} of ${data?.overview.totalProblems || 0} problem statements are currently published.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}