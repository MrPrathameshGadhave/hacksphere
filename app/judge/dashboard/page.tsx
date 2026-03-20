import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FileSearch,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

const stats = [
  {
    title: "Assigned Projects",
    value: "12",
    subtext: "Projects allocated for your review",
    icon: FileSearch,
  },
  {
    title: "Completed Reviews",
    value: "4",
    subtext: "Reviews submitted successfully",
    icon: ClipboardCheck,
  },
  {
    title: "Pending Reviews",
    value: "8",
    subtext: "Still waiting for evaluation",
    icon: ShieldCheck,
  },
  {
    title: "Leaderboard Status",
    value: "Draft",
    subtext: "Results not published yet",
    icon: Trophy,
  },
];

const pendingReviews = [
  {
    team: "Code Titans",
    project: "Smart Education Engagement Platform",
    status: "Pending",
  },
  {
    team: "Vision Stack",
    project: "Healthcare Support System",
    status: "Pending",
  },
  {
    team: "Next Innovators",
    project: "Smart City Issue Reporting",
    status: "Pending",
  },
];

export default function JudgeDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Judge Dashboard • Official Review Panel
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Welcome to your judging workspace.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Review assigned projects, score them across the judging criteria,
              provide constructive feedback, and help shape the final HackSphere rankings.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/judge/reviews"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                Start Reviewing
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/judge/leaderboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                View Leaderboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Judge Role</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Active Reviewer</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                You can review only assigned submissions.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Evaluation Model</p>
              <h3 className="mt-2 text-2xl font-bold text-white">5 Criteria</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Innovation, complexity, UI/UX, impact, presentation.
              </p>
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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Pending Reviews</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Assigned projects awaiting evaluation
              </h2>
            </div>

            <Link
              href="/judge/reviews"
              className="text-sm font-semibold text-[#A01C33] hover:underline"
            >
              Open review queue
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {pendingReviews.map((item) => (
              <div
                key={item.team}
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {item.status}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                      {item.team}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-gray-500">
                      {item.project}
                    </p>
                  </div>

                  <Link
                    href="/judge/reviews"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                  >
                    Review Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Judging Criteria</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Scoring structure
            </h2>

            <div className="mt-6 space-y-3">
              {[
                "Innovation",
                "Technical Complexity",
                "UI/UX",
                "Impact",
                "Presentation",
              ].map((criterion) => (
                <div
                  key={criterion}
                  className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3 text-sm font-semibold text-[#3B3C3E]"
                >
                  {criterion}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Judge Guidance</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Review reminders
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Be constructive</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Feedback should help teams understand strengths and improvements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Score consistently</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Apply the same standard across all assigned submissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">Important note</p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  Only assigned projects should be reviewed, and each submission
                  should be evaluated once per judge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}