"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock3,
  History,
  Search,
  ShieldCheck,
  Target,
  UserCog,
} from "lucide-react";

type AuditLogItem = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetLabel: string;
  details: Record<string, unknown>;
  createdAt: string | null;
  actor: {
    id: string;
    name: string;
    email: string;
  };
};

type AuditLogResponse = {
  success: boolean;
  total: number;
  items: AuditLogItem[];
  message?: string;
};

function formatActionLabel(action: string) {
  return action
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDetailValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return String(value);
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [targetFilter, setTargetFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function loadAuditLogs() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/audit-logs?limit=100", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | AuditLogResponse
          | { success?: false; message?: string }
          | null;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok || !data || !("success" in data) || !data.success) {
          throw new Error(
            data && "message" in data
              ? data.message || "Failed to fetch audit logs."
              : "Failed to fetch audit logs."
          );
        }

        if (!isMounted) return;

        setLogs(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error ? err.message : "Failed to fetch audit logs."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const targetTypes = useMemo(() => {
    const values = Array.from(new Set(logs.map((log) => log.targetType).filter(Boolean)));
    return ["All", ...values];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesTarget =
        targetFilter === "All" ? true : log.targetType === targetFilter;

      const haystack = [
        log.action,
        log.targetType,
        log.targetLabel,
        log.actor.name,
        log.actor.email,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(searchTerm.toLowerCase());

      return matchesTarget && matchesSearch;
    });
  }, [logs, searchTerm, targetFilter]);

  const stats = useMemo(() => {
    return {
      approvals: logs.filter((log) => log.action.includes("approve")).length,
      assignments: logs.filter((log) => log.action.includes("assign")).length,
      publication: logs.filter(
        (log) =>
          log.action.includes("leaderboard") || log.action.includes("submission")
      ).length,
    };
  }, [logs]);

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Audit Trail • Admin Oversight
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Track who changed what across approvals, assignments, and publishing.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              This log captures key admin actions so the platform stays traceable,
              reviewable, and easier to debug when workflows change.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Visible Logs</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {loading ? "..." : filteredLogs.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Records matching the current filters.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Coverage</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Assignments, approvals, and publishing
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Recent admin actions are stored here for traceability.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Entries</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : logs.length}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <History className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Approval Actions</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : stats.approvals}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Assignments</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : stats.assignments}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserCog className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Submission & Publish Actions
              </p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : stats.publication}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Audit Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search and inspect recent admin activity
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search action, admin, target..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <select
              value={targetFilter}
              onChange={(event) => setTargetFilter(event.target.value)}
              className="h-12 min-w-[190px] rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
            >
              {targetTypes.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All targets" : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f8f8f9] px-4 py-3 text-sm font-medium text-gray-600">
          Showing{" "}
          <span className="font-bold text-[#3B3C3E]">
            {loading ? "..." : filteredLogs.length}
          </span>{" "}
          audit entries
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
              >
                <div className="h-5 w-40 animate-pulse rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 w-72 animate-pulse rounded-lg bg-gray-200" />
                <div className="mt-4 h-20 animate-pulse rounded-2xl bg-gray-100" />
              </div>
            ))
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const detailEntries = Object.entries(log.details || {}).slice(0, 4);

              return (
                <div
                  key={log.id}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
                          {formatActionLabel(log.action)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                          {log.targetType || "system"}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                        {log.targetLabel || "Platform action"}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-gray-500">
                        {log.actor.name} ({log.actor.email || "No email"}) performed
                        this action on {formatDateTime(log.createdAt)}.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#3B3C3E]">
                        <Clock3 className="h-4 w-4 text-[#A01C33]" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                  </div>

                  {detailEntries.length > 0 ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {detailEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            {key}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                            {formatDetailValue(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                      No additional metadata was recorded for this action.
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-[24px] border border-dashed border-gray-300 bg-[#fafafa] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                No audit logs found
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                Try adjusting the search or target filters to inspect a broader set of
                admin activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
