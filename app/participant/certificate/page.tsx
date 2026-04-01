"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer, RefreshCcw, ShieldCheck } from "lucide-react";
import CertificateCanvas from "@/components/certificates/CertificateCanvas";
import type { AdminCertificateItem, AdminCertificateMeta } from "@/lib/certificate-types";

type ParticipantCertificateResponse = {
  success: boolean;
  published: boolean;
  available: boolean;
  item: AdminCertificateItem | null;
  meta: AdminCertificateMeta | null;
  message?: string;
};

function ParticipantCertificatePageFallback() {
  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#f9e4bb_0%,#f6f0e1_22%,#f3f5f8_100%)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1320px] animate-pulse rounded-[36px] border border-gray-200 bg-white p-10 shadow-sm">
        <div className="h-12 w-56 rounded-2xl bg-gray-200" />
        <div className="mt-8 h-14 w-2/3 rounded-2xl bg-gray-200" />
        <div className="mt-5 h-32 rounded-[28px] bg-gray-100" />
        <div className="mt-6 h-72 rounded-[32px] bg-gray-100" />
      </div>
    </section>
  );
}

function ParticipantCertificatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoDownload = searchParams.get("download") === "1";

  const [item, setItem] = useState<AdminCertificateItem | null>(null);
  const [meta, setMeta] = useState<AdminCertificateMeta | null>(null);
  const [published, setPublished] = useState(false);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasAutoPrinted, setHasAutoPrinted] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchCertificate = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response = await fetch("/api/participant/certificate", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | ParticipantCertificateResponse
          | { success?: false; message?: string }
          | null;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok || !data || !("success" in data) || !data.success) {
          throw new Error(data?.message || "Failed to load certificate.");
        }

        if (!mounted) return;

        setPublished(Boolean(data.published));
        setAvailable(Boolean(data.available));
        setItem(data.item || null);
        setMeta(data.meta || null);
        setMessage(data.message || "");
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your certificate."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchCertificate();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (
      autoDownload &&
      published &&
      available &&
      item &&
      !loading &&
      !hasAutoPrinted
    ) {
      const timeoutId = window.setTimeout(() => {
        window.print();
        setHasAutoPrinted(true);
      }, 300);

      return () => window.clearTimeout(timeoutId);
    }
  }, [autoDownload, available, hasAutoPrinted, item, loading, published]);

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }

        @media print {
          body {
            background: #ffffff !important;
          }

          .certificate-print-hidden {
            display: none !important;
          }

          .certificate-print-shell {
            padding: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      <section className="certificate-print-shell min-h-screen bg-[radial-gradient(circle_at_top,#f9e4bb_0%,#f6f0e1_22%,#f3f5f8_100%)] px-4 py-6 sm:px-6 lg:px-10">
        <div className="certificate-print-hidden mx-auto mb-6 flex max-w-[1320px] flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#8d1730]/10 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">My Certificate</p>
            <h1 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Download your HackSphere certificate
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              This certificate becomes downloadable only after the official leaderboard results are published.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/participant/profile"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>

            <button
              onClick={() => window.print()}
              disabled={!published || !available || !item || loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {!error && message && (
          <div
            className={`certificate-print-hidden mx-auto mb-6 max-w-[1320px] rounded-[22px] px-5 py-4 text-sm font-medium ${
              published && available
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="mx-auto max-w-[1320px] animate-pulse rounded-[36px] border border-gray-200 bg-white p-10 shadow-sm">
            <div className="h-12 w-56 rounded-2xl bg-gray-200" />
            <div className="mt-8 h-14 w-2/3 rounded-2xl bg-gray-200" />
            <div className="mt-5 h-32 rounded-[28px] bg-gray-100" />
            <div className="mt-6 h-72 rounded-[32px] bg-gray-100" />
          </div>
        ) : error ? (
          <div className="mx-auto max-w-[1320px] rounded-[32px] border border-red-200 bg-red-50 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-red-700">
              Unable to load certificate
            </h2>
            <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload
            </button>
          </div>
        ) : published && available && item ? (
          <div className="space-y-6">
            <div className="overflow-x-auto pb-2">
              <CertificateCanvas item={item} />
            </div>

            <div className="certificate-print-hidden mx-auto max-w-[1320px] rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#A01C33]">
                    Verified Certificate
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                    Official participant recognition
                  </h2>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  <ShieldCheck className="h-4 w-4" />
                  {item.awardLabel}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Participant", item.participantName],
                  ["Team", item.teamName],
                  ["Standing", `#${item.rank}`],
                  ["Certificate No.", item.certificateNumber],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[1320px] rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">
              Certificate download is not available yet
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-500">
              {message ||
                "Your certificate will appear here once the official results are published and a valid certificate record is available for your account."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}

export default function ParticipantCertificatePage() {
  return (
    <Suspense fallback={<ParticipantCertificatePageFallback />}>
      <ParticipantCertificatePageContent />
    </Suspense>
  );
}
