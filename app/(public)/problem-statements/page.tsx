"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileCheck2, Trophy } from "lucide-react";
import ProblemCard from "@/components/problem-statements/ProblemCard";
import ProblemPagination from "@/components/problem-statements/ProblemPagination";
import PublicHeader from "@/components/layout/PublicHeader";

const ITEMS_PER_PAGE = 6;

type Problem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  suggestedTechnologies: string[];
  submissionRequirements: string[];
  status?: "Draft" | "Published" | "Archived";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

type ProblemsResponse = {
  success: boolean;
  problems: Problem[];
  message?: string;
};

function SkeletonCard() {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-gray-100" />
      <div className="mt-4 h-6 w-3/4 animate-pulse rounded-lg bg-gray-100" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
      </div>
      <div className="mt-6 h-11 w-36 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function ProblemStatementsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProblems() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/problems", {
          method: "GET",
          cache: "no-store",
        });

        const data: ProblemsResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load problem statements");
        }

        if (!isMounted) return;
        setProblems(data.problems || []);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load problem statements"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProblems();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(problems.length / ITEMS_PER_PAGE));

  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return problems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, problems]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <main className="min-h-screen bg-[#F6F7FB] text-[#3B3C3E]">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
              Challenge List
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
              Available problem statements
            </h2>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm">
            Page <span className="font-bold text-[#202225]">{currentPage}</span> of{" "}
            <span className="font-bold text-[#202225]">{totalPages}</span>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : paginatedProblems.length > 0 ? (
            paginatedProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))
          ) : (
            <div className="col-span-full rounded-[28px] border border-dashed border-gray-300 bg-white p-10 text-center">
              <h3 className="text-xl font-bold text-[#202225]">
                No published problem statements yet
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                Please check back later once the admin publishes problem statements.
              </p>
            </div>
          )}
        </div>

        {!loading && problems.length > 0 ? (
          <ProblemPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        ) : null}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-8 py-12 text-white shadow-[0_24px_60px_rgba(160,28,51,0.24)] lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/75">
                  Stage 1 Guidance
                </p>
                <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                  Read the challenge carefully before you build.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
                  Your first stage performance depends on how clearly you understand
                  the problem, shape the solution direction, and present your idea.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    title: "Read the statement properly",
                    text: "Study the challenge, objective, and expected direction before planning the solution.",
                    icon: BookOpen,
                  },
                  {
                    title: "Prepare the submission carefully",
                    text: "Follow the required submission format, instructions, and deadlines announced officially.",
                    icon: FileCheck2,
                  },
                  {
                    title: "Aim for shortlisting",
                    text: "Only shortlisted teams from the online stage move to the 48-hour offline final.",
                    icon: Trophy,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{item.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-white/80">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}