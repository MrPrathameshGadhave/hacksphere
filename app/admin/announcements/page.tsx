"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Eye,
  Filter,
  Megaphone,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";

type AnnouncementCategory = "Important" | "Deadline" | "General" | "Results";
type PublishStatus = "Published" | "Draft" | "Archived";

type Announcement = {
  id: string;
  title: string;
  message: string;
  category: AnnouncementCategory;
  pinned: boolean;
  publishStatus: PublishStatus;
  createdBy: string;
  createdAt: string;
};

const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Welcome to HackSphere 2026",
    message:
      "HackSphere is now live. Participants should complete profile setup, team creation, and problem exploration.",
    category: "Important",
    pinned: true,
    publishStatus: "Published",
    createdBy: "Admin Team",
    createdAt: "17 Mar 2026",
  },
  {
    id: "a2",
    title: "Team formation window closes soon",
    message:
      "Participants are advised to finalize team members before moving to the problem selection phase.",
    category: "Deadline",
    pinned: true,
    publishStatus: "Published",
    createdBy: "TechTitans",
    createdAt: "17 Mar 2026",
  },
  {
    id: "a3",
    title: "Submission guidelines draft prepared",
    message:
      "Project title, description, GitHub link, demo link, and supporting resources will be required during submission.",
    category: "General",
    pinned: false,
    publishStatus: "Draft",
    createdBy: "Admin Team",
    createdAt: "16 Mar 2026",
  },
  {
    id: "a4",
    title: "Leaderboard publication process",
    message:
      "Final rankings will be released after all assigned judge evaluations are completed and verified.",
    category: "Results",
    pinned: false,
    publishStatus: "Published",
    createdBy: "Admin Team",
    createdAt: "16 Mar 2026",
  },
  {
    id: "a5",
    title: "Old internal note",
    message:
      "This archived note is no longer visible to participants and remains stored for admin reference.",
    category: "General",
    pinned: false,
    publishStatus: "Archived",
    createdBy: "Organizer",
    createdAt: "15 Mar 2026",
  },
];

const categoryStyles: Record<AnnouncementCategory, string> = {
  Important: "bg-[#A01C33]/10 text-[#A01C33]",
  Deadline: "bg-amber-100 text-amber-700",
  General: "bg-blue-100 text-blue-700",
  Results: "bg-green-100 text-green-700",
};

const publishStatusStyles: Record<PublishStatus, string> = {
  Published: "bg-green-100 text-green-700",
  Draft: "bg-blue-100 text-blue-700",
  Archived: "bg-gray-100 text-gray-700",
};

export default function AdminAnnouncementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All"
          ? true
          : announcement.publishStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      published: announcements.filter((a) => a.publishStatus === "Published").length,
      drafts: announcements.filter((a) => a.publishStatus === "Draft").length,
      pinned: announcements.filter((a) => a.pinned).length,
      archived: announcements.filter((a) => a.publishStatus === "Archived").length,
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Announcement Management • Admin Control
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Create, publish, pin, and manage event-wide announcements.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Control important notices, deadline alerts, general updates, and
              result communications shared with HackSphere participants.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Filtered Result</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredAnnouncements.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Announcements currently visible in this view.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Admin Action</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Create / Publish
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Manage lifecycle from draft to published notice.
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
              <Bell className="h-5 w-5" />
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
              <p className="text-sm font-medium text-gray-500">Drafts</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.drafts}
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
              <p className="text-sm font-medium text-gray-500">Pinned</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {stats.pinned}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Pin className="h-5 w-5" />
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
            <p className="text-sm font-medium text-[#A01C33]">Announcement Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and manage notices
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-4 text-sm font-semibold text-white transition hover:bg-[#89172c]">
              <Plus className="h-4 w-4" />
              New Announcement
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
          Showing{" "}
          <span className="font-bold text-[#3B3C3E]">
            {filteredAnnouncements.length}
          </span>{" "}
          announcement records
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-gray-200 xl:block">
          <div className="grid grid-cols-[1.6fr_2.2fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-[#f8f8f9] px-5 py-4 text-sm font-semibold text-[#3B3C3E]">
            <div>Title</div>
            <div>Message</div>
            <div>Category</div>
            <div>Pinned</div>
            <div>Status</div>
            <div>Created By</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="grid grid-cols-[1.6fr_2.2fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-white px-5 py-4 text-sm text-[#3B3C3E] transition hover:bg-[#fcfcfd]"
              >
                <div className="font-semibold">{announcement.title}</div>

                <div className="line-clamp-2 text-gray-500">
                  {announcement.message}
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      categoryStyles[announcement.category]
                    }`}
                  >
                    {announcement.category}
                  </span>
                </div>

                <div>
                  {announcement.pinned ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Pinned
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      Normal
                    </span>
                  )}
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      publishStatusStyles[announcement.publishStatus]
                    }`}
                  >
                    {announcement.publishStatus}
                  </span>
                </div>

                <div>{announcement.createdBy}</div>

                <ActionDropdown
  items={[
    {
      label: "View Announcement",
      onClick: () => alert(`View ${announcement.title}`),
    },
    {
      label: "Edit Announcement",
      onClick: () => alert(`Edit ${announcement.title}`),
    },
    {
      label: "Pin / Unpin",
      onClick: () => alert(`Toggle pin for ${announcement.title}`),
    },
    {
      label: "Archive",
      onClick: () => alert(`Archive ${announcement.title}`),
    },
    {
      label: "Delete Announcement",
      variant: "danger",
      onClick: () => alert(`Delete ${announcement.title}`),
    },
  ]}
/>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#3B3C3E]">
                    {announcement.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {announcement.message}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    publishStatusStyles[announcement.publishStatus]
                  }`}
                >
                  {announcement.publishStatus}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Category
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        categoryStyles[announcement.category]
                      }`}
                    >
                      {announcement.category}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Pin Status
                  </p>
                  <div className="mt-1">
                    {announcement.pinned ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pinned
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        Normal
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Created By
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {announcement.createdBy}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Created At
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
                    {announcement.createdAt}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Eye className="h-4 w-4" />
                  View Notice
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Megaphone className="h-4 w-4" />
                  Edit
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  <Pin className="h-4 w-4" />
                  Pin / Unpin
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}