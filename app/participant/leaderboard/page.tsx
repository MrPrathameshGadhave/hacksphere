import {
  BarChart3,
  Clock3,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const topTeams = [
  {
    rank: 1,
    team: "Code Titans",
    score: 92.5,
    problem: "Smart Education Engagement Platform",
  },
  {
    rank: 2,
    team: "Vision Stack",
    score: 89.0,
    problem: "Healthcare Support System",
  },
  {
    rank: 3,
    team: "Next Innovators",
    score: 86.5,
    problem: "Smart City Issue Reporting",
  },
];

const leaderboardRows = [
  {
    rank: 1,
    team: "Code Titans",
    members: 4,
    score: 92.5,
    status: "Published",
  },
  {
    rank: 2,
    team: "Vision Stack",
    members: 3,
    score: 89.0,
    status: "Published",
  },
  {
    rank: 3,
    team: "Next Innovators",
    members: 4,
    score: 86.5,
    status: "Published",
  },
  {
    rank: 4,
    team: "Debug Dynasty",
    members: 3,
    score: 84.0,
    status: "Published",
  },
  {
    rank: 5,
    team: "Pixel Crafters",
    members: 4,
    score: 81.5,
    status: "Published",
  },
  {
    rank: 6,
    team: "Logic Loop",
    members: 2,
    score: 79.0,
    status: "Published",
  },
];

export default function ParticipantLeaderboardPage() {
  return (
    <section className="space-y-6">
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
              <h3 className="mt-2 text-2xl font-bold text-white">Published</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Current rankings are visible to all participants.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Ranking Basis</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Judge Scores</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Final score is based on evaluation criteria and averages.
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
            {topTeams.map((team) => (
              <div
                key={team.rank}
                className={`rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-0.5 ${
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
                  {team.team}
                </h3>

                <p className="mt-2 text-sm leading-7 text-gray-500">
                  {team.problem}
                </p>

                <div className="mt-5 rounded-2xl bg-[#f8f8f9] px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Final Score
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                    {team.score}
                  </p>
                </div>
              </div>
            ))}
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
                  <h3 className="mt-1 text-2xl font-bold text-[#3B3C3E]">--</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Your team ranking will appear here once submissions are
                    reviewed and results are published.
                  </p>
                </div>
              </div>
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
                    <Clock3 className="h-5 w-5" />
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
            {leaderboardRows.map((row) => (
              <div
                key={row.rank}
                className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
              >
                <div className="font-bold text-[#A01C33]">#{row.rank}</div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{row.team}</span>
                </div>

                <div>{row.members}</div>
                <div className="font-bold">{row.score}</div>

                <div>
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}