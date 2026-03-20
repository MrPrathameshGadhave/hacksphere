"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileCheck2, Trophy } from "lucide-react";
import ProblemCard from "@/components/problem-statements/ProblemCard";
import ProblemPagination from "@/components/problem-statements/ProblemPagination";
import { publicProblemStatements } from "@/lib/mock-problems";
import PublicHeader from "@/components/layout/PublicHeader";

const ITEMS_PER_PAGE = 6;

export default function ProblemStatementsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(publicProblemStatements.length / ITEMS_PER_PAGE);

  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return publicProblemStatements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage]);

  return (
    <main className="min-h-screen bg-[#F6F7FB] text-[#3B3C3E]">
      <PublicHeader />
      {/* <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#A01C33]/10 bg-[#A01C33]/5 px-4 py-2 text-sm font-semibold text-[#A01C33]">
                Problem Statements • Stage 1 Online Round
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-[#1F2937] sm:text-5xl">
                Explore public challenge statements for HackSphere.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-[#5B6068] sm:text-lg">
                In the first stage of HackSphere, problem statements are published
                online. Teams study the challenge, prepare their approach, and
                submit their work online for screening and shortlisting.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#3B3C3E] shadow-sm transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  About Hackathon
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Current View</p>
                <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                  {publicProblemStatements.length} Problems
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Public challenge statements available for the screening stage.
                </p>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Next Step</p>
                <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                  Read → Prepare → Submit
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Strong online submissions move forward to the 48-hour offline final.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

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

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>

        <ProblemPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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