"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  Medal,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Loader2,
  X,
  Scale,
  RefreshCcw,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";

type PublishState = "Draft" | "Published";

type LeaderboardRow = {
  id: string;
  rank: number;
  teamId: string;
  submissionId: string;
  teamName: string;
  projectTitle: string;
  problemTitle: string;
  members: number;
  finalScore: number;
  reviewsCount: number;
  assignedJudges: number;
  pendingJudges: number;
  reviewStatus: "Completed" | "Pending";
  submissionTime: string;
  submittedAtRaw: string | null;
  scoreBreakdown: {
    innovation: number;
    technicalComplexity: number;
    uiUx: number;
    impact: number;
    presentation: number;
  };
};

type LeaderboardApiResponse = {
  success: boolean;
  publishState: PublishState;
  publishedAt: string | null;
  rows: LeaderboardRow[];
  stats: {
    totalTeams: number;
    completedReviews: number;
    highestScore: number;
    averageScore: string;
  };
  topThree: LeaderboardRow[];
  message?: string;
};

const reviewStatusStyles = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
};

function RankingDetailModal({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: LeaderboardRow | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !row) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/45 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[calc(100vh-40px)] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/15 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 sm:px-7">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Ranking Details</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              {row.teamName}
            </h2>
            <p className="mt-2 text-sm text-gray-500">{row.projectTitle}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 sm:px-7">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Rank</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                #{row.rank}
              </h3>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Final Score</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                {row.finalScore}
              </h3>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Reviews Count</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                {row.reviewsCount}
              </h3>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Pending Judges</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                {row.pendingJudges}
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-[#A01C33]">Project Summary</p>
              <h3 className="mt-1 text-xl font-bold text-[#3B3C3E]">
                {row.projectTitle}
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f8f8f9] px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Team
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                    {row.teamName}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8f8f9] px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Problem
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                    {row.problemTitle}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8f8f9] px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Members
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                    {row.members}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8f8f9] px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Submission Time
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                    {row.submissionTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-[#A01C33]">Score Breakdown</p>
              <h3 className="mt-1 text-xl font-bold text-[#3B3C3E]">
                Average criterion scores
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  ["Innovation", row.scoreBreakdown.innovation],
                  [
                    "Technical Complexity",
                    row.scoreBreakdown.technicalComplexity,
                  ],
                  ["UI/UX", row.scoreBreakdown.uiUx],
                  ["Impact", row.scoreBreakdown.impact],
                  ["Presentation", row.scoreBreakdown.presentation],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-[#3B3C3E]">
                        {label}
                      </p>
                      <span className="rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                        {value} / 10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
            <p className="text-sm font-medium text-[#A01C33]">Ranking logic</p>
            <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
              Rank is calculated automatically from submitted judge evaluations.
              Higher average score ranks above lower average score. Ties are
              resolved by review count and earlier submission time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [publishState, setPublishState] = useState<PublishState>("Draft");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [topThree, setTopThree] = useState<LeaderboardRow[]>([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    completedReviews: 0,
    highestScore: 0,
    averageScore: "0.0",
  });
  const [loading, setLoading] = useState(true);
  const [publishLoading, setPublishLoading] = useState(false);
  const [error, setError] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [selectedRow, setSelectedRow] = useState<LeaderboardRow | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/leaderboard", {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | LeaderboardApiResponse
        | { success?: false; message?: string }
        | null;

      if (!response.ok || !data || !("success" in data) || !data.success) {
        throw new Error(
          data && "message" in data
            ? data.message || "Failed to fetch leaderboard."
            : "Failed to fetch leaderboard."
        );
      }

      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTopThree(Array.isArray(data.topThree) ? data.topThree : []);
      setStats(data.stats);
      setPublishState(data.publishState);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch leaderboard."
      );
      setRows([]);
      setTopThree([]);
      setStats({
        totalTeams: 0,
        completedReviews: 0,
        highestScore: 0,
        averageScore: "0.0",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeaderboard();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return (
        row.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.problemTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [rows, searchTerm]);

  const handlePublishStateChange = async (nextState: PublishState) => {
    try {
      setPublishLoading(true);
      setError("");
      setBannerMessage("");

      const response = await fetch("/api/admin/leaderboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publishState: nextState,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string; publishState?: PublishState }
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update leaderboard state.");
      }

      setPublishState(data.publishState || nextState);
      setBannerMessage(
        data.message ||
          (nextState === "Published"
            ? "Leaderboard published successfully."
            : "Leaderboard moved back to draft.")
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update leaderboard state."
      );
    } finally {
      setPublishLoading(false);
    }
  };

  const handleAdjustRank = (row: LeaderboardRow) => {
    setBannerMessage(
      `${row.teamName} rank is derived automatically from submitted judge evaluations. Adjust scores through judge reviews instead of editing rank manually.`
    );
  };

  return (
    <>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                Leaderboard Management • Admin Control
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                Review rankings, validate scores, and publish the official leaderboard.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                Track real evaluation averages, verify completed judging coverage,
                inspect ranking order, and publish the leaderboard when results are ready.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">Leaderboard State</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {loading ? "—" : publishState}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Current visibility state for participants.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">Teams Ranked</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {loading ? "—" : rows.length}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Score-based ranking order is available.
                </p>
              </div>
            </div>
          </div>
        </div>

        {(error || bannerMessage) && (
          <div
            className={`rounded-[24px] border px-5 py-4 text-sm font-medium ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || bannerMessage}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Teams</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.totalTeams}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.completedReviews}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Highest Score</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.highestScore}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.averageScore}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Top Rankings</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Podium snapshot
                </h2>
              </div>

              <div className="rounded-2xl bg-[#A01C33]/10 px-4 py-2 text-sm font-semibold text-[#A01C33]">
                Live Preview
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {(loading ? [] : topThree).map((team) => (
                <div
                  key={team.id}
                  className={`rounded-[24px] border p-5 shadow-sm ${
                    team.rank === 1
                      ? "border-[#A01C33]/20 bg-gradient-to-b from-[#fff7f8] to-white"
                      : "border-gray-200 bg-[#fcfcfd]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold ${
                        team.rank === 1
                          ? "bg-[#A01C33] text-white"
                          : "bg-[#A01C33]/10 text-[#A01C33]"
                      }`}
                    >
                      #{team.rank}
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Medal className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#3B3C3E]">
                    {team.teamName}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    {team.projectTitle}
                  </p>

                  <div className="mt-5 rounded-2xl bg-[#f8f8f9] px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Final Score
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                      {team.finalScore}
                    </p>
                  </div>
                </div>
              ))}

              {!loading && topThree.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-6 text-center md:col-span-3">
                  <p className="text-sm font-medium text-[#3B3C3E]">
                    No ranked teams yet.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Rankings will appear here when submissions receive judge evaluations.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-sm font-medium text-[#A01C33]">Publish Controls</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Leaderboard visibility
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                  <p className="text-sm font-medium text-gray-500">Current State</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                    {loading ? "Loading..." : publishState}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Participants will only see official rankings after publishing.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handlePublishStateChange("Draft")}
                    disabled={publishLoading}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                      publishState === "Draft"
                        ? "bg-[#A01C33] text-white"
                        : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33] hover:text-[#A01C33]"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {publishLoading && publishState !== "Draft" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Keep as Draft
                  </button>

                  <button
                    onClick={() => handlePublishStateChange("Published")}
                    disabled={publishLoading}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                      publishState === "Published"
                        ? "bg-green-600 text-white"
                        : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-green-600 hover:text-green-700"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {publishLoading && publishState !== "Published" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Publish Now
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-sm font-medium text-[#A01C33]">Admin Reminder</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Before publishing
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Verify review completion",
                    description:
                      "Make sure all required judge evaluations are finished.",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Check score consistency",
                    description:
                      "Validate that ranking order reflects the final averaged scores.",
                    icon: Star,
                  },
                  {
                    title: "Confirm public readiness",
                    description:
                      "Publish only when results are ready for participants to see.",
                    icon: Sparkles,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#3B3C3E]">{item.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Ranking Records</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Search and review leaderboard rows
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                />
              </div>

              <button
                onClick={fetchLeaderboard}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
            Showing{" "}
            <span className="font-bold text-[#3B3C3E]">{filteredRows.length}</span>{" "}
            ranking records
          </div>

          <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
            <div className="grid grid-cols-[0.8fr_1.4fr_1.8fr_1fr_1fr_1.5fr_1fr_1fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
              <div>Rank</div>
              <div>Team</div>
              <div>Project</div>
              <div>Members</div>
              <div>Score</div>
              <div>Submission Time</div>
              <div>Review</div>
              <div>Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {(loading ? [] : filteredRows).map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[0.8fr_1.4fr_1.8fr_1fr_1fr_1.5fr_1fr_1fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
                >
                  <div className="font-bold text-[#A01C33]">#{row.rank}</div>
                  <div className="font-semibold">{row.teamName}</div>
                  <div className="truncate">{row.projectTitle}</div>
                  <div>{row.members}</div>
                  <div className="font-bold">{row.finalScore}</div>
                  <div>{row.submissionTime}</div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${reviewStatusStyles[row.reviewStatus]}`}
                    >
                      {row.reviewStatus}
                    </span>
                  </div>
                  <ActionDropdown
                    items={[
                      {
                        label: "View Ranking",
                        onClick: () => setSelectedRow(row),
                      },
                      {
                        label: "Validate Score",
                        onClick: () => setSelectedRow(row),
                      },
                      {
                        label: "Adjust Rank",
                        onClick: () => handleAdjustRank(row),
                      },
                    ]}
                  />
                </div>
              ))}

              {!loading && filteredRows.length === 0 && (
                <div className="bg-white px-5 py-10 text-center">
                  <p className="text-lg font-semibold text-[#3B3C3E]">
                    No ranking records found
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Try changing the search or wait for judge evaluations to finish.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:hidden">
            {(loading ? [] : filteredRows).map((row) => (
              <div
                key={row.id}
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                      Rank #{row.rank}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                      {row.teamName}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{row.projectTitle}</p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Score
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#3B3C3E]">
                      {row.finalScore}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Members
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {row.members}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Review
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${reviewStatusStyles[row.reviewStatus]}`}
                      >
                        {row.reviewStatus}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Submission Time
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                      {row.submissionTime}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRow(row)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                  >
                    <Eye className="h-4 w-4" />
                    View Ranking
                  </button>

                  <button
                    onClick={() => setSelectedRow(row)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                  >
                    <Scale className="h-4 w-4" />
                    Validate
                  </button>
                </div>
              </div>
            ))}

            {!loading && filteredRows.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-8 text-center">
                <p className="text-lg font-semibold text-[#3B3C3E]">
                  No ranking records found
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Adjust the search or wait for submitted evaluations.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <RankingDetailModal
        open={Boolean(selectedRow)}
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </>
  );
}