"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FileSearch,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

type JudgeReviewItem = {
  id: string;
  assignmentId: string;
  submissionId: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  description: string;
  problemTitle: string;
  problemSlug: string;
  problemCategory: string;
  problemDifficulty: string;
  memberCount: number;
  githubLink: string;
  demoLink: string;
  pptLink: string;
  videoLink: string;
  techStack: string[];
  images: string[];
  submissionStatus: "draft" | "submitted" | "locked";
  submittedAt: string | null;
  reviewStatus: "pending" | "in-progress" | "reviewed";
  evaluation: {
    status: "draft" | "submitted";
    totalScore: number;
    updatedAt: string | null;
  } | null;
  assignedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type JudgeReviewsResponse = {
  items: JudgeReviewItem[];
  counts: {
    total: number;
    pending: number;
    inProgress: number;
    reviewed: number;
  };
};

type LeaderboardResponse = {
  success: boolean;
  published: boolean;
  items: Array<unknown>;
  topThree: Array<unknown>;
};

function getPendingBadgeClasses(status: JudgeReviewItem["reviewStatus"]) {
  if (status === "in-progress") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getPendingBadgeLabel(status: JudgeReviewItem["reviewStatus"]) {
  if (status === "in-progress") return "In Progress";
  return "Pending";
}

function formatDate(value: string | null) {
  if (!value) return "Not submitted yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function DashboardSkeleton() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="h-10 w-56 animate-pulse rounded-full bg-white/15" />
            <div className="h-10 w-full max-w-[420px] animate-pulse rounded-2xl bg-white/15" />
            <div className="h-20 w-full max-w-[620px] animate-pulse rounded-2xl bg-white/10" />
            <div className="flex gap-3">
              <div className="h-12 w-40 animate-pulse rounded-2xl bg-white/20" />
              <div className="h-12 w-40 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="h-32 animate-pulse rounded-[24px] bg-white/10" />
            <div className="h-32 animate-pulse rounded-[24px] bg-white/10" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="space-y-4">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-80 animate-pulse rounded bg-gray-200" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="space-y-3">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="space-y-3">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3 pt-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[22px] bg-gray-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function JudgeDashboardPage() {
  const [reviewsData, setReviewsData] = useState<JudgeReviewsResponse | null>(
    null
  );
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [reviewsResponse, leaderboardResponse] = await Promise.all([
          fetch("/api/judge/reviews", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/leaderboard", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!reviewsResponse.ok) {
          const reviewsError = await reviewsResponse
            .json()
            .catch(() => ({ message: "Failed to fetch judge reviews." }));

          throw new Error(reviewsError.message || "Failed to fetch judge reviews.");
        }

        if (!leaderboardResponse.ok) {
          const leaderboardError = await leaderboardResponse
            .json()
            .catch(() => ({ message: "Failed to fetch leaderboard." }));

          throw new Error(
            leaderboardError.message || "Failed to fetch leaderboard."
          );
        }

        const reviewsJson: JudgeReviewsResponse = await reviewsResponse.json();
        const leaderboardJson: LeaderboardResponse =
          await leaderboardResponse.json();

        if (ignore) return;

        setReviewsData(reviewsJson);
        setLeaderboardData(leaderboardJson);
      } catch (err) {
        if (ignore) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the judge dashboard."
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const pendingReviewItems = useMemo(() => {
    if (!reviewsData?.items?.length) return [];

    return reviewsData.items
      .filter((item) => item.reviewStatus !== "reviewed")
      .slice(0, 3);
  }, [reviewsData]);

  const totalAssigned = reviewsData?.counts?.total ?? 0;
  const completedReviews = reviewsData?.counts?.reviewed ?? 0;
  const pendingReviews =
    (reviewsData?.counts?.pending ?? 0) + (reviewsData?.counts?.inProgress ?? 0);
  const leaderboardPublished = Boolean(leaderboardData?.published);

  const stats = [
    {
      title: "Assigned Projects",
      value: String(totalAssigned),
      subtext: "Projects allocated for your review",
      icon: FileSearch,
    },
    {
      title: "Completed Reviews",
      value: String(completedReviews),
      subtext: "Final reviews submitted successfully",
      icon: ClipboardCheck,
    },
    {
      title: "Pending Reviews",
      value: String(pendingReviews),
      subtext: "Pending or in-progress evaluations remaining",
      icon: ShieldCheck,
    },
    {
      title: "Leaderboard Status",
      value: leaderboardPublished ? "Published" : "Draft",
      subtext: leaderboardPublished
        ? "Results are visible on the public leaderboard"
        : "Results are not published yet",
      icon: Trophy,
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Judge Dashboard • Official Review Panel
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Welcome to your judging workspace.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Review assigned projects, score them across the judging criteria,
              provide constructive feedback, and help shape the final HackSphere
              rankings.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/judge/reviews"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                Start Reviewing
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/judge/leaderboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                View Leaderboard
              </Link>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90">
                {error}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Judge Role</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Assigned Review Mode
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                You can review only submissions assigned to you.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Evaluation Model</p>
              <h3 className="mt-2 text-2xl font-bold text-white">5 Criteria</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Innovation, complexity, UI/UX, impact, presentation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.title}</p>
                  <h3 className="mt-3 text-2xl font-bold text-[#3B3C3E]">
                    {item.value}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.subtext}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#A01C33]">Pending Reviews</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                Assigned projects awaiting evaluation
              </h2>
            </div>

            <Link
              href="/judge/reviews"
              className="text-sm font-semibold text-[#A01C33] hover:underline"
            >
              Open review queue
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {pendingReviewItems.length > 0 ? (
              pendingReviewItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPendingBadgeClasses(
                          item.reviewStatus
                        )}`}
                      >
                        {getPendingBadgeLabel(item.reviewStatus)}
                      </span>

                      <h3 className="mt-3 text-lg font-bold text-[#3B3C3E]">
                        {item.teamName}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-gray-500">
                        {item.projectTitle}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {item.problemTitle || "Problem not selected"}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {item.memberCount} member{item.memberCount === 1 ? "" : "s"}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Submitted: {formatDate(item.submittedAt)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/judge/reviews/${item.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c]"
                    >
                      Review Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                  No pending reviews right now
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  You have no pending or in-progress evaluations at the moment.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Judging Criteria</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Scoring structure
            </h2>

            <div className="mt-6 space-y-3">
              {[
                "Innovation",
                "Technical Complexity",
                "UI/UX",
                "Impact",
                "Presentation",
              ].map((criterion) => (
                <div
                  key={criterion}
                  className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-3 text-sm font-semibold text-[#3B3C3E]"
                >
                  {criterion}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Judge Guidance</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Review reminders
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Be constructive</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Feedback should help teams understand strengths and
                      improvements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Score consistently</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Apply the same standard across all assigned submissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">
                  Important note
                </p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  Only assigned projects should be reviewed in final flow, and
                  each submission should be evaluated once per judge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}