import Link from "next/link";
import {
  ArrowRight,
  Bell,
  FileCode2,
  FolderKanban,
  Lightbulb,
  Trophy,
  Users,
  ClipboardList,
  CalendarClock,
  Sparkles,
} from "lucide-react";

const stats = [
  {
    title: "Team Status",
    value: "Not Joined",
    subtext: "Create or join a team to continue",
    icon: Users,
  },
  {
    title: "Problem Selected",
    value: "0",
    subtext: "No problem statement selected yet",
    icon: Lightbulb,
  },
  {
    title: "Submission Status",
    value: "Draft",
    subtext: "Final project not submitted",
    icon: FolderKanban,
  },
  {
    title: "Leaderboard Rank",
    value: "--",
    subtext: "Will appear after publishing",
    icon: Trophy,
  },
];

const quickActions = [
  {
    title: "Create or Manage Team",
    description:
      "Start a new team, invite members, and manage your participation.",
    href: "/participant/my-team",
    icon: Users,
  },
  {
    title: "Explore Problem Statements",
    description:
      "Browse challenges and pick the best problem for your team.",
    href: "/participant/problems",
    icon: Lightbulb,
  },
  {
    title: "Submit Your Project",
    description:
      "Upload your project details, GitHub link, demo, and tech stack.",
    href: "/participant/submission",
    icon: FolderKanban,
  },
  {
    title: "Check Announcements",
    description:
      "Stay updated with notices, deadlines, and event instructions.",
    href: "/participant/announcements",
    icon: Bell,
  },
];

const announcements = [
  {
    category: "Important",
    title: "Welcome to HackSphere 2026",
    description:
      "Keep your profile updated, create your team early, and regularly check for new announcements from TechTitans.",
    time: "Today",
  },
  {
    category: "Deadline",
    title: "Problem statement selection opens soon",
    description:
      "Participants will soon be able to lock their selected problem statement from the challenges page.",
    time: "Upcoming",
  },
];

const leaderboardPreview = [
  { rank: "01", team: "Code Titans", score: "92.5" },
  { rank: "02", team: "Vision Stack", score: "89.0" },
  { rank: "03", team: "Next Innovators", score: "86.5" },
];

export default function ParticipantDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#92192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Powered by HackSphere • Organized by TechTitans
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Welcome back, Prathamesh 👋
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Manage your team, track your project progress, explore problem
              statements, and stay updated with important event announcements —
              all from one participant workspace.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/participant/my-team"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                Manage Team
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/participant/problems"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Explore Problems
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <CalendarClock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Hackathon Window
                  </p>
                  <h3 className="text-lg font-bold text-white">48 Hours</h3>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Platform Status
                  </p>
                  <h3 className="text-lg font-bold text-white">Ready to Build</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.title}</p>
                  <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                    {item.value}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.subtext}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Quick Actions</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Continue your workflow
              </h2>
            </div>

            <Link
              href="/participant/problems"
              className="hidden text-sm font-semibold text-[#A01C33] hover:underline sm:inline-block"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33] transition group-hover:bg-[#A01C33] group-hover:text-white">
                    <Icon className="h-5 w-5" />
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
          <p className="text-sm font-medium text-[#A01C33]">Submission Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
            Current project status
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[22px] border border-gray-200 bg-[#fafafa] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Title</p>
                  <h3 className="mt-1 text-lg font-bold text-[#3B3C3E]">
                    Not added yet
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <FileCode2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-gray-200 bg-[#fafafa] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Selected Problem</p>
                  <h3 className="mt-1 text-lg font-bold text-[#3B3C3E]">
                    Not selected
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
              <p className="text-sm font-medium text-[#A01C33]">
                Next recommended step
              </p>
              <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                Create your team first, then move to the problem statements page
                to select the challenge your team wants to solve.
              </p>

              <Link
                href="/participant/my-team"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
              >
                Go to My Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">
                Recent Announcements
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Stay updated
              </h2>
            </div>

            <Link
              href="/participant/announcements"
              className="text-sm font-semibold text-[#A01C33] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {announcements.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                      {item.category}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-xs font-medium text-gray-400">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">
                Leaderboard Snapshot
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Top teams
              </h2>
            </div>

            <Link
              href="/participant/leaderboard"
              className="text-sm font-semibold text-[#A01C33] hover:underline"
            >
              Full board
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {leaderboardPreview.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between rounded-[20px] border border-gray-200 bg-[#fcfcfd] px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33] text-sm font-bold text-white">
                    {item.rank}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3B3C3E]">{item.team}</h3>
                    <p className="text-sm text-gray-500">Score published</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Score
                  </p>
                  <p className="text-lg font-bold text-[#3B3C3E]">
                    {item.score}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border border-dashed border-gray-300 bg-[#fafafa] p-4">
            <p className="text-sm leading-7 text-gray-500">
              Final rankings will depend on published judge evaluations and admin
              approval.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}