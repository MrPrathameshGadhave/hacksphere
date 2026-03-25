"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Medal, ShieldCheck, Trophy, Users } from "lucide-react";

type LeaderboardItem = {
  rank: number;
  teamId: string;
  teamName: string;
  averageScore: number;
  reviewsCount: number;
  membersCount: number;
  status: "completed" | "pending";
  problemTitle: string;
  submissionId: string;
  submittedAt: string | null;
  projectTitle: string;
};

type LeaderboardResponse = {
  success: boolean;
  items: LeaderboardItem[];
  topThree: LeaderboardItem[];
};

function formatDate(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatScore(value: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getRankCardStyles(rank: number) {
  if (rank === 1) {
    return "border-[#A01C33]/20 bg-[#A01C33]/[0.04]";
  }

  if (rank === 2) {
    return "border-gray-300 bg-gray-50";
  }

  return "border-[#d6b28a] bg-[#fff7ef]";
}

function getRankBadgeStyles(rank: number) {
  if (rank === 1) {
    return "bg-[#A01C33] text-white";
  }

  if (rank === 2) {
    return "bg-gray-700 text-white";
  }

  return "bg-[#c98b47] text-white";
}

function LeaderboardSkeleton() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-72 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-[24px] bg-gray-100"
              />
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-[20px] bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function JudgeLeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/judge/leaderboard", {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response
          .json()
          .catch(() => ({ success: false, message: "Failed to fetch leaderboard." }));

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch leaderboard.");
        }

        if (ignore) return;

        setData(result);
      } catch (err) {
        if (ignore) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the leaderboard."
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      ignore = true;
    };
  }, []);

  const items = data?.items ?? [];
  const topThree = data?.topThree ?? [];

  const stats = useMemo(() => {
    const totalTeams = items.length;
    const reviewedTeams = items.filter((item) => item.status === "completed").length;
    const pendingTeams = items.filter((item) => item.status === "pending").length;
    const topScore = items.length > 0 ? formatScore(items[0].averageScore) : "0";
    const topTeam = items.length > 0 ? items[0].teamName : "Not available";

    return [
      {
        title: "Ranking Status",
        value: totalTeams > 0 ? "Live" : "Empty",
        subtext:
          totalTeams > 0
            ? "Internal judge ranking data is available"
            : "No ranked submissions yet",
        icon: ShieldCheck,
      },
      {
        title: "Ranked Teams",
        value: String(totalTeams),
        subtext: "Teams currently included in ranking",
        icon: Trophy,
      },
      {
        title: "Completed Entries",
        value: String(reviewedTeams),
        subtext: "Teams with completed review status",
        icon: Medal,
      },
      {
        title: "Top Team",
        value: topTeam,
        subtext: totalTeams > 0 ? `Highest score: ${topScore}` : `Pending teams: ${pendingTeams}`,
        icon: Award,
      },
    ];
  }, [items]);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-[#A01C33]">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-bold text-[#3B3C3E]">
          Judge Leaderboard View
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500">
          View the current HackSphere rankings based on evaluated submissions.
          This is the internal judge ranking view.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">{item.title}</p>
                  <h3 className="mt-3 truncate text-2xl font-bold text-[#3B3C3E]">
                    {item.value}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.subtext}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gray-100 text-gray-500">
            <Trophy className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#3B3C3E]">
            No leaderboard entries yet
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500">
            Rankings will appear here once submissions receive evaluation data.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Top Teams</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Current podium
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {topThree.map((team) => (
                <div
                  key={team.teamId}
                  className={`rounded-[24px] border p-5 ${getRankCardStyles(team.rank)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRankBadgeStyles(
                          team.rank
                        )}`}
                      >
                        Rank #{team.rank}
                      </span>

                      <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                        {team.teamName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {team.projectTitle}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                        <span className="rounded-full bg-white px-3 py-1">
                          Score: {formatScore(team.averageScore)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          Reviews: {team.reviewsCount}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          Members: {team.membersCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#A01C33] shadow-sm">
                      <Trophy className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Full Rankings</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                All ranked submissions
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.teamId}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/20 hover:bg-white"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                          Rank #{item.rank}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                        {item.teamName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.projectTitle}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Problem: {item.problemTitle || "Not available"}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Members: {item.membersCount}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Reviews: {item.reviewsCount}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Submitted: {formatDate(item.submittedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-[120px] items-center gap-3 rounded-[20px] bg-white px-4 py-3 shadow-sm">
                      <Users className="h-5 w-5 text-[#A01C33]" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Score</p>
                        <p className="text-lg font-bold text-[#3B3C3E]">
                          {formatScore(item.averageScore)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}