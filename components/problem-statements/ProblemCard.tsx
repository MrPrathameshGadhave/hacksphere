import Link from "next/link";
import { ArrowRight } from "lucide-react";

const difficultyStyles: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

type PublicProblemStatement = {
  id: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  category?: string;
  difficulty?: string;
  suggestedTechnologies?: string[];
  submissionRequirements?: string[];
  status?: string;
  isActive?: boolean;
};

type ProblemCardProps = {
  problem: PublicProblemStatement;
};

export default function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      href={`/problem-statements/${problem.slug || ""}`}
      className="group block rounded-[30px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#A01C33]/20 hover:bg-white hover:shadow-[0_28px_60px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full bg-[#A01C33]/10 px-3 py-1 text-xs font-semibold text-[#A01C33]">
          {problem.category || "General"}
        </span>

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            difficultyStyles[problem.difficulty || ""] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {problem.difficulty || "Unspecified"}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#202225]">
        {problem.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-[#6B7280]">
        {problem.shortDescription || "No description available."}
      </p>

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]">
        View Full Description
        <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}