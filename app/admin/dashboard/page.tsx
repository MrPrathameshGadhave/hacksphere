"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
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

function calculatePercentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
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
        title: "Participants",
        value: data.stats.totalParticipants,
        subtext: `${Math.max(
          data.stats.totalParticipants - data.overview.pendingParticipantApprovals,
          0
        )} approved, ${data.overview.pendingParticipantApprovals} pending`,
        icon: SquareUserRound,
      },
      {
        title: "Teams",
        value: data.stats.totalTeams,
        subtext: `${Math.max(data.stats.totalTeams - data.overview.pendingTeams, 0)} active, ${data.overview.teamsWithoutProblem} without problem`,
        icon: Users,
      },
      {
        title: "Judges",
        value: data.stats.totalJudges,
        subtext:
          data.overview.blockedJudges > 0
            ? `${data.overview.blockedJudges} blocked account(s) need review`
            : "Judge access looks healthy",
        icon: UserCog,
      },
      {
        title: "Submissions",
        value: data.stats.totalSubmissions,
        subtext: `${data.overview.readyForJudging} ready, ${data.stats.pendingReviews} review task(s) pending`,
        icon: ClipboardList,
      },
    ];
  }, [data]);

  const metrics = useMemo(() => {
    if (!data) return null;

    const approvedParticipants = Math.max(
      data.stats.totalParticipants - data.overview.pendingParticipantApprovals,
      0
    );
    const activeTeams = Math.max(
      data.stats.totalTeams - data.overview.pendingTeams,
      0
    );
    const teamsWithProblem = Math.max(
      data.stats.totalTeams - data.overview.teamsWithoutProblem,
      0
    );

    const participantApprovalRate = calculatePercentage(
      approvedParticipants,
      data.stats.totalParticipants
    );
    const teamReadinessRate = calculatePercentage(
      activeTeams,
      data.stats.totalTeams
    );
    const problemPublishingRate = calculatePercentage(
      data.overview.publishedProblems,
      data.overview.totalProblems
    );
    const resultReadiness =
      data.overview.leaderboardState === "Published"
        ? 100
        : data.stats.totalSubmissions === 0
        ? 0
        : data.stats.pendingReviews === 0 && data.overview.readyForJudging === 0
        ? 82
        : 46;

    const programReadiness = Math.round(
      (
        participantApprovalRate +
        teamReadinessRate +
        problemPublishingRate +
        data.overview.reviewCoverage +
        resultReadiness
      ) /
        5
    );

    return {
      approvedParticipants,
      activeTeams,
      teamsWithProblem,
      participantApprovalRate,
      teamReadinessRate,
      problemPublishingRate,
      resultReadiness,
      programReadiness,
    };
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

  const eventProgress = useMemo(() => {
    if (!data || !metrics) return [];

    return [
      {
        title: "Participant approvals",
        progress: metrics.participantApprovalRate,
        value: `${metrics.approvedParticipants}/${data.stats.totalParticipants || 0}`,
        helper:
          data.overview.pendingParticipantApprovals > 0
            ? `${data.overview.pendingParticipantApprovals} participant account(s) still need approval.`
            : "All participant approvals are currently clear.",
        href: "/admin/participants",
        icon: SquareUserRound,
      },
      {
        title: "Team readiness",
        progress: metrics.teamReadinessRate,
        value: `${metrics.activeTeams}/${data.stats.totalTeams || 0}`,
        helper:
          data.overview.pendingTeams > 0
            ? `${data.overview.pendingTeams} team record(s) are still pending setup.`
            : `${metrics.teamsWithProblem} team(s) have selected a problem statement.`,
        href: "/admin/teams",
        icon: Users,
      },
      {
        title: "Problem publishing",
        progress: metrics.problemPublishingRate,
        value: `${data.overview.publishedProblems}/${data.overview.totalProblems || 0}`,
        helper:
          data.overview.totalProblems === 0
            ? "No problem statements have been created yet."
            : `${data.overview.totalProblems - data.overview.publishedProblems} problem statement(s) remain unpublished.`,
        href: "/admin/problems",
        icon: Target,
      },
      {
        title: "Judging coverage",
        progress: data.overview.reviewCoverage,
        value: `${data.overview.completedReviews} reviews`,
        helper:
          data.stats.pendingReviews > 0
            ? `${data.stats.pendingReviews} assigned review task(s) are still open.`
            : "Assigned review coverage looks stable right now.",
        href: "/admin/submissions",
        icon: ShieldCheck,
      },
      {
        title: "Results readiness",
        progress: metrics.resultReadiness,
        value: data.overview.leaderboardState,
        helper:
          data.overview.leaderboardState === "Published"
            ? "Leaderboard is already visible to participants."
            : `${data.overview.readyForJudging} submission(s) remain in the judging-ready queue before final publishing.`,
        href: "/admin/leaderboard",
        icon: Medal,
      },
    ];
  }, [data, metrics]);

  const controlDetails = useMemo(() => {
    if (!data) return [];

    return [
      { label: "Ready for judging", value: data.overview.readyForJudging },
      { label: "Locked submissions", value: data.overview.lockedSubmissions },
      { label: "Pinned announcements", value: data.overview.pinnedAnnouncements },
      { label: "Total announcements", value: data.stats.announcements },
      { label: "Review coverage", value: `${data.overview.reviewCoverage}%` },
      { label: "Leaderboard state", value: data.overview.leaderboardState },
    ];
  }, [data]);

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[34px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfc_0%,#fff5f3_48%,#f7fafc_100%)] p-8 shadow-[0_24px_60px_rgba(74,36,48,0.08)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7de] bg-white/85 px-4 py-2 text-sm font-semibold text-[#9a6773]">
              <Sparkles className="h-4 w-4 text-[#A01C33]" />
              Admin Command Center
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-[#22171c] sm:text-4xl">
              Run the full HackSphere event from one clearer, more operational dashboard.
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6f5b62] sm:text-base">
              See participant flow, team readiness, judging coverage, submission pressure,
              and publication status in one place. This dashboard is focused on the details
              that actually drive the event forward.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                Platform: <span className="text-[#A01C33]">{data?.hero.platformState || "Live"}</span>
              </div>
              <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                Leaderboard: <span className="text-[#A01C33]">{data?.hero.leaderboardState || "Draft"}</span>
              </div>
              <div className="rounded-full border border-[#ead7de] bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E]">
                Review coverage: <span className="text-[#A01C33]">{data?.hero.reviewCoverage || 0}%</span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/admin/submissions"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(160,28,51,0.2)] transition hover:bg-[#89172c]"
              >
                Open Submissions
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/admin/participants"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ead7de] bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Review Approvals
              </Link>

              <button
                onClick={() => void fetchDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ead7de] bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="rounded-[28px] border border-[#eadfe3] bg-white/88 p-6 shadow-sm">
              <p className="text-sm font-medium text-[#9a6773]">Event progress</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="text-3xl font-black text-[#22171c]">
                  {metrics?.programReadiness || 0}%
                </h3>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                Overall readiness across approvals, teams, publishing, judging,
                and results.
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#f3e8ec]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#a01c33_0%,#d27b8d_100%)] transition-all"
                  style={{ width: `${Math.min(metrics?.programReadiness || 0, 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-[#eadfe3] bg-white/88 p-5 shadow-sm">
              <p className="text-sm font-medium text-[#9a6773]">Ready for judging</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-[#22171c]">
                  {data?.overview.readyForJudging || 0}
                </h3>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6f5b62]">
                Submission records already waiting in the judging pipeline.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#eadfe3] bg-white/88 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#9a6773]">Open review tasks</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#22171c]">
                    {data?.stats.pendingReviews || 0}
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#6f5b62]">
                Assigned judging work that still needs to be completed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm"
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
                  className="group rounded-[26px] border border-gray-200 bg-white/92 p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]"
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
                <p className="text-sm font-medium text-[#A01C33]">Event Progress</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Progress across the full event pipeline
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <SkeletonBlock className="h-5 w-1/3" />
                      <SkeletonBlock className="mt-4 h-8 w-28" />
                      <SkeletonBlock className="mt-4 h-3 w-full" />
                      <SkeletonBlock className="mt-4 h-10 w-full" />
                    </div>
                  ))
                : eventProgress.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group block rounded-[24px] border border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfd_100%)] p-5 transition hover:border-[#A01C33]/20 hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <h3 className="text-lg font-bold text-[#3B3C3E]">
                                    {item.title}
                                  </h3>
                                  <p className="mt-1 text-sm font-semibold text-[#A01C33]">
                                    {item.value}
                                  </p>
                                </div>

                                <div className="rounded-full bg-[#f7eef1] px-3 py-1 text-xs font-semibold text-[#A01C33]">
                                  {item.progress}%
                                </div>
                              </div>

                              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#f3e8ec]">
                                <div
                                  className="h-full rounded-full bg-[linear-gradient(90deg,#a01c33_0%,#d27b8d_100%)] transition-all"
                                  style={{ width: `${Math.min(item.progress, 100)}%` }}
                                />
                              </div>

                              <p className="mt-3 text-sm leading-6 text-gray-500">
                                {item.helper}
                              </p>
                            </div>
                          </div>

                          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#A01C33] transition group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Attention Queue</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              What needs admin attention now
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
            <p className="text-sm font-medium text-[#A01C33]">Control Details</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Minor details at a glance
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <SkeletonBlock className="h-4 w-1/2" />
                      <SkeletonBlock className="mt-4 h-8 w-20" />
                    </div>
                  ))
                : controlDetails.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-bold text-[#3B3C3E]">
                        {item.value}
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
