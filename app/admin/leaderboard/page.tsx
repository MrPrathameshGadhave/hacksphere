"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  Medal,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";

type PublishState = "Draft" | "Published";

type LeaderboardTeam = {
  id: string;
  rank: number;
  teamName: string;
  projectTitle: string;
  members: number;
  finalScore: number;
  submissionTime: string;
  reviewStatus: "Completed" | "Pending";
};

const leaderboardRows: LeaderboardTeam[] = [
  {
    id: "l1",
    rank: 1,
    teamName: "Code Titans",
    projectTitle: "Smart Education Engagement Platform",
    members: 4,
    finalScore: 92.5,
    submissionTime: "17 Mar 2026, 10:20 AM",
    reviewStatus: "Completed",
  },
  {
    id: "l2",
    rank: 2,
    teamName: "Vision Stack",
    projectTitle: "Digital Healthcare Support System",
    members: 3,
    finalScore: 89.0,
    submissionTime: "17 Mar 2026, 10:42 AM",
    reviewStatus: "Completed",
  },
  {
    id: "l3",
    rank: 3,
    teamName: "Next Innovators",
    projectTitle: "Smart City Issue Reporting",
    members: 4,
    finalScore: 86.5,
    submissionTime: "17 Mar 2026, 11:05 AM",
    reviewStatus: "Completed",
  },
  {
    id: "l4",
    rank: 4,
    teamName: "Debug Dynasty",
    projectTitle: "Women Safety Emergency Assistant",
    members: 3,
    finalScore: 84.0,
    submissionTime: "17 Mar 2026, 11:20 AM",
    reviewStatus: "Completed",
  },
  {
    id: "l5",
    rank: 5,
    teamName: "Pixel Crafters",
    projectTitle: "Green Innovation Tracker",
    members: 4,
    finalScore: 81.5,
    submissionTime: "17 Mar 2026, 11:34 AM",
    reviewStatus: "Pending",
  },
  {
    id: "l6",
    rank: 6,
    teamName: "Logic Loop",
    projectTitle: "Startup Idea Validation Assistant",
    members: 2,
    finalScore: 79.0,
    submissionTime: "17 Mar 2026, 11:41 AM",
    reviewStatus: "Pending",
  },
];

export default function AdminLeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [publishState, setPublishState] = useState<PublishState>("Draft");

  const filteredRows = useMemo(() => {
    return leaderboardRows.filter((row) => {
      return (
        row.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm]);

  const stats = useMemo(() => {
    const completedReviews = leaderboardRows.filter(
      (row) => row.reviewStatus === "Completed"
    ).length;

    const highestScore = Math.max(...leaderboardRows.map((row) => row.finalScore));
    const averageScore =
      leaderboardRows.reduce((sum, row) => sum + row.finalScore, 0) /
      leaderboardRows.length;

    return {
      totalTeams: leaderboardRows.length,
      completedReviews,
      highestScore,
      averageScore: averageScore.toFixed(1),
    };
  }, []);

  const topThree = leaderboardRows.slice(0, 3);

  return (
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
              Track final scores, verify completed evaluations, inspect ranking order,
              and publish the leaderboard when the results are ready to go live.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Leaderboard State</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{publishState}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Current visibility state for participants.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Teams Ranked</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {leaderboardRows.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Final score ordering is available.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Teams</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.totalTeams}
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
                {stats.completedReviews}
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
                {stats.highestScore}
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
                {stats.averageScore}
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
            {topThree.map((team) => (
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
                  {publishState}
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Participants will only see official rankings after publishing.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setPublishState("Draft")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    publishState === "Draft"
                      ? "bg-[#A01C33] text-white"
                      : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33] hover:text-[#A01C33]"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Keep as Draft
                </button>

                <button
                  onClick={() => setPublishState("Published")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    publishState === "Published"
                      ? "bg-green-600 text-white"
                      : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-green-600 hover:text-green-700"
                  }`}
                >
                  <Send className="h-4 w-4" />
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
            {filteredRows.map((row) => (
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
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      row.reviewStatus === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {row.reviewStatus}
                  </span>
                </div>
                <ActionDropdown
  items={[
    {
      label: "View Ranking",
      onClick: () => alert(`View ${row.teamName}`),
    },
    {
      label: "Validate Score",
      onClick: () => alert(`Validate ${row.teamName}`),
    },
    {
      label: "Adjust Rank",
      onClick: () => alert(`Adjust rank for ${row.teamName}`),
    },
  ]}
/>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredRows.map((row) => (
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
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        row.reviewStatus === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
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
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Eye className="h-4 w-4" />
                  View Ranking
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <ShieldCheck className="h-4 w-4" />
                  Validate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}