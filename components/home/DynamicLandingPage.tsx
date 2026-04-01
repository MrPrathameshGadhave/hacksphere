import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/PublicHeader";
import { getPublicHomeData } from "@/lib/public-home";
import dpgulogo from "@/app/utils/dpgu.jpeg";
import ttlogo from "@/app/utils/tt.jpeg";

const steps = [
  "Register and create your account",
  "Form a team or join through invites",
  "Pick a published problem statement",
  "Build and submit your project",
  "Get judged and follow the leaderboard",
];

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default async function DynamicLandingPage() {
  const homeData = await getPublicHomeData();

  const stats = [
    ["Participants", formatCount(homeData.stats.totalParticipants)],
    ["Teams", formatCount(homeData.stats.totalTeams)],
    ["Problems", formatCount(homeData.stats.totalProblems)],
    ["Judges", formatCount(homeData.stats.totalJudges)],
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#3B3C3E]">
      <PublicHeader />

      <div className="pointer-events-none fixed inset-0 z-[1] flex justify-center">
        <div className="relative mt-24 h-[420px] w-[420px] opacity-[0.14] md:h-[560px] md:w-[560px] lg:h-[760px] lg:w-[760px]">
          <Image
            src={dpgulogo}
            alt="DPGU background watermark"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(246,247,251,0.78),rgba(246,247,251,0.56),rgba(246,247,251,0.8))]" />

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:px-8 lg:pb-24">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#A01C33]/15 bg-white/90 px-4 py-2 text-sm font-semibold text-[#A01C33] shadow-sm backdrop-blur">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src={ttlogo}
                    alt="Tech Titans logo"
                    width={30}
                    height={30}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span>Organized by Tech Titans Technical Club of DPGU</span>
              </div>

              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-[#A01C33]">
                  Live Hackathon Platform
                </p>
                <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-[#1F2937] md:text-5xl xl:text-6xl">
                  HackSphere
                  <span className="mt-3 block text-[#A01C33]">
                    Real event data.
                  </span>
                  <span className="mt-2 block text-[#2D2E31]">
                    Real participant workflow.
                  </span>
                </h1>
              </div>

              <p className="max-w-2xl text-lg leading-8 text-[#5B6068]">
                The landing page now reflects the actual platform state, with
                live participant counts, published problem statements, recent
                announcements, and leaderboard visibility directly from the app.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#A01C33]/25 transition hover:-translate-y-0.5"
                >
                  Register Now
                </Link>
                <Link
                  href="/problem-statements"
                  className="rounded-full border border-[#D1D5DB] bg-white px-6 py-3.5 text-sm font-semibold text-[#3B3C3E] shadow-sm transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  Explore Problems
                </Link>
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                  >
                    <div className="text-3xl font-black text-[#A01C33]">
                      {value}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[#6B7280]">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div className="rounded-[34px] border border-white/80 bg-white/92 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#F8E9ED] ring-1 ring-[#A01C33]/10">
                    <Image
                      src={ttlogo}
                      alt="Tech Titans logo"
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A01C33]">
                      Platform State
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-[#202225]">
                      {homeData.platform.state}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-[#202225] p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Submission Window
                    </p>
                    <h4 className="mt-2 text-lg font-bold">
                      {homeData.platform.submissionStatus}
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-white/75">
                      {homeData.platform.submissionWindowLabel}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFD] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                      Leaderboard
                    </p>
                    <h4 className="mt-2 text-lg font-bold text-[#202225]">
                      {homeData.platform.leaderboardPublished
                        ? "Published"
                        : "Draft"}
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                      Latest update: {homeData.platform.latestAnnouncementDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-[#A01C33] to-[#7E1428] p-6 text-white shadow-[0_24px_60px_rgba(160,28,51,0.25)]">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
                  Why this matters
                </p>
                <h3 className="mt-3 text-2xl font-black">
                  The home page is no longer brochure-only.
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/80">
                  It now pulls from the same database-backed system used by the
                  participant, judge, and admin dashboards.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
                  Featured Problems
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
                  Published challenges from the platform
                </h2>
              </div>
              <Link
                href="/problem-statements"
                className="text-sm font-semibold text-[#A01C33] hover:underline"
              >
                View all problems
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {homeData.featuredProblems.length > 0 ? (
                homeData.featuredProblems.map((problem) => (
                  <Link
                    key={problem.id}
                    href={`/problem-statements/${problem.slug}`}
                    className="rounded-[28px] border border-[#EEF2F7] bg-[#FCFCFD] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#A01C33]/25 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                        {problem.category}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {problem.difficulty}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-[#202225]">
                      {problem.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                      {problem.shortDescription}
                    </p>
                    <p className="mt-5 text-sm font-semibold text-[#A01C33]">
                      {problem.teamsInterested} team(s) interested
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full rounded-[28px] border border-dashed border-gray-300 bg-[#FCFCFD] p-10 text-center text-sm text-gray-500">
                  No published problem statements are live yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[32px] bg-gradient-to-br from-[#A01C33] to-[#7E1428] p-8 text-white shadow-[0_24px_60px_rgba(160,28,51,0.25)]">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/75">
                Workflow
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                How the platform moves
              </h2>
              <div className="mt-8 space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-medium backdrop-blur-sm"
                  >
                    {index + 1}. {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/80 bg-white/95 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
                  Recent Announcements
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
                  Event communication at a glance
                </h2>

                <div className="mt-8 space-y-4">
                  {homeData.announcements.length > 0 ? (
                    homeData.announcements.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFD] p-5"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#A01C33]">
                            {item.category}
                          </span>
                          {item.pinned ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Pinned
                            </span>
                          ) : null}
                          <span className="text-xs font-medium text-gray-400">
                            {item.createdAt}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-[#202225]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                          {item.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-gray-300 bg-[#FCFCFD] p-8 text-sm text-gray-500">
                      No announcements have been posted yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/80 bg-white/95 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
                  Leaderboard Preview
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225]">
                  {homeData.platform.leaderboardPublished
                    ? "Top teams are live"
                    : "Leaderboard is still in draft"}
                </h2>

                {homeData.platform.leaderboardPublished ? (
                  <div className="mt-6 space-y-3">
                    {homeData.leaderboard.map((item) => (
                      <div
                        key={`${item.rank}-${item.teamName}`}
                        className="flex items-center justify-between gap-4 rounded-[22px] border border-[#EEF2F7] bg-[#FCFCFD] px-5 py-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#A01C33]">
                            Rank {item.rank}
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-[#202225]">
                            {item.teamName}
                          </h3>
                          <p className="text-sm text-[#6B7280]">
                            {item.projectTitle}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Score
                          </p>
                          <p className="text-xl font-black text-[#202225]">
                            {item.score.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-sm leading-7 text-[#6B7280]">
                    Rankings are computed inside the platform, but public
                    visibility will appear here only after admin publishes the
                    results.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="overflow-hidden rounded-[36px] bg-[#202225] px-8 py-12 text-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] lg:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F2B7C2]">
              Ready to Join?
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">
              Join HackSphere and move through the real event workflow.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              Register, team up, choose a challenge, submit your work, and
              track progress on the same system already powering the event.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#A01C33]/25"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
