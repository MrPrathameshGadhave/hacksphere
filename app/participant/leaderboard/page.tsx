"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Clock,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

type BasicUser = {
  _id: string;
  name: string;
  email: string;
  college?: string;
  avatar?: string;
  role?: "participant" | "judge" | "admin";
  isApproved?: boolean;
};

type TeamProblemPreview = {
  id?: string;
  _id?: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  category?: string;
  difficulty?: string;
};

type TeamData = {
  _id: string;
  teamName: string;
  teamDescription?: string;
  leader: BasicUser;
  members: BasicUser[];
  maxSize: number;
  problemStatement: TeamProblemPreview | null;
  status: "active" | "pending" | "disqualified";
};

type AuthMeResponse = {
  success: boolean;
  user: BasicUser;
  message?: string;
};

type MyTeamResponse = {
  success: boolean;
  team: TeamData | null;
  message?: string;
};

type RawLeaderboardItem = {
  _id?: string;
  rank?: number;
  team?: {
    _id?: string;
    id?: string;
    teamName?: string;
    leader?: BasicUser;
    members?: BasicUser[];
    problemStatement?: {
      title?: string;
    } | null;
  };
  teamId?: string;
  teamName?: string;
  members?: number;
  membersCount?: number;
  score?: number;
  totalScore?: number;
  averageScore?: number;
  status?: string;
  published?: boolean;
  problem?: string;
  problemTitle?: string;
};

type LeaderboardResponse = {
  success: boolean;
  leaderboard?: RawLeaderboardItem[];
  rankings?: RawLeaderboardItem[];
  results?: RawLeaderboardItem[];
  published?: boolean;
  isPublished?: boolean;
  status?: string;
  message?: string;
};

type LeaderboardRow = {
  rank: number;
  teamId: string;
  teamName: string;
  members: number;
  score: number;
  status: string;
  problem: string;
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

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getRawLeaderboardRows(payload: LeaderboardResponse) {
  if (Array.isArray(payload.leaderboard)) return payload.leaderboard;
  if (Array.isArray(payload.rankings)) return payload.rankings;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function normalizeLeaderboardRows(rawRows: RawLeaderboardItem[]) {
  return rawRows
    .map((item, index): LeaderboardRow => {
      const teamId = String(item.team?._id || item.team?.id || item.teamId || "");
      const teamName = String(
        item.team?.teamName || item.teamName || "Untitled Team"
      );

      const membersFromTeam =
        Array.isArray(item.team?.members)
          ? item.team.members.length + (item.team?.leader ? 1 : 0)
          : 0;

      const members =
        normalizeNumber(item.membersCount, 0) ||
        normalizeNumber(item.members, 0) ||
        membersFromTeam ||
        0;

      const score =
        normalizeNumber(item.score, NaN) ||
        normalizeNumber(item.totalScore, NaN) ||
        normalizeNumber(item.averageScore, 0);

      const problem = String(
        item.team?.problemStatement?.title ||
          item.problemTitle ||
          item.problem ||
          "Problem not available"
      );

      const publishedStatus =
        typeof item.published === "boolean"
          ? item.published
            ? "Published"
            : "Hidden"
          : "Published";

      return {
        rank: normalizeNumber(item.rank, index + 1),
        teamId,
        teamName,
        members,
        score,
        status: item.status || publishedStatus,
        problem,
      };
    })
    .sort((a, b) => a.rank - b.rank);
}

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

export default function ParticipantLeaderboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<BasicUser | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const [me, myTeam, leaderboardRes] = await Promise.all([
          fetchJson<AuthMeResponse>("/api/auth/me"),
          fetchJson<MyTeamResponse>("/api/teams/my-team"),
          fetchJson<LeaderboardResponse>("/api/leaderboard"),
        ]);

        if (!isMounted) return;

        const normalizedRows = normalizeLeaderboardRows(
          getRawLeaderboardRows(leaderboardRes)
        );

        const published =
          typeof leaderboardRes.published === "boolean"
            ? leaderboardRes.published
            : typeof leaderboardRes.isPublished === "boolean"
            ? leaderboardRes.isPublished
            : normalizedRows.length > 0;

        setUser(me.user);
        setTeam(myTeam.team);
        setRows(normalizedRows);
        setIsPublished(published);
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

  const topTeams = useMemo(() => rows.slice(0, 3), [rows]);

  const myTeamRank = useMemo(() => {
    if (!team) return null;

    return (
      rows.find(
        (row) =>
          row.teamId === team._id ||
          row.teamName.trim().toLowerCase() === team.teamName.trim().toLowerCase()
      ) || null
    );
  }, [rows, team]);

  const leaderboardStatusLabel = isPublished ? "Published" : "Not Published";
  const rankingBasisLabel = rows.length > 0 ? "Judge Scores" : "Awaiting Scores";

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Leaderboard • Official Published Rankings
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Track rankings, team performance, and final published scores.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              The leaderboard reflects team rankings based on judge evaluations,
              final score calculation, and official publishing by the HackSphere
              admin team.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Leaderboard Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "..." : leaderboardStatusLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {loading
                  ? "Checking leaderboard visibility..."
                  : isPublished
                  ? "Current rankings are visible to all participants."
                  : "Rankings are not published yet."}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Ranking Basis</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "..." : rankingBasisLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {loading
                  ? "Checking score details..."
                  : "Final score is based on evaluation criteria and averages."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Top Teams</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Podium highlights
              </h2>
            </div>

            <div className="hidden rounded-2xl bg-[#A01C33]/10 px-4 py-2 text-sm font-semibold text-[#A01C33] sm:block">
              Final Rankings
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <SkeletonBlock className="h-14 w-14 rounded-2xl" />
                    <SkeletonBlock className="h-11 w-11 rounded-2xl" />
                  </div>
                  <SkeletonBlock className="mt-5 h-7 w-40" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-5/6" />
                  <SkeletonBlock className="mt-5 h-20 w-full rounded-2xl" />
                </div>
              ))
            ) : topTeams.length > 0 ? (
              topTeams.map((teamItem) => (
                <div
                  key={`${teamItem.teamId}-${teamItem.rank}`}
                  className={`rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                    teamItem.rank === 1
                      ? "border-[#A01C33]/20 bg-gradient-to-b from-[#fff7f8] to-white"
                      : "border-gray-200 bg-[#fcfcfd]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold ${
                        teamItem.rank === 1
                          ? "bg-[#A01C33] text-white"
                          : "bg-[#A01C33]/10 text-[#A01C33]"
                      }`}
                    >
                      #{teamItem.rank}
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Medal className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#3B3C3E]">
                    {teamItem.teamName}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    {teamItem.problem}
                  </p>

                  <div className="mt-5 rounded-2xl bg-[#f8f8f9] px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Final Score
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                      {formatScore(teamItem.score)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-3 rounded-[24px] border border-dashed border-gray-300 bg-[#fafafa] p-8 text-center">
                <h3 className="text-lg font-bold text-[#3B3C3E]">
                  No published rankings yet
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Top team standings will appear here once the leaderboard is published.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Your Team Status</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Ranking summary
            </h2>

            <div className="mt-6 rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#A01C33]">
                    Current rank
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                    {loading
                      ? "..."
                      : myTeamRank
                      ? `#${myTeamRank.rank}`
                      : "--"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    {loading
                      ? "Checking your team ranking..."
                      : !team
                      ? "Create or join a team to track your ranking once results are published."
                      : myTeamRank
                      ? `Your team "${myTeamRank.teamName}" currently has a score of ${formatScore(
                          myTeamRank.score
                        )}.`
                      : "Your team ranking will appear here once submissions are reviewed and results are published."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm font-medium text-[#A01C33]">Signed in as</p>
              <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                {loading ? "Loading..." : user?.name || "Participant"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                {loading
                  ? "Checking your session..."
                  : "You are viewing the live participant leaderboard."}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">How Ranking Works</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Score logic
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Average judge score</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Final ranking is based on averaged evaluation totals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Tie-break rule</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Earlier valid submission time can rank higher in case of ties.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Admin publishing</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Rankings become visible only after official admin publish.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Leaderboard Table</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Full ranking overview
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33]/10 px-4 py-2 text-sm font-semibold text-[#A01C33]">
            <Sparkles className="h-4 w-4" />
            Official Results Snapshot
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-gray-200">
          <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1.2fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div>Rank</div>
            <div>Team</div>
            <div>Members</div>
            <div>Score</div>
            <div>Status</div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4"
                >
                  <SkeletonBlock className="h-6 w-10" />
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-10 w-10 rounded-2xl" />
                    <SkeletonBlock className="h-6 w-40" />
                  </div>
                  <SkeletonBlock className="h-6 w-10" />
                  <SkeletonBlock className="h-6 w-16" />
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                </div>
              ))
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <div
                  key={`${row.teamId}-${row.rank}`}
                  className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
                >
                  <div className="font-bold text-[#A01C33]">#{row.rank}</div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">{row.teamName}</span>
                  </div>

                  <div>{row.members}</div>
                  <div className="font-bold">{formatScore(row.score)}</div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status.toLowerCase() === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white px-5 py-10 text-center">
                <h3 className="text-lg font-bold text-[#3B3C3E]">
                  No leaderboard data available
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Rankings will appear here once evaluations are completed and results are published.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}