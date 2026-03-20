"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Filter,
  Lightbulb,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Users,
  UserRoundPlus,
  XCircle,
} from "lucide-react";

type TeamStatus = "Active" | "Incomplete" | "Blocked";

type Team = {
  id: string;
  teamName: string;
  leader: string;
  memberCount: number;
  members: string[];
  selectedProblem: string;
  problemStatus: "Selected" | "Not Selected";
  status: TeamStatus;
  createdAt: string;
};

const teams: Team[] = [
  {
    id: "t1",
    teamName: "Code Titans",
    leader: "Prathamesh Gadhave",
    memberCount: 4,
    members: ["Prathamesh", "Aditi", "Rohit", "Sneha"],
    selectedProblem: "Smart Education Engagement Platform",
    problemStatus: "Selected",
    status: "Active",
    createdAt: "17 Mar 2026",
  },
  {
    id: "t2",
    teamName: "Vision Stack",
    leader: "Aditi Patil",
    memberCount: 3,
    members: ["Aditi", "Neha", "Omkar"],
    selectedProblem: "Digital Healthcare Support System",
    problemStatus: "Selected",
    status: "Active",
    createdAt: "17 Mar 2026",
  },
  {
    id: "t3",
    teamName: "Next Innovators",
    leader: "Rohit Jadhav",
    memberCount: 2,
    members: ["Rohit", "Sonal"],
    selectedProblem: "Not Selected",
    problemStatus: "Not Selected",
    status: "Incomplete",
    createdAt: "16 Mar 2026",
  },
  {
    id: "t4",
    teamName: "Debug Dynasty",
    leader: "Sneha More",
    memberCount: 4,
    members: ["Sneha", "Kunal", "Tanvi", "Varad"],
    selectedProblem: "Women Safety Emergency Assistant",
    problemStatus: "Selected",
    status: "Active",
    createdAt: "16 Mar 2026",
  },
  {
    id: "t5",
    teamName: "Pixel Crafters",
    leader: "Omkar Kale",
    memberCount: 1,
    members: ["Omkar"],
    selectedProblem: "Not Selected",
    problemStatus: "Not Selected",
    status: "Blocked",
    createdAt: "15 Mar 2026",
  },
];

const teamStatusStyles: Record<TeamStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Incomplete: "bg-amber-100 text-amber-700",
  Blocked: "bg-red-100 text-red-700",
};

const problemStatusStyles: Record<"Selected" | "Not Selected", string> = {
  Selected: "bg-[#A01C33]/10 text-[#A01C33]",
  "Not Selected": "bg-gray-100 text-gray-700",
};

export default function AdminTeamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.selectedProblem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.members.some((member) =>
          member.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "All" ? true : team.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: teams.length,
      active: teams.filter((t) => t.status === "Active").length,
      incomplete: teams.filter((t) => t.status === "Incomplete").length,
      blocked: teams.filter((t) => t.status === "Blocked").length,
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Team Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Manage team formation, member readiness, and problem selection.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Monitor team leaders, member counts, selected problems, and team
              health across the entire HackSphere event workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredTeams.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Teams currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Admin Scope</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Teams + Members
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Inspect team structure and challenge readiness.
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
                {stats.total}
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
              <p className="text-sm font-medium text-gray-500">Active Teams</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.active}
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
              <p className="text-sm font-medium text-gray-500">Incomplete</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.incomplete}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <UserRoundPlus className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Blocked</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.blocked}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Team Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage teams
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team, leader, member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 min-w-[180px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing <span className="font-bold text-[#3B3C3E]">{filteredTeams.length}</span> team records
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[1.4fr_1.3fr_1fr_1.9fr_1.1fr_1fr_1.2fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div>Team</div>
            <div>Leader</div>
            <div>Members</div>
            <div>Selected Problem</div>
            <div>Problem Status</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="grid grid-cols-[1.4fr_1.3fr_1fr_1.9fr_1.1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
              >
                <div className="font-semibold">{team.teamName}</div>
                <div>{team.leader}</div>
                <div>{team.memberCount}</div>
                <div className="truncate">{team.selectedProblem}</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      problemStatusStyles[team.problemStatus]
                    }`}
                  >
                    {team.problemStatus}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      teamStatusStyles[team.status]
                    }`}
                  >
                    {team.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                    View
                  </button>
                  <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#3B3C3E]">
                    {team.teamName}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Leader: {team.leader}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    teamStatusStyles[team.status]
                  }`}
                >
                  {team.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Members
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {team.memberCount}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.members.map((member) => (
                      <span
                        key={member}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Problem
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {team.selectedProblem}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        problemStatusStyles[team.problemStatus]
                      }`}
                    >
                      {team.problemStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Eye className="h-4 w-4" />
                  View Team
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Lightbulb className="h-4 w-4" />
                  Problem
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <ShieldCheck className="h-4 w-4" />
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}