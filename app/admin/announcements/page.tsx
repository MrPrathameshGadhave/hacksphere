"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Eye,
  Filter,
  Megaphone,
  PenSquare,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type AnnouncementCategory = "general" | "important" | "deadline" | "result";

type AnnouncementItem = {
  id: string;
  title: string;
  message: string;
  category: AnnouncementCategory;
  pinned: boolean;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementsResponse = {
  success: boolean;
  announcements: AnnouncementItem[];
  message?: string;
};

type AnnouncementResponse = {
  success: boolean;
  announcement: AnnouncementItem;
  message?: string;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
};

type FormMode = "create" | "edit" | "view";

type AnnouncementFormValues = {
  title: string;
  message: string;
  category: AnnouncementCategory;
  pinned: boolean;
};

const categoryStyles: Record<AnnouncementCategory, string> = {
  important:
    "border border-[#A01C33]/15 bg-[#A01C33]/8 text-[#A01C33] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  deadline:
    "border border-amber-200 bg-amber-50 text-amber-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  general:
    "border border-blue-200 bg-blue-50 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  result:
    "border border-green-200 bg-green-50 text-green-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
};

const categoryLabel: Record<AnnouncementCategory, string> = {
  important: "Important",
  deadline: "Deadline",
  general: "General",
  result: "Result",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${className}`}
    />
  );
}

function getInitialFormValues(
  announcement?: AnnouncementItem | null
): AnnouncementFormValues {
  return {
    title: announcement?.title || "",
    message: announcement?.message || "",
    category: announcement?.category || "general",
    pinned: Boolean(announcement?.pinned),
  };
}

export default function AdminAnnouncementsPage() {
  const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [pinFilter, setPinFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<FormMode>("create");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [formValues, setFormValues] = useState<AnnouncementFormValues>(
    getInitialFormValues()
  );
  const [formLoading, setFormLoading] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/announcements", {
        method: "GET",
        cache: "no-store",
      });

      const data: AnnouncementsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch announcements");
      }

      setAllAnnouncements(data.announcements || []);

      setSelectedAnnouncement((current) => {
        if (!current) return null;
        return (
          (data.announcements || []).find((item) => item.id === current.id) || null
        );
      });

      setDeleteTarget((current) => {
        if (!current) return null;
        return (
          (data.announcements || []).find((item) => item.id === current.id) || null
        );
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch announcements";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (modalOpen || deleteTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen, deleteTarget]);

  const filteredAnnouncements = useMemo(() => {
    return allAnnouncements.filter((announcement) => {
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        announcement.title.toLowerCase().includes(term) ||
        announcement.message.toLowerCase().includes(term) ||
        announcement.category.toLowerCase().includes(term) ||
        announcement.createdByName.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "All" ? true : announcement.category === categoryFilter;

      const matchesPin =
        pinFilter === "All"
          ? true
          : pinFilter === "Pinned"
          ? announcement.pinned
          : !announcement.pinned;

      return matchesSearch && matchesCategory && matchesPin;
    });
  }, [allAnnouncements, searchTerm, categoryFilter, pinFilter]);

  const stats = useMemo(() => {
    return {
      total: allAnnouncements.length,
      pinned: allAnnouncements.filter((item) => item.pinned).length,
      important: allAnnouncements.filter((item) => item.category === "important")
        .length,
      deadline: allAnnouncements.filter((item) => item.category === "deadline")
        .length,
      result: allAnnouncements.filter((item) => item.category === "result").length,
    };
  }, [allAnnouncements]);

  const openCreateModal = () => {
    setSelectedAnnouncement(null);
    setModalMode("create");
    setFormValues(getInitialFormValues());
    setModalOpen(true);
  };

  const openViewModal = (announcement: AnnouncementItem) => {
    setSelectedAnnouncement(announcement);
    setModalMode("view");
    setFormValues(getInitialFormValues(announcement));
    setModalOpen(true);
  };

  const openEditModal = (announcement: AnnouncementItem) => {
    setSelectedAnnouncement(announcement);
    setModalMode("edit");
    setFormValues(getInitialFormValues(announcement));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setTimeout(() => {
      setSelectedAnnouncement(null);
      setModalMode("create");
      setFormValues(getInitialFormValues());
    }, 150);
  };

  const handleFormSubmit = async () => {
    try {
      setFormLoading(true);
      setError("");

      const payload = {
        title: formValues.title.trim(),
        message: formValues.message.trim(),
        category: formValues.category,
        pinned: formValues.pinned,
      };

      const url =
        modalMode === "create"
          ? "/api/admin/announcements"
          : `/api/admin/announcements/${selectedAnnouncement?.id}`;

      const method = modalMode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: AnnouncementResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save announcement");
      }

      closeModal();
      await fetchAnnouncements();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save announcement";
      setError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePinToggle = async (announcement: AnnouncementItem) => {
    try {
      setActionLoadingId(announcement.id);
      setError("");

      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinned: !announcement.pinned,
        }),
      });

      const data: AnnouncementResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update pin status");
      }

      await fetchAnnouncements();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update announcement";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoadingId(deleteTarget.id);
      setError("");

      const response = await fetch(
        `/api/admin/announcements/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      const data: DeleteResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete announcement");
      }

      setDeleteTarget(null);
      await fetchAnnouncements();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete announcement";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderQuickActions = (announcement: AnnouncementItem, mobile = false) => {
    const sizeClass = mobile
      ? "px-3.5 py-2 text-sm font-medium"
      : "px-3 py-1.5 text-xs font-medium";

    return (
      <div className={`flex flex-wrap ${mobile ? "gap-2" : "gap-1.5"}`}>
        <button
          type="button"
          onClick={() => openViewModal(announcement)}
          className={`inline-flex items-center gap-2 rounded-full border border-[#A01C33]/15 bg-[#A01C33]/6 text-[#A01C33] transition hover:bg-[#A01C33]/10 ${sizeClass}`}
        >
          <Eye className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          View
        </button>

        <button
          type="button"
          onClick={() => openEditModal(announcement)}
          className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#A01C33]/25 hover:text-[#A01C33] ${sizeClass}`}
        >
          <PenSquare className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => handlePinToggle(announcement)}
          className={`inline-flex items-center gap-2 rounded-full border ${
            announcement.pinned
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#A01C33]/25 hover:text-[#A01C33]"
          } transition ${sizeClass}`}
        >
          <Pin className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          {announcement.pinned ? "Unpin" : "Pin"}
        </button>

        <button
          type="button"
          onClick={() => setDeleteTarget(announcement)}
          className={`inline-flex items-center gap-2 rounded-full border border-red-200 bg-white text-red-600 transition hover:bg-red-50 ${sizeClass}`}
        >
          <Trash2 className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
          Delete
        </button>

        {actionLoadingId === announcement.id ? (
          <span
            className={`inline-flex items-center rounded-full border border-[#A01C33]/10 bg-[#A01C33]/5 font-medium text-[#A01C33] ${
              mobile ? "px-3.5 py-2 text-sm" : "px-3 py-1.5 text-xs"
            }`}
          >
            Updating...
          </span>
        ) : null}
      </div>
    );
  };

  const renderDesktopRows = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`announcement-skeleton-${index}`}
          className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="grid grid-cols-[1.35fr_1.5fr_0.95fr_0.95fr_1.25fr] gap-5">
            {Array.from({ length: 5 }).map((__, innerIndex) => (
              <SkeletonBlock
                key={`announcement-skeleton-cell-${index}-${innerIndex}`}
                className="h-16"
              />
            ))}
          </div>
        </div>
      ));
    }

    if (filteredAnnouncements.length === 0) {
      return (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] px-5 py-14 text-center">
          <p className="text-lg font-semibold text-[#3B3C3E]">
            No announcement records found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting the search or filters.
          </p>
        </div>
      );
    }

    return filteredAnnouncements.map((announcement) => (
      <div
        key={announcement.id}
        className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
      >
        <div className="grid grid-cols-[1.35fr_1.5fr_0.95fr_0.95fr_1.25fr] gap-5">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Megaphone className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#3B3C3E]">
                  {announcement.title}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${categoryStyles[announcement.category]}`}
                  >
                    {categoryLabel[announcement.category]}
                  </span>

                  {announcement.pinned ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                      Pinned
                    </span>
                  ) : null}

                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(announcement.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Message
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#3B3C3E]">
                {announcement.message}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Created by
              </p>
              <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                {announcement.createdByName}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {announcement.createdBy?.email || "No email"}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Visibility
              </p>
              <p className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                {announcement.pinned ? "Top" : "Normal"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {announcement.pinned
                  ? "Pinned higher for participants"
                  : "Shown in standard order"}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Quick actions
              </p>
              {renderQuickActions(announcement)}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderMobileCards = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`announcement-mobile-skeleton-${index}`}
          className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm"
        >
          <SkeletonBlock className="h-6 w-1/2" />
          <SkeletonBlock className="mt-3 h-4 w-1/3" />
          <div className="mt-5 grid gap-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        </div>
      ));
    }

    if (filteredAnnouncements.length === 0) {
      return (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-8 text-center">
          <p className="text-lg font-semibold text-[#3B3C3E]">
            No announcement records found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Adjust filters and try again.
          </p>
        </div>
      );
    }

    return filteredAnnouncements.map((announcement) => (
      <div
        key={announcement.id}
        className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#3B3C3E]">
              {announcement.title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${categoryStyles[announcement.category]}`}
              >
                {categoryLabel[announcement.category]}
              </span>

              {announcement.pinned ? (
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  Pinned
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
          <p className="text-sm leading-7 text-gray-600">{announcement.message}</p>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Created by
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
              {announcement.createdByName}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {announcement.createdBy?.email || "No email"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfd] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Created at
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3B3C3E]">
              {formatDate(announcement.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-5">{renderQuickActions(announcement, true)}</div>
      </div>
    ));
  };

  return (
    <>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#A01C33] via-[#8e182e] to-[#751123] p-8 text-white shadow-[0_22px_60px_rgba(160,28,51,0.28)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                Announcement Management • Admin Control
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                Create, pin, and manage event-wide announcements.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                Control important notices, deadline alerts, general updates, and
                result communications shared across HackSphere.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">Filtered Result</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {loading ? "..." : filteredAnnouncements.length}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Announcement records visible after your current filters.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">Admin Scope</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Create + Pin
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Publish high-priority communication and keep key updates visible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.total}
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
                <p className="text-sm font-medium text-gray-500">Pinned</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.pinned}
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
                <p className="text-sm font-medium text-gray-500">Important</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.important}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Deadlines</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.deadline}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Results</p>
                <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                  {loading ? "..." : stats.result}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Announcement Records</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Search and manage notices
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white transition hover:bg-[#89172c]"
              >
                <Plus className="h-4 w-4" />
                New Announcement
              </button>

              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title, message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-12 min-w-[180px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                >
                  <option value="All">All Categories</option>
                  <option value="important">Important</option>
                  <option value="deadline">Deadline</option>
                  <option value="general">General</option>
                  <option value="result">Result</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={pinFilter}
                  onChange={(e) => setPinFilter(e.target.value)}
                  className="h-12 min-w-[170px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                >
                  <option value="All">All Visibility</option>
                  <option value="Pinned">Pinned</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3 text-sm font-medium text-gray-600">
            Showing{" "}
            <span className="font-bold text-[#3B3C3E]">
              {loading ? "..." : filteredAnnouncements.length}
            </span>{" "}
            announcement records
          </div>

          <div className="mt-6 hidden xl:block">
            <div className="grid grid-cols-[1.35fr_1.5fr_0.95fr_0.95fr_1.25fr] gap-5 px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              <div>Announcement</div>
              <div>Message</div>
              <div>Created by</div>
              <div>Visibility</div>
              <div>Actions</div>
            </div>

            <div className="space-y-3">{renderDesktopRows()}</div>
          </div>

          <div className="mt-6 grid gap-4 xl:hidden">{renderMobileCards()}</div>
        </div>
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#111827]/45 p-4 backdrop-blur-[2px]"
          onClick={closeModal}
        >
          <div className="flex min-h-full items-start justify-center py-6 sm:items-center">
            <div
              className="w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/50 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 px-6 py-5 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#A01C33]">
                      {modalMode === "create"
                        ? "Create announcement"
                        : modalMode === "edit"
                        ? "Edit announcement"
                        : "Announcement details"}
                    </p>

                    <h3 className="mt-1 truncate text-2xl font-bold text-[#3B3C3E]">
                      {modalMode === "create"
                        ? "New admin announcement"
                        : selectedAnnouncement?.title || "Announcement"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#A01C33]/20 hover:text-[#A01C33]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-6 py-6 sm:px-7">
                {modalMode === "view" && selectedAnnouncement ? (
                  <div className="grid gap-4">
                    <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[selectedAnnouncement.category]}`}
                        >
                          {categoryLabel[selectedAnnouncement.category]}
                        </span>

                        {selectedAnnouncement.pinned ? (
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Pinned
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                            Normal
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-base leading-8 text-[#3B3C3E]">
                        {selectedAnnouncement.message}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                        <div className="flex items-center gap-2 text-[#A01C33]">
                          <UserRound className="h-4 w-4" />
                          <p className="text-sm font-semibold">Created by</p>
                        </div>
                        <p className="mt-3 text-lg font-bold text-[#3B3C3E]">
                          {selectedAnnouncement.createdByName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedAnnouncement.createdBy?.email || "No email"}
                        </p>
                      </div>

                      <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5">
                        <div className="flex items-center gap-2 text-[#A01C33]">
                          <CalendarDays className="h-4 w-4" />
                          <p className="text-sm font-semibold">Created at</p>
                        </div>
                        <p className="mt-3 text-lg font-bold text-[#3B3C3E]">
                          {formatDate(selectedAnnouncement.createdAt)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Last updated {formatDate(selectedAnnouncement.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formValues.title}
                        onChange={(e) =>
                          setFormValues((current) => ({
                            ...current,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Enter announcement title"
                        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                          Category
                        </label>
                        <select
                          value={formValues.category}
                          onChange={(e) =>
                            setFormValues((current) => ({
                              ...current,
                              category: e.target.value as AnnouncementCategory,
                            }))
                          }
                          className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                        >
                          <option value="general">General</option>
                          <option value="important">Important</option>
                          <option value="deadline">Deadline</option>
                          <option value="result">Result</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                          Visibility
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setFormValues((current) => ({
                              ...current,
                              pinned: !current.pinned,
                            }))
                          }
                          className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-semibold transition ${
                            formValues.pinned
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-gray-200 bg-white text-[#3B3C3E]"
                          }`}
                        >
                          <span>{formValues.pinned ? "Pinned" : "Normal"}</span>
                          <Pin className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                        Message
                      </label>
                      <textarea
                        value={formValues.message}
                        onChange={(e) =>
                          setFormValues((current) => ({
                            ...current,
                            message: e.target.value,
                          }))
                        }
                        placeholder="Write the announcement message"
                        rows={7}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-7 text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 px-6 py-5 sm:px-7">
                {modalMode === "view" && selectedAnnouncement ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalMode("edit");
                        setFormValues(getInitialFormValues(selectedAnnouncement));
                      }}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                    >
                      <PenSquare className="h-4 w-4" />
                      Edit Announcement
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePinToggle(selectedAnnouncement)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      <Pin className="h-4 w-4" />
                      {selectedAnnouncement.pinned ? "Unpin" : "Pin"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      disabled={formLoading}
                      className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {formLoading
                        ? modalMode === "create"
                          ? "Creating..."
                          : "Saving..."
                        : modalMode === "create"
                        ? "Create Announcement"
                        : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-[2px]"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-lg rounded-[28px] border border-white/50 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#A01C33]">
                    Delete announcement
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-[#3B3C3E]">
                    Confirm deletion
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    This will permanently remove{" "}
                    <span className="font-semibold text-[#3B3C3E]">
                      {deleteTarget.title}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#A01C33]/20 hover:text-[#A01C33]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                Deleted announcements cannot be recovered from this admin screen.
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoadingId === deleteTarget.id}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {actionLoadingId === deleteTarget.id
                    ? "Deleting..."
                    : "Delete Announcement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}