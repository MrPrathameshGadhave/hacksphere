"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileCode2,
  Filter,
  FolderKanban,
  Globe,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";

type SubmissionStatus = "Draft" | "Submitted" | "Reviewed" | "Locked";
type ReviewStatus = "Pending" | "In Progress" | "Completed";

type Submission = {
  id: string;
  teamName: string;
  projectTitle: string;
  leader: string;
  memberCount: number;
  selectedProblem: string;
  githubLink: boolean;
  demoLink: boolean;
  submissionStatus: SubmissionStatus;
  reviewStatus: ReviewStatus;
  submittedAt: string;
};

const submissions: Submission[] = [
  {
    id: "s1",
    teamName: "Code Titans",
    projectTitle: "Smart Education Engagement Platform",
    leader: "Prathamesh Gadhave",
    memberCount: 4,
    selectedProblem: "Education",
    githubLink: true,
    demoLink: true,
    submissionStatus: "Submitted",
    reviewStatus: "In Progress",
    submittedAt: "17 Mar 2026",
  },
  {
    id: "s2",
    teamName: "Vision Stack",
    projectTitle: "Digital Healthcare Support System",
    leader: "Aditi Patil",
    memberCount: 3,
    selectedProblem: "Healthcare",
    githubLink: true,
    demoLink: true,
    submissionStatus: "Reviewed",
    reviewStatus: "Completed",
    submittedAt: "17 Mar 2026",
  },
  {
    id: "s3",
    teamName: "Next Innovators",
    projectTitle: "Smart City Issue Reporting",
    leader: "Rohit Jadhav",
    memberCount: 2,
    selectedProblem: "Smart City",
    githubLink: true,
    demoLink: false,
    submissionStatus: "Draft",
    reviewStatus: "Pending",
    submittedAt: "16 Mar 2026",
  },
  {
    id: "s4",
    teamName: "Debug Dynasty",
    projectTitle: "Women Safety Emergency Assistant",
    leader: "Sneha More",
    memberCount: 4,
    selectedProblem: "Social Impact",
    githubLink: true,
    demoLink: true,
    submissionStatus: "Submitted",
    reviewStatus: "Pending",
    submittedAt: "16 Mar 2026",
  },
  {
    id: "s5",
    teamName: "Pixel Crafters",
    projectTitle: "Green Innovation Tracker",
    leader: "Omkar Kale",
    memberCount: 1,
    selectedProblem: "Sustainability",
    githubLink: false,
    demoLink: false,
    submissionStatus: "Locked",
    reviewStatus: "Pending",
    submittedAt: "15 Mar 2026",
  },
];

const submissionStatusStyles: Record<SubmissionStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-[#A01C33]/10 text-[#A01C33]",
  Reviewed: "bg-green-100 text-green-700",
  Locked: "bg-red-100 text-red-700",
};

const reviewStatusStyles: Record<ReviewStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

export default function AdminSubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("All");

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesSearch =
        submission.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.selectedProblem.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        submissionFilter === "All"
          ? true
          : submission.submissionStatus === submissionFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, submissionFilter]);

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      submitted: submissions.filter((s) => s.submissionStatus === "Submitted")
        .length,
      reviewed: submissions.filter((s) => s.submissionStatus === "Reviewed")
        .length,
      draft: submissions.filter((s) => s.submissionStatus === "Draft").length,
      locked: submissions.filter((s) => s.submissionStatus === "Locked").length,
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Submission Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Track submitted projects, review progress, and submission health.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Monitor project records, inspect team submissions, verify review
              progress, and manage final submission states across HackSphere.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredSubmissions.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Submission records currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Admin Scope</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Review + Locking
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Supervise final submission lifecycle and review state.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.total}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Submitted</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.submitted}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Reviewed</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.reviewed}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <Star className="h-5 w-5" />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
              <FileCode2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Locked</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.locked}
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
            <p className="text-sm font-medium text-[#A01C33]">Submission Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage submissions
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team, project, leader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
                className="h-12 min-w-[180px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing{" "}
          <span className="font-bold text-[#3B3C3E]">
            {filteredSubmissions.length}
          </span>{" "}
          submission records
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[1.2fr_1.7fr_1.2fr_1fr_1fr_1fr_1.1fr_1.1fr_1fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div>Team</div>
            <div>Project</div>
            <div>Leader</div>
            <div>Members</div>
            <div>Problem</div>
            <div>Resources</div>
            <div>Submission</div>
            <div>Review</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="grid grid-cols-[1.2fr_1.7fr_1.2fr_1fr_1fr_1fr_1.1fr_1.1fr_1fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
              >
                <div className="font-semibold">{submission.teamName}</div>
                <div className="truncate">{submission.projectTitle}</div>
                <div>{submission.leader}</div>
                <div>{submission.memberCount}</div>
                <div>{submission.selectedProblem}</div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      submission.githubLink
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    GitHub
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      submission.demoLink
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Demo
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      submissionStatusStyles[submission.submissionStatus]
                    }`}
                  >
                    {submission.submissionStatus}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      reviewStatusStyles[submission.reviewStatus]
                    }`}
                  >
                    {submission.reviewStatus}
                  </span>
                </div>
                <ActionDropdown
  items={[
    {
      label: "View Submission",
      onClick: () => alert(`View ${submission.projectTitle}`),
    },
    {
      label: "Assign Judge",
      onClick: () => alert(`Assign judge for ${submission.projectTitle}`),
    },
    {
      label: "Lock Submission",
      onClick: () => alert(`Lock ${submission.projectTitle}`),
    },
    {
      label: "Mark Invalid",
      onClick: () => alert(`Mark invalid ${submission.projectTitle}`),
    },
    {
      label: "Delete Submission",
      variant: "danger",
      onClick: () => alert(`Delete ${submission.projectTitle}`),
    },
  ]}
/>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#3B3C3E]">
                    {submission.projectTitle}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Team: {submission.teamName}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    submissionStatusStyles[submission.submissionStatus]
                  }`}
                >
                  {submission.submissionStatus}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Team Leader
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {submission.leader}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Members
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {submission.memberCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Problem
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {submission.selectedProblem}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Review Status
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        reviewStatusStyles[submission.reviewStatus]
                      }`}
                    >
                      {submission.reviewStatus}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Resources
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        submission.githubLink
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      GitHub
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        submission.demoLink
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Globe className="mr-1 h-3.5 w-3.5" />
                      Demo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Eye className="h-4 w-4" />
                  View Submission
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Users className="h-4 w-4" />
                  Team
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Star className="h-4 w-4" />
                  Reviews
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}