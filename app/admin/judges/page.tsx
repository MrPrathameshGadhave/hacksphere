"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  Filter,
  MoreHorizontal,
  Scale,
  Search,
  ShieldCheck,
  Star,
  UserCog,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";

type JudgeStatus = "Active" | "Pending" | "Blocked";

type AssignmentStatus = "Assigned" | "Partially Assigned" | "Not Assigned";

type Judge = {
  id: string;
  name: string;
  email: string;
  institution: string;
  expertise: string;
  assignedProjects: number;
  completedReviews: number;
  assignmentStatus: AssignmentStatus;
  status: JudgeStatus;
  joinedAt: string;
};

const judges: Judge[] = [
  {
    id: "j1",
    name: "Dr. Kiran Patil",
    email: "kiran.patil@example.com",
    institution: "DYP University",
    expertise: "Web Systems",
    assignedProjects: 12,
    completedReviews: 5,
    assignmentStatus: "Assigned",
    status: "Active",
    joinedAt: "16 Mar 2026",
  },
  {
    id: "j2",
    name: "Prof. Neha Kulkarni",
    email: "neha.kulkarni@example.com",
    institution: "Tech Campus",
    expertise: "AI / Data",
    assignedProjects: 10,
    completedReviews: 7,
    assignmentStatus: "Assigned",
    status: "Active",
    joinedAt: "16 Mar 2026",
  },
  {
    id: "j3",
    name: "Mr. Omkar Shinde",
    email: "omkar.shinde@example.com",
    institution: "Innovation Hub",
    expertise: "Product Design",
    assignedProjects: 4,
    completedReviews: 1,
    assignmentStatus: "Partially Assigned",
    status: "Active",
    joinedAt: "15 Mar 2026",
  },
  {
    id: "j4",
    name: "Ms. Rutuja More",
    email: "rutuja.more@example.com",
    institution: "Startup Lab",
    expertise: "Healthcare Tech",
    assignedProjects: 0,
    completedReviews: 0,
    assignmentStatus: "Not Assigned",
    status: "Pending",
    joinedAt: "15 Mar 2026",
  },
  {
    id: "j5",
    name: "Mr. Sagar Jadhav",
    email: "sagar.jadhav@example.com",
    institution: "Tech Campus",
    expertise: "Security",
    assignedProjects: 0,
    completedReviews: 0,
    assignmentStatus: "Not Assigned",
    status: "Blocked",
    joinedAt: "14 Mar 2026",
  },
];

const judgeStatusStyles: Record<JudgeStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Blocked: "bg-red-100 text-red-700",
};

const assignmentStatusStyles: Record<AssignmentStatus, string> = {
  Assigned: "bg-[#A01C33]/10 text-[#A01C33]",
  "Partially Assigned": "bg-blue-100 text-blue-700",
  "Not Assigned": "bg-gray-100 text-gray-700",
};

export default function AdminJudgesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredJudges = useMemo(() => {
    return judges.filter((judge) => {
      const matchesSearch =
        judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judge.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judge.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judge.expertise.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : judge.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: judges.length,
      active: judges.filter((j) => j.status === "Active").length,
      pending: judges.filter((j) => j.status === "Pending").length,
      blocked: judges.filter((j) => j.status === "Blocked").length,
      assigned: judges.filter((j) => j.assignmentStatus === "Assigned").length,
      totalReviews: judges.reduce((sum, judge) => sum + judge.completedReviews, 0),
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Judge Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Manage judge accounts, assignments, and review readiness.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Monitor judge availability, track completed reviews, control access
              status, and manage project assignment health across HackSphere.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredJudges.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Judges currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Review Progress</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {stats.totalReviews}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Reviews completed by all judges so far.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Judges</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.total}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <UserCog className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned Judges</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.assigned}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserRoundCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.totalReviews}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
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
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.pending}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock3 className="h-5 w-5" />
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
            <p className="text-sm font-medium text-[#A01C33]">Judge Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage judges
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search judge, email, expertise..."
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
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing <span className="font-bold text-[#3B3C3E]">{filteredJudges.length}</span> judge records
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[1.4fr_1.8fr_1.2fr_1fr_1fr_1.2fr_1fr_1.2fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div>Name</div>
            <div>Email</div>
            <div>Expertise</div>
            <div>Assigned</div>
            <div>Reviews</div>
            <div>Assignment Status</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredJudges.map((judge) => (
              <div
                key={judge.id}
                className="grid grid-cols-[1.4fr_1.8fr_1.2fr_1fr_1fr_1.2fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
              >
                <div className="font-semibold">{judge.name}</div>
                <div className="truncate text-gray-500">{judge.email}</div>
                <div>{judge.expertise}</div>
                <div>{judge.assignedProjects}</div>
                <div>{judge.completedReviews}</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      assignmentStatusStyles[judge.assignmentStatus]
                    }`}
                  >
                    {judge.assignmentStatus}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      judgeStatusStyles[judge.status]
                    }`}
                  >
                    {judge.status}
                  </span>
                </div>
                <ActionDropdown
  items={[
    {
      label: "View Judge",
      onClick: () => alert(`View ${judge.name}`),
    },
    {
      label: "Edit Judge",
      onClick: () => alert(`Edit ${judge.name}`),
    },
    {
      label: "Assign Projects",
      onClick: () => alert(`Assign projects to ${judge.name}`),
    },
    {
      label: "Block Judge",
      onClick: () => alert(`Block ${judge.name}`),
    },
    {
      label: "Delete Judge",
      variant: "danger",
      onClick: () => alert(`Delete ${judge.name}`),
    },
  ]}
/>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredJudges.map((judge) => (
            <div
              key={judge.id}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#3B3C3E]">{judge.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{judge.email}</p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    judgeStatusStyles[judge.status]
                  }`}
                >
                  {judge.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Expertise
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {judge.expertise}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Institution
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {judge.institution}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Assigned Projects
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {judge.assignedProjects}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Completed Reviews
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {judge.completedReviews}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    assignmentStatusStyles[judge.assignmentStatus]
                  }`}
                >
                  {judge.assignmentStatus}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Eye className="h-4 w-4" />
                  View Judge
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Scale className="h-4 w-4" />
                  Assign
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <ShieldCheck className="h-4 w-4" />
                  Manage
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