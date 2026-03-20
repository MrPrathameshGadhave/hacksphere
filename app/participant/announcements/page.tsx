import {
  Bell,
  CalendarClock,
  ChevronRight,
  Megaphone,
  Pin,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";

const announcements = [
  {
    id: 1,
    category: "Important",
    title: "Welcome to HackSphere 2026",
    message:
      "HackSphere is now live. Complete your profile, create your team, and start exploring the problem statements shared by TechTitans.",
    date: "Today",
    pinned: true,
  },
  {
    id: 2,
    category: "Deadline",
    title: "Team formation window closes soon",
    message:
      "Participants are advised to finalize team members before problem selection begins. Team leader access will control key actions.",
    date: "Upcoming",
    pinned: false,
  },
  {
    id: 3,
    category: "General",
    title: "Submission guidelines will be released shortly",
    message:
      "Project title, description, GitHub link, demo link, tech stack, and optional PPT/video links will be required during submission.",
    date: "Upcoming",
    pinned: false,
  },
  {
    id: 4,
    category: "Results",
    title: "Leaderboard will be published after judge evaluations",
    message:
      "Final rankings will be visible only after admin review and official publishing of scores.",
    date: "Later",
    pinned: false,
  },
];

const categoryStyles: Record<string, string> = {
  Important: "bg-[#A01C33]/10 text-[#A01C33]",
  Deadline: "bg-amber-100 text-amber-700",
  General: "bg-blue-100 text-blue-700",
  Results: "bg-green-100 text-green-700",
};

export default function ParticipantAnnouncementsPage() {
  const pinnedAnnouncement = announcements.find((item) => item.pinned);
  const regularAnnouncements = announcements.filter((item) => !item.pinned);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Announcements • Official TechTitans Updates
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Stay updated with every important event notice and deadline.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Follow official updates, hackathon instructions, schedule alerts,
              submission notices, and result announcements published by the
              organizing team.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Total Updates</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {announcements.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Active participant-facing notices available.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Pinned Notice</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {pinnedAnnouncement ? "1 Active" : "None"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Pinned notices contain high-priority instructions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">
                  Announcement Feed
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Latest official updates
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[240px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>

                <button className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  All Categories
                </button>
              </div>
            </div>
          </div>

          {pinnedAnnouncement && (
            <div className="rounded-[28px] border border-[#A01C33]/15 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33] text-white shadow-sm">
                    <Pin className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                      Pinned Announcement
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                      {pinnedAnnouncement.title}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500">
                      {pinnedAnnouncement.message}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                  {pinnedAnnouncement.date}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="space-y-4">
              {regularAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:-translate-y-0.5 hover:border-[#A01C33]/20 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                        <Megaphone className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            categoryStyles[item.category] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.category}
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-gray-500">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                      {item.date}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33] transition group-hover:gap-3">
                      View details
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Update Types</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              What to watch for
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Important</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Core instructions and crucial notices from TechTitans.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Deadlines</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Team formation, submission, and schedule-related alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Results</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Score publication and leaderboard result updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Participant Reminder</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Stay in sync
            </h2>

            <div className="mt-6 rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-[#3B3C3E]">
                    Check announcements regularly
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Missing a deadline or instruction can affect team workflow,
                    problem selection, or final submission readiness.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-[#3B3C3E]">
                    Best practice
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Review updates before working on team setup, problem locking,
                    and final project submission.
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