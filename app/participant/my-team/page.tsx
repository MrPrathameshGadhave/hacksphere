import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Lightbulb,
  Mail,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const teamMembers = [
  {
    name: "Prathamesh Gadhave",
    role: "Team Leader",
    email: "prathamesh@example.com",
    initials: "PG",
    isLeader: true,
  },
  {
    name: "Member Slot Available",
    role: "Open Position",
    email: "Invite pending",
    initials: "+",
    isLeader: false,
    isEmpty: true,
  },
  {
    name: "Member Slot Available",
    role: "Open Position",
    email: "Invite pending",
    initials: "+",
    isLeader: false,
    isEmpty: true,
  },
  {
    name: "Member Slot Available",
    role: "Open Position",
    email: "Invite pending",
    initials: "+",
    isLeader: false,
    isEmpty: true,
  },
];

export default function ParticipantMyTeamPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#941a30] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Team Workspace • Powered by HackSphere
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Build your team and prepare for the hackathon.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Create a strong team, invite members, choose the right problem
              statement, and get your group ready for submission and evaluation.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90">
                <Plus className="h-4 w-4" />
                Create Team
              </button>

              <Link
                href="/participant/problems"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Explore Problems
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Team Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Solo</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                You have not completed your team yet.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Allowed Size</p>
              <h3 className="mt-2 text-2xl font-bold text-white">2 - 4 Members</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Team leader can manage invites and members.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Team Overview</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Your current team details
              </h2>
            </div>

            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c]">
              <Plus className="h-4 w-4" />
              New Team
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 lg:col-span-2">
              <p className="text-sm font-medium text-gray-500">Team Name</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                No Team Created Yet
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                Create a team to invite members and continue with problem
                selection and project submission.
              </p>
            </div>

            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm font-medium text-gray-500">Current Size</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">1 / 4</h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                You are currently the only member.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
            <p className="text-sm font-medium text-[#A01C33]">Recommended next step</p>
            <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
              Create your team first, then invite teammates before selecting a
              problem statement.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-[#A01C33]">Problem Selection</p>
          <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
            Team challenge status
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Selected Problem
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                    Not Selected
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Your team has not chosen a problem statement yet.
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>
            </div>

            <Link
              href="/participant/problems"
              className="group flex items-center justify-between rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
            >
              <div>
                <h3 className="text-base font-bold text-[#3B3C3E]">
                  Browse problem statements
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Explore all available hackathon challenges and select one for
                  your team.
                </p>
              </div>

              <ArrowRight className="h-5 w-5 text-[#A01C33] transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Team Members</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Manage your squad
              </h2>
            </div>

            <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {teamMembers.map((member) => (
              <div
                key={`${member.name}-${member.role}`}
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                      member.isEmpty
                        ? "bg-gray-100 text-gray-500"
                        : "bg-[#A01C33] text-white"
                    }`}
                  >
                    {member.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold text-[#3B3C3E]">
                        {member.name}
                      </h3>

                      {member.isLeader && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#A01C33]/10 px-2.5 py-1 text-xs font-semibold text-[#A01C33]">
                          <Crown className="h-3.5 w-3.5" />
                          Leader
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {member.role}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {member.isEmpty ? (
                        <button className="inline-flex items-center gap-2 rounded-xl bg-[#A01C33] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#89172c]">
                          <Plus className="h-3.5 w-3.5" />
                          Add Member
                        </button>
                      ) : (
                        <>
                          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            View
                          </button>

                          {!member.isLeader && (
                            <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                              <X className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-[#A01C33]">Quick Actions</p>
          <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
            Team workflow
          </h2>

          <div className="mt-6 space-y-4">
            <Link
              href="/participant/problems"
              className="group block rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-[#A01C33] transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                Choose Problem Statement
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                Select the challenge your team wants to solve.
              </p>
            </Link>

            <Link
              href="/participant/submission"
              className="group block rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-[#A01C33] transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                Go to Submission
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                Upload your final project details before the deadline.
              </p>
            </Link>
          </div>

          <div className="mt-5 rounded-[22px] border border-dashed border-gray-300 bg-[#fafafa] p-5">
            <p className="text-sm font-medium text-gray-600">Important note</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Only one team leader can manage members and complete the final
              project submission for HackSphere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}