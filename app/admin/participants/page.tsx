"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  SquareUserRound,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";
type ParticipantStatus = "Approved" | "Pending" | "Blocked";

type Participant = {
  id: string;
  name: string;
  email: string;
  college: string;
  team: string;
  status: ParticipantStatus;
  joinedAt: string;
};

const participants: Participant[] = [
  {
    id: "p1",
    name: "Prathamesh Gadhave",
    email: "prathamesh@example.com",
    college: "DYP University",
    team: "Code Titans",
    status: "Approved",
    joinedAt: "17 Mar 2026",
  },
  {
    id: "p2",
    name: "Aditi Patil",
    email: "aditi@example.com",
    college: "DYP University",
    team: "Vision Stack",
    status: "Approved",
    joinedAt: "17 Mar 2026",
  },
  {
    id: "p3",
    name: "Rohit Jadhav",
    email: "rohit@example.com",
    college: "DYP University",
    team: "Not Assigned",
    status: "Pending",
    joinedAt: "16 Mar 2026",
  },
  {
    id: "p4",
    name: "Sneha More",
    email: "sneha@example.com",
    college: "DYP University",
    team: "Debug Dynasty",
    status: "Approved",
    joinedAt: "16 Mar 2026",
  },
  {
    id: "p5",
    name: "Omkar Kale",
    email: "omkar@example.com",
    college: "Tech Campus",
    team: "Not Assigned",
    status: "Blocked",
    joinedAt: "15 Mar 2026",
  },
  {
    id: "p6",
    name: "Neha Shinde",
    email: "neha@example.com",
    college: "Tech Campus",
    team: "Next Innovators",
    status: "Pending",
    joinedAt: "15 Mar 2026",
  },
];

const statusStyles: Record<ParticipantStatus, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Blocked: "bg-red-100 text-red-700",
};

export default function AdminParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const matchesSearch =
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.team.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : participant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: participants.length,
      approved: participants.filter((p) => p.status === "Approved").length,
      pending: participants.filter((p) => p.status === "Pending").length,
      blocked: participants.filter((p) => p.status === "Blocked").length,
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Participant Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Manage registrations, approvals, and participant activity.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Review participant records, monitor approval status, track team
              association, and take action on individual accounts from one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredParticipants.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Participants currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Admin Actions</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Approve / Block</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Manage access and participation readiness.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Participants</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">{stats.total}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <SquareUserRound className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">{stats.approved}</h3>
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
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">{stats.pending}</h3>
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
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">{stats.blocked}</h3>
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
            <p className="text-sm font-medium text-[#A01C33]">Participant Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage accounts
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, team..."
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
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing <span className="font-bold text-[#3B3C3E]">{filteredParticipants.length}</span> participant records
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div>Name</div>
            <div>Email</div>
            <div>College</div>
            <div>Team</div>
            <div>Status</div>
            <div>Joined</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className="grid grid-cols-[1.6fr_1.9fr_1.4fr_1.2fr_1.1fr_1fr_1.2fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
              >
                <div className="font-semibold">{participant.name}</div>
                <div className="truncate text-gray-500">{participant.email}</div>
                <div>{participant.college}</div>
                <div>{participant.team}</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[participant.status]}`}
                  >
                    {participant.status}
                  </span>
                </div>
                <div>{participant.joinedAt}</div>
                <div className="flex items-center gap-2">
  <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
    View
  </button>

  <ActionDropdown
    items={[
      {
        label: "Edit Participant",
        onClick: () => alert(`Edit ${participant.name}`),
      },
      {
        label: "Approve",
        onClick: () => alert(`Approve ${participant.name}`),
      },
      {
        label: "Block",
        onClick: () => alert(`Block ${participant.name}`),
      },
      {
        label: "Delete",
        variant: "danger",
        onClick: () => alert(`Delete ${participant.name}`),
      },
    ]}
  />
</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredParticipants.map((participant) => (
            <div
              key={participant.id}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#3B3C3E]">
                    {participant.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span className="break-all">{participant.email}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[participant.status]}`}
                >
                  {participant.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    College
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {participant.college}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Team
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {participant.team}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Joined
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {participant.joinedAt}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100">
                  <UserCheck className="h-4 w-4" />
                  Approve
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100">
                  <UserX className="h-4 w-4" />
                  Block
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <ShieldCheck className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}