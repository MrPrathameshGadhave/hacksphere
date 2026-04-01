"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Eye,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import type {
  AdminCertificateItem,
  AdminCertificateMeta,
  CertificateAwardCategory,
} from "@/lib/certificate-types";
import { formatCertificateDate } from "@/lib/certificate-types";

type CertificatesApiResponse = {
  success: boolean;
  items: AdminCertificateItem[];
  meta: AdminCertificateMeta;
  message?: string;
};

const awardFilterOptions: Array<{
  value: "all" | CertificateAwardCategory;
  label: string;
}> = [
  { value: "all", label: "All Awards" },
  { value: "champion", label: "Champion" },
  { value: "first_runner_up", label: "1st Runner-Up" },
  { value: "second_runner_up", label: "2nd Runner-Up" },
  { value: "finalist", label: "Finalist" },
  { value: "participation", label: "Participation" },
];

function calculatePercentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function formatCertificateDateTime(value?: string | null) {
  if (!value) return "Not published yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not published yet";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAwardClasses(category: CertificateAwardCategory) {
  switch (category) {
    case "champion":
      return {
        pill: "border-amber-200 bg-amber-50 text-amber-800",
        icon: Trophy,
      };
    case "first_runner_up":
      return {
        pill: "border-slate-200 bg-slate-50 text-slate-700",
        icon: Medal,
      };
    case "second_runner_up":
      return {
        pill: "border-orange-200 bg-orange-50 text-orange-700",
        icon: Award,
      };
    case "finalist":
      return {
        pill: "border-rose-200 bg-rose-50 text-rose-700",
        icon: Star,
      };
    default:
      return {
        pill: "border-blue-200 bg-blue-50 text-blue-700",
        icon: ShieldCheck,
      };
  }
}

export default function AdminCertificatesPage() {
  const [items, setItems] = useState<AdminCertificateItem[]>([]);
  const [meta, setMeta] = useState<AdminCertificateMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [awardFilter, setAwardFilter] = useState<"all" | CertificateAwardCategory>(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/certificates", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | CertificatesApiResponse
          | { success?: false; message?: string }
          | null;

        if (!response.ok || !data || !("success" in data) || !data.success) {
          throw new Error(data?.message || "Failed to fetch certificates.");
        }

        if (!mounted) return;

        setItems(Array.isArray(data.items) ? data.items : []);
        setMeta(data.meta);
      } catch (err) {
        if (!mounted) return;

        setItems([]);
        setMeta(null);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading certificates."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchCertificates();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.participantName.toLowerCase().includes(query) ||
        item.teamName.toLowerCase().includes(query) ||
        item.projectTitle.toLowerCase().includes(query) ||
        item.problemTitle.toLowerCase().includes(query);

      const matchesAward =
        awardFilter === "all" ? true : item.awardCategory === awardFilter;

      return matchesSearch && matchesAward;
    });
  }, [awardFilter, items, searchTerm]);

  const podiumCount = meta
    ? meta.countsByAward.champion +
      meta.countsByAward.first_runner_up +
      meta.countsByAward.second_runner_up
    : 0;
  const finalistCount = meta?.countsByAward.finalist ?? 0;
  const podiumShare = calculatePercentage(podiumCount, meta?.totalCertificates ?? 0);
  const finalistShare = calculatePercentage(finalistCount, meta?.totalCertificates ?? 0);
  const filteredPodiumCount = filteredItems.filter((item) =>
    [
      "champion",
      "first_runner_up",
      "second_runner_up",
    ].includes(item.awardCategory)
  ).length;
  const filteredParticipationCount = filteredItems.filter(
    (item) => item.awardCategory === "participation"
  ).length;
  const hasActiveFilters =
    searchTerm.trim().length > 0 || awardFilter !== "all";

  const openPreview = (item: AdminCertificateItem) => {
    window.open(
      `/certificates/preview/${item.teamId}/${item.userId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-[#ead7de] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f5_42%,#fff7fa_100%)] p-8 shadow-[0_20px_55px_rgba(160,28,51,0.08)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7de] bg-white/90 px-4 py-2 text-sm font-semibold text-[#9d5f6d] shadow-sm">
              <Sparkles className="h-4 w-4" />
              Certificate Studio
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-[#2e1f25] sm:text-4xl">
              Issue polished HackSphere certificates from live standings, verified teams, and official project records.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5b62] sm:text-base">
              Every certificate is built from current leaderboard position, team
              identity, participant membership, and the final event award logic,
              so admins can review and issue professional copies from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-[#ead7de] bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d5f6d]">
                  Certificates
                </p>
                <p className="mt-1 text-xl font-bold text-[#2e1f25]">
                  {loading ? "..." : meta?.totalCertificates ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ead7de] bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d5f6d]">
                  Publish State
                </p>
                <p className="mt-1 text-xl font-bold text-[#2e1f25]">
                  {loading ? "..." : meta?.publishState ?? "Draft"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ead7de] bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d5f6d]">
                  Podium Share
                </p>
                <p className="mt-1 text-xl font-bold text-[#2e1f25]">
                  {loading ? "..." : `${podiumShare}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#A01C33]">
                    Issuance Readiness
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-[#2e1f25]">
                    {loading ? "..." : meta?.publishState ?? "Draft"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {loading
                      ? "Checking certificate availability..."
                      : meta?.publishState === "Published"
                      ? `Certificates are aligned to the published standings. Official release happened on ${formatCertificateDateTime(
                          meta?.publishedAt
                        )}.`
                      : "Certificate previews are ready, but the official leaderboard is still in draft."}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500">
                    <span>Podium allocation</span>
                    <span>{loading ? "..." : `${podiumShare}%`}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f6efe4]">
                    <div
                      className="h-2 rounded-full bg-amber-500 transition-all"
                      style={{ width: `${podiumShare}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500">
                    <span>Finalist allocation</span>
                    <span>{loading ? "..." : `${finalistShare}%`}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f2e9ec]">
                    <div
                      className="h-2 rounded-full bg-[#A01C33] transition-all"
                      style={{ width: `${finalistShare}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#A01C33]">
                  Issue Date
                </p>
                <p className="mt-2 text-base font-bold text-[#2e1f25]">
                  {loading
                    ? "Loading..."
                    : meta?.issuedAt
                    ? formatCertificateDate(meta.issuedAt)
                    : "Date pending"}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Anchor date used on generated certificates.
                </p>
              </div>

              <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#A01C33]">
                  Teams Covered
                </p>
                <p className="mt-2 text-2xl font-bold text-[#2e1f25]">
                  {loading ? "..." : meta?.totalTeams ?? 0}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Distinct teams represented across the current certificate set.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {meta?.publishState === "Draft" && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          Certificate previews are live, but the leaderboard is still in draft. Final external copies should be issued after publishing official standings.
        </div>
      )}

      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Teams Covered</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : meta?.totalTeams ?? 0}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Teams represented across the current certificate roster.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Podium Awards</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : podiumCount}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Champion and runner-up certificates generated from final ranks.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Finalist Certificates</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : meta?.countsByAward.finalist ?? 0}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Participants from finalist teams recognized beyond the podium.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <Star className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Participation Certificates</p>
              <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                {loading ? "..." : meta?.countsByAward.participation ?? 0}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Remaining eligible participants receiving verified participation copies.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Certificate Records</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Search by participant, team, or project
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review the exact participant records that will receive each award,
              then open any certificate in its final print-ready preview.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search certificates..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <select
              value={awardFilter}
              onChange={(event) =>
                setAwardFilter(
                  event.target.value as "all" | CertificateAwardCategory
                )
              }
              className="h-12 min-w-[180px] rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
            >
              {awardFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setAwardFilter("all");
                }}
                className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] px-5 py-4 text-sm text-[#6f5b62]">
            Showing{" "}
            <span className="font-bold text-[#2e1f25]">{filteredItems.length}</span>{" "}
            certificate records in the current view.{" "}
            <span className="font-semibold text-[#A01C33]">
              {loading ? "..." : filteredPodiumCount}
            </span>{" "}
            belong to podium placements.
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] px-5 py-4 text-sm text-gray-500">
            <span className="font-semibold text-[#3B3C3E]">
              {loading ? "..." : filteredParticipationCount}
            </span>{" "}
            filtered records are participation certificates.
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="h-6 w-32 rounded-full bg-gray-200" />
                  <div className="mt-4 h-8 w-2/3 rounded-xl bg-gray-200" />
                  <div className="mt-3 h-5 w-1/2 rounded-lg bg-gray-200" />
                  <div className="mt-6 h-24 rounded-[22px] bg-gray-100" />
                </div>
              ))
            : filteredItems.map((item) => {
                const awardClasses = getAwardClasses(item.awardCategory);
                const AwardIcon = awardClasses.icon;

                return (
                  <div
                    key={item.id}
                    className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${awardClasses.pill}`}
                        >
                          <AwardIcon className="h-3.5 w-3.5" />
                          {item.awardLabel}
                        </span>

                        <h3 className="mt-4 text-2xl font-bold text-[#3B3C3E]">
                          {item.participantName}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-[#A01C33]">
                          {item.roleLabel} / {item.teamName}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                        Rank #{item.rank}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[22px] bg-[#f8f8f9] p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Project
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                          {item.projectTitle}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-[#f8f8f9] p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Issue Date
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                          {formatCertificateDate(item.issuedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[22px] bg-[#f8f8f9] p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Problem Statement
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                          {item.problemTitle}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-[#f8f8f9] p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Certificate No.
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                          {item.certificateNumber}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-gray-500">
                      {item.awardTitle} for <strong>{item.teamName}</strong>, based on
                      the official HackSphere standing and verified project records.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => openPreview(item)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                      >
                        <Eye className="h-4 w-4" />
                        Open Preview
                      </button>

                      <button
                        onClick={() => openPreview(item)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
                      >
                        <Sparkles className="h-4 w-4" />
                        Print / Save PDF
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>

        {!loading && filteredItems.length === 0 && (
          <div className="mt-6 rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] p-10 text-center">
            <p className="text-lg font-semibold text-[#3B3C3E]">
              No certificate records matched your search.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try changing the search text or award filter to see more results.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
