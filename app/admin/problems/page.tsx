"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Filter,
  Layers3,
  Lightbulb,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";

type ProblemStatus = "Published" | "Draft" | "Archived";
type ProblemDifficulty = "Easy" | "Medium" | "Hard";

type Problem = {
  id: string;
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  shortDescription: string;
  suggestedTechnologies: string[];
  teamsInterested: number;
  createdAt: string;
};

const problems: Problem[] = [
  {
    id: "p1",
    title: "Smart Education Engagement Platform",
    category: "Education",
    difficulty: "Medium",
    status: "Published",
    shortDescription:
      "Build a platform that improves student engagement, attendance tracking, and personalized learning support.",
    suggestedTechnologies: ["Next.js", "AI", "Analytics"],
    teamsInterested: 14,
    createdAt: "17 Mar 2026",
  },
  {
    id: "p2",
    title: "Digital Healthcare Support System",
    category: "Healthcare",
    difficulty: "Hard",
    status: "Published",
    shortDescription:
      "Create a solution for patient support, digital records access, or medical service coordination.",
    suggestedTechnologies: ["Cloud", "Database", "Web App"],
    teamsInterested: 11,
    createdAt: "17 Mar 2026",
  },
  {
    id: "p3",
    title: "Smart City Issue Reporting",
    category: "Smart City",
    difficulty: "Medium",
    status: "Published",
    shortDescription:
      "Design a platform for reporting, tracking, and resolving public infrastructure issues.",
    suggestedTechnologies: ["Maps", "Dashboard", "Mobile UI"],
    teamsInterested: 9,
    createdAt: "16 Mar 2026",
  },
  {
    id: "p4",
    title: "Women Safety Emergency Assistant",
    category: "Social Impact",
    difficulty: "Hard",
    status: "Draft",
    shortDescription:
      "Build an emergency-focused safety assistant with alerting and fast-access support features.",
    suggestedTechnologies: ["Realtime", "Location", "Notifications"],
    teamsInterested: 0,
    createdAt: "16 Mar 2026",
  },
  {
    id: "p5",
    title: "Green Innovation Tracker",
    category: "Sustainability",
    difficulty: "Easy",
    status: "Archived",
    shortDescription:
      "Create a sustainability tracking tool for habits, goals, and impact visibility.",
    suggestedTechnologies: ["Dashboard", "Reports", "Charts"],
    teamsInterested: 3,
    createdAt: "15 Mar 2026",
  },
];

const difficultyStyles: Record<ProblemDifficulty, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const statusStyles: Record<ProblemStatus, string> = {
  Published: "bg-[#A01C33]/10 text-[#A01C33]",
  Draft: "bg-blue-100 text-blue-700",
  Archived: "bg-gray-100 text-gray-700",
};

export default function AdminProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : problem.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: problems.length,
      published: problems.filter((p) => p.status === "Published").length,
      draft: problems.filter((p) => p.status === "Draft").length,
      archived: problems.filter((p) => p.status === "Archived").length,
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Problem Statement Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Create, organize, and manage challenge statements for HackSphere.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Control categories, difficulty levels, visibility, and publishing
              state of all problem statements used in the hackathon.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredProblems.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Problem statements currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Admin Action</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Create / Publish
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Manage problem lifecycle from draft to published state.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Problems</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.total}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Published</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.published}
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
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.draft}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Archived</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.archived}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Problem Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage statements
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-4 text-sm font-semibold text-white transition hover:bg-[#89172c]">
              <Plus className="h-4 w-4" />
              Add Problem
            </button>

            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search title, category..."
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
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing <span className="font-bold text-[#3B3C3E]">{filteredProblems.length}</span> problem records
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1.4fr_1fr_1.1fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div>Title</div>
            <div>Category</div>
            <div>Difficulty</div>
            <div>Status</div>
            <div>Suggested Tech</div>
            <div>Interested Teams</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1.4fr_1fr_1.1fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
              >
                <div>
                  <p className="font-semibold">{problem.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {problem.shortDescription}
                  </p>
                </div>

                <div>{problem.category}</div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      difficultyStyles[problem.difficulty]
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[problem.status]
                    }`}
                  >
                    {problem.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {problem.suggestedTechnologies.slice(0, 2).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div>{problem.teamsInterested}</div>

                <ActionDropdown
  items={[
    {
      label: "View Problem",
      onClick: () => alert(`View ${problem.title}`),
    },
    {
      label: "Edit Problem",
      onClick: () => alert(`Edit ${problem.title}`),
    },
    {
      label: "Publish / Unpublish",
      onClick: () => alert(`Toggle publish for ${problem.title}`),
    },
    {
      label: "Archive Problem",
      onClick: () => alert(`Archive ${problem.title}`),
    },
    {
      label: "Delete Problem",
      variant: "danger",
      onClick: () => alert(`Delete ${problem.title}`),
    },
  ]}
/>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#3B3C3E]">
                    {problem.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {problem.shortDescription}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[problem.status]
                  }`}
                >
                  {problem.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {problem.category}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Difficulty
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        difficultyStyles[problem.difficulty]
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Suggested Technologies
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {problem.suggestedTechnologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Interested Teams
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {problem.teamsInterested}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Eye className="h-4 w-4" />
                  View Problem
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Lightbulb className="h-4 w-4" />
                  Edit
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Target className="h-4 w-4" />
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