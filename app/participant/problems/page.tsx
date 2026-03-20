import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  Filter,
  Gauge,
  Globe,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const problems = [
  {
    id: "smart-education-platform",
    title: "Smart Education Engagement Platform",
    shortDescription:
      "Build a platform that improves student engagement, attendance tracking, and personalized learning support.",
    category: "Education",
    difficulty: "Medium",
    technologies: ["Next.js", "AI", "Analytics"],
    status: "Open",
    icon: BookOpenText,
  },
  {
    id: "healthcare-support-system",
    title: "Digital Healthcare Support System",
    shortDescription:
      "Create a healthcare-focused solution for patient support, appointment flow, medical tracking, or digital report access.",
    category: "Healthcare",
    difficulty: "Hard",
    technologies: ["Web App", "Cloud", "Database"],
    status: "Open",
    icon: ShieldCheck,
  },
  {
    id: "smart-city-reporting",
    title: "Smart City Issue Reporting",
    shortDescription:
      "Develop a civic-tech product that allows citizens to report infrastructure and public service issues efficiently.",
    category: "Smart City",
    difficulty: "Medium",
    technologies: ["Maps", "Dashboard", "Mobile Friendly"],
    status: "Open",
    icon: Globe,
  },
  {
    id: "green-innovation-tracker",
    title: "Green Innovation & Sustainability Tracker",
    shortDescription:
      "Design a system that helps track sustainability goals, energy awareness, or environmental reporting workflows.",
    category: "Sustainability",
    difficulty: "Easy",
    technologies: ["Dashboard", "Reports", "Visualization"],
    status: "Open",
    icon: Sparkles,
  },
  {
    id: "women-safety-alert",
    title: "Women Safety & Emergency Assistance App",
    shortDescription:
      "Create a practical safety solution with alerting, location assistance, emergency contacts, and quick actions.",
    category: "Social Impact",
    difficulty: "Hard",
    technologies: ["Realtime", "Location", "Notifications"],
    status: "Open",
    icon: Target,
  },
  {
    id: "startup-idea-validator",
    title: "Startup Idea Validation Assistant",
    shortDescription:
      "Build a tool that helps student founders validate business ideas through market insights, scoring, and structured feedback.",
    category: "Innovation",
    difficulty: "Medium",
    technologies: ["AI", "Forms", "Insights"],
    status: "Open",
    icon: Brain,
  },
];

export default function ParticipantProblemsPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Problem Statements • HackSphere Challenge Arena
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Explore challenges and choose the right problem for your team.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Browse curated problem statements, understand difficulty and scope,
              and align your team around a challenge that matches your skills,
              creativity, and impact goals.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90">
                View All Problems
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/participant/my-team"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Back to Team
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Current Selection</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Not Selected</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Your team has not locked a problem yet.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Available Challenges</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {problems.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Carefully review before making a final selection.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Browse Problems</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Search and filter challenge statements
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or category..."
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                />
              </div>

              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-2">
            {problems.map((problem) => {
              const Icon = problem.icon;

              return (
                <div
                  key={problem.id}
                  className="group rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:-translate-y-0.5 hover:border-[#A01C33]/25 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {problem.status}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold leading-7 text-[#3B3C3E]">
                    {problem.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-500">
                    {problem.shortDescription}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                      {problem.category}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {problem.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/participant/projects/${problem.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                    >
                      View Details
                    </Link>

                    <button className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c]">
                      Select Problem
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Selection Guide</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              How to choose wisely
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Match your strengths</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Choose a problem your team can realistically execute well.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Aim for impact</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Strong ideas solve meaningful problems clearly and practically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Balance innovation</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Pick something creative, but still achievable within 48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Current Team Status</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Before selecting a problem
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <p className="text-sm font-medium text-gray-500">Team Readiness</p>
                <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                  Team not finalized
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  It is better to finalize your teammates before locking the challenge.
                </p>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">Recommended next step</p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  Confirm your team members first, then select one problem statement
                  together based on your combined strengths.
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
      </div>
    </section>
  );
}