"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCode2,
  Filter,
  Globe,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const assignedProjects = [
  {
    id: "code-titans",
    teamName: "Code Titans",
    projectTitle: "Smart Education Engagement Platform",
    problem: "Education",
    members: 4,
    status: "Pending Review",
    github: true,
    demo: true,
    summary:
      "A platform focused on improving classroom engagement, attendance insights, and personalized student support workflows.",
  },
  {
    id: "vision-stack",
    teamName: "Vision Stack",
    projectTitle: "Digital Healthcare Support System",
    problem: "Healthcare",
    members: 3,
    status: "Pending Review",
    github: true,
    demo: true,
    summary:
      "A healthcare access solution designed for patient assistance, digital reports, and guided support flow.",
  },
  {
    id: "next-innovators",
    teamName: "Next Innovators",
    projectTitle: "Smart City Issue Reporting",
    problem: "Smart City",
    members: 4,
    status: "In Progress",
    github: true,
    demo: false,
    summary:
      "A civic-tech reporting tool for identifying and managing public infrastructure issues efficiently.",
  },
  {
    id: "debug-dynasty",
    teamName: "Debug Dynasty",
    projectTitle: "Women Safety Emergency Assistant",
    problem: "Social Impact",
    members: 3,
    status: "Pending Review",
    github: true,
    demo: true,
    summary:
      "An emergency response and alert-based application for personal safety with quick access features.",
  },
  {
    id: "logic-loop",
    teamName: "Logic Loop",
    projectTitle: "Startup Idea Validation Assistant",
    problem: "Innovation",
    members: 2,
    status: "Reviewed",
    github: true,
    demo: true,
    summary:
      "A startup validation tool that helps users assess ideas with structured market and feasibility insights.",
  },
  {
    id: "pixel-crafters",
    teamName: "Pixel Crafters",
    projectTitle: "Green Innovation Tracker",
    problem: "Sustainability",
    members: 4,
    status: "Pending Review",
    github: true,
    demo: false,
    summary:
      "A sustainability-oriented platform for tracking green habits, environmental goals, and activity reports.",
  },
  {
    id: "byte-force",
    teamName: "Byte Force",
    projectTitle: "Disaster Response Coordination Portal",
    problem: "Public Safety",
    members: 4,
    status: "In Progress",
    github: true,
    demo: true,
    summary:
      "A centralized response tool for incident reporting, coordination, and status communication during emergencies.",
  },
  {
    id: "cloud-coders",
    teamName: "Cloud Coders",
    projectTitle: "Farmer Advisory Decision System",
    problem: "Agriculture",
    members: 3,
    status: "Pending Review",
    github: true,
    demo: true,
    summary:
      "A digital decision support solution for crop planning, advisories, and local farm-level recommendations.",
  },
  {
    id: "alpha-builders",
    teamName: "Alpha Builders",
    projectTitle: "Campus Networking Platform",
    problem: "Student Community",
    members: 4,
    status: "Reviewed",
    github: true,
    demo: true,
    summary:
      "A college social and academic networking space for students, events, and collaboration opportunities.",
  },
  {
    id: "team-nexus",
    teamName: "Team Nexus",
    projectTitle: "Mental Wellness Support Hub",
    problem: "Wellness",
    members: 3,
    status: "Pending Review",
    github: true,
    demo: false,
    summary:
      "A wellness-focused support hub with resources, routine tracking, and guided self-help tools.",
  },
  {
    id: "stack-surge",
    teamName: "Stack Surge",
    projectTitle: "Local Business Discovery Engine",
    problem: "Commerce",
    members: 4,
    status: "In Progress",
    github: true,
    demo: true,
    summary:
      "A platform helping users discover local businesses with filtering, discovery, and relevance scoring.",
  },
  {
    id: "nova-labs",
    teamName: "Nova Labs",
    projectTitle: "AI Resume Screening Assistant",
    problem: "HR Tech",
    members: 2,
    status: "Pending Review",
    github: true,
    demo: true,
    summary:
      "A smart screening assistant to help shortlist resumes and match candidate skills to job requirements.",
  },
];

const scoreCriteria = [
  "Innovation",
  "Technical Complexity",
  "UI/UX",
  "Impact",
  "Presentation",
];

const ITEMS_PER_PAGE = 6;

export default function JudgeReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = useMemo(() => {
    return assignedProjects.filter((project) => {
      const matchesSearch =
        project.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.problem.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  );

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const startItem =
    filteredProjects.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Review Queue • Assigned Project Evaluations
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Evaluate submissions, score fairly, and provide meaningful feedback.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Review only your assigned projects, assess them across the official
              HackSphere judging criteria, and submit clear, constructive comments.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90">
                Open First Review
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/judge/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Assigned Reviews</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredProjects.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Projects currently matching your view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Pages</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{totalPages}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Paginated for easier review workflow.
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
                <p className="text-sm font-medium text-[#A01C33]">Assigned Projects</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Review queue
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[240px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams or projects..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>

                <div className="relative">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="h-12 min-w-[180px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Reviewed">Reviewed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm">
              <p className="font-medium text-gray-600">
                Showing <span className="font-bold text-[#3B3C3E]">{startItem}</span>
                {" "}to{" "}
                <span className="font-bold text-[#3B3C3E]">{endItem}</span>
                {" "}of{" "}
                <span className="font-bold text-[#3B3C3E]">
                  {filteredProjects.length}
                </span>{" "}
                projects
              </p>

              <p className="font-medium text-gray-500">
                Page <span className="font-bold text-[#3B3C3E]">{currentPage}</span> of{" "}
                <span className="font-bold text-[#3B3C3E]">{totalPages}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {paginatedProjects.length === 0 ? (
              <div className="rounded-[28px] border border-gray-200 bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-[#3B3C3E]">
                  No matching projects found
                </h3>
                <p className="mt-3 text-sm text-gray-500">
                  Try changing your search or filter to see more assigned reviews.
                </p>
              </div>
            ) : (
              paginatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          project.status === "Pending Review"
                            ? "bg-amber-100 text-amber-700"
                            : project.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {project.status}
                      </span>

                      <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                        {project.projectTitle}
                      </h3>

                      <p className="mt-2 text-sm font-medium text-[#A01C33]">
                        Team: {project.teamName}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                      Problem: {project.problem}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-gray-500">
                    {project.summary}
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[20px] border border-gray-200 bg-[#fcfcfd] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Team Members
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#3B3C3E]">
                            {project.members}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-gray-200 bg-[#fcfcfd] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <FileCode2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            GitHub
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#3B3C3E]">
                            {project.github ? "Available" : "Missing"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-gray-200 bg-[#fcfcfd] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <Globe className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Demo Link
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#3B3C3E]">
                            {project.demo ? "Available" : "Missing"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-dashed border-[#A01C33]/20 bg-[#A01C33]/[0.03] p-5">
                    <p className="text-sm font-medium text-[#A01C33]">
                      Evaluation Criteria Preview
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {scoreCriteria.map((criterion) => (
                        <span
                          key={criterion}
                          className="rounded-full border border-[#A01C33]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#A01C33]"
                        >
                          {criterion}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/judge/reviews/${project.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                    >
                      Start Evaluation
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                      View Project Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredProjects.length > ITEMS_PER_PAGE && (
            <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const isActive = page === currentPage;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-11 min-w-[44px] items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${
                          isActive
                            ? "bg-[#A01C33] text-white shadow-[0_10px_20px_rgba(160,28,51,0.18)]"
                            : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33] hover:text-[#A01C33]"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Review Workflow</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              How evaluation should flow
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Open assigned project",
                  description:
                    "Start from the review queue and inspect the submission details carefully.",
                  icon: LayoutGrid,
                },
                {
                  title: "Check links and resources",
                  description:
                    "Verify repository, demo, screenshots, and other supporting materials.",
                  icon: Sparkles,
                },
                {
                  title: "Score by criteria",
                  description:
                    "Evaluate innovation, complexity, UI/UX, impact, and presentation.",
                  icon: Star,
                },
                {
                  title: "Submit final feedback",
                  description:
                    "Provide clear and constructive comments before finalizing the review.",
                  icon: ClipboardCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#3B3C3E]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Judge Guidance</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Evaluation reminders
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Only assigned submissions</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Judges should review only the projects officially assigned to them.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Be consistent</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Use the same judging standard across all projects for fairness.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">Important note</p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  Final leaderboard positions depend on judge scores, consistency,
                  and official admin publishing after the evaluation phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}