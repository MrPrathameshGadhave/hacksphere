import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { publicProblemStatements } from "@/lib/mock-problems";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

const difficultyStyles: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

export default async function ProblemStatementDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const problem = publicProblemStatements.find((item) => item.slug === slug);

  if (!problem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] text-[#3B3C3E]">
              <PublicHeader />
        
      {/* <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <Link
            href="/problem-statements"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Problem Statements
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
              {problem.category}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                difficultyStyles[problem.difficulty]
              }`}
            >
              {problem.difficulty}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-[#1F2937] sm:text-5xl">
            {problem.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#5B6068] sm:text-lg">
            {problem.shortDescription}
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
              Read Hackathon Rules
            </Link>
          </div>
        </div>
      </section> */}

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[#202225]">
                Full Description
              </h2>
              <p className="mt-4 text-sm leading-8 text-[#6B7280]">
                {problem.fullDescription}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-[#202225]">
                  Objective
                </h2>
                <p className="mt-4 text-sm leading-8 text-[#6B7280]">
                  {problem.objective}
                </p>
              </div>

              <div className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-[#202225]">
                  Expected Outcome
                </h2>
                <p className="mt-4 text-sm leading-8 text-[#6B7280]">
                  {problem.expectedOutcome}
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[#202225]">
                Suggested Technologies
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {problem.suggestedTechnologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-gray-200 bg-[#fcfcfd] px-4 py-2 text-sm font-semibold text-[#3B3C3E]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[#202225]">
                Problem Rules
              </h2>

              <div className="mt-5 space-y-3">
                {problem.rules.map((rule, index) => (
                  <div
                    key={rule}
                    className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#A01C33] text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-[#5B6068]">{rule}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[#202225]">
                Before You Submit
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  "Understand the problem deeply before drafting the solution.",
                  "Keep the idea practical, structured, and relevant.",
                  "Follow official HackSphere submission instructions.",
                  "Aim for a strong screening-round entry to qualify offline.",
                ].map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-gray-200 bg-[#fcfcfd] px-4 py-4 text-sm leading-7 text-[#5B6068]"
                  >
                    {point}
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5"
              >
                Register for HackSphere
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </main>
  );
}