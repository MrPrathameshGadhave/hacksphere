import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  Medal,
  ShieldCheck,
  Sparkles,
  SquareUserRound,
  Target,
  UserCog,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Participants",
    value: "248",
    subtext: "Registered students",
    icon: SquareUserRound,
  },
  {
    title: "Total Teams",
    value: "76",
    subtext: "Created teams in system",
    icon: Users,
  },
  {
    title: "Total Judges",
    value: "12",
    subtext: "Authorized review members",
    icon: UserCog,
  },
  {
    title: "Total Submissions",
    value: "41",
    subtext: "Project submissions received",
    icon: ClipboardList,
  },
  {
    title: "Pending Reviews",
    value: "19",
    subtext: "Still awaiting evaluation",
    icon: ShieldCheck,
  },
  {
    title: "Announcements",
    value: "08",
    subtext: "Published event notices",
    icon: Bell,
  },
];

const quickActions = [
  {
    title: "Manage Participants",
    description: "Review registered users and monitor participant activity.",
    href: "/admin/participants",
    icon: SquareUserRound,
  },
  {
    title: "Manage Teams",
    description: "Track team creation, member counts, and team health.",
    href: "/admin/teams",
    icon: Users,
  },
  {
    title: "Manage Judges",
    description: "Control judge accounts and evaluation readiness.",
    href: "/admin/judges",
    icon: UserCog,
  },
  {
    title: "Problem Statements",
    description: "Create and update challenge statements for the hackathon.",
    href: "/admin/problems",
    icon: Target,
  },
  {
    title: "Submissions",
    description: "Inspect submitted projects and submission status.",
    href: "/admin/submissions",
    icon: ClipboardList,
  },
  {
    title: "Publish Leaderboard",
    description: "Finalize rankings and make official results visible.",
    href: "/admin/leaderboard",
    icon: Medal,
  },
];

const recentActivity = [
  {
    title: "New participant registrations increased",
    meta: "12 new users added today",
  },
  {
    title: "3 new project submissions received",
    meta: "Submission queue updated recently",
  },
  {
    title: "Judge reviews are currently in progress",
    meta: "Pending reviews still open",
  },
];

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Admin Dashboard • Event Control Center
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Manage the entire HackSphere event from one command center.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Oversee participants, teams, judges, submissions, problem
              statements, announcements, and leaderboard publishing across the
              full hackathon lifecycle.
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
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Platform State</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Live</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Event operations are active and trackable.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Admin Scope</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Full Control</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Manage every core workflow of the hackathon.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
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

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Recent Activity</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Event movement
            </h2>

            <div className="mt-6 space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <h3 className="font-bold text-[#3B3C3E]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Admin Reminder</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Publishing discipline
            </h2>

            <div className="mt-6 rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
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
                    the final leaderboard and result announcements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}