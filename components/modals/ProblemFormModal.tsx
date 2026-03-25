"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type ProblemStatus = "Published" | "Draft" | "Archived";
export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type ProblemFormValues = {
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  shortDescription: string;
  fullDescription: string;
  suggestedTechnologies: string;
  submissionRequirements: string;
};

type ProblemFormModalProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  initialValues?: Partial<ProblemFormValues>;
  loading?: boolean;
  onClose: () => void;
  onSubmit?: (values: ProblemFormValues) => void;
};

const defaultValues: ProblemFormValues = {
  title: "",
  category: "",
  difficulty: "Medium",
  status: "Draft",
  shortDescription: "",
  fullDescription: "",
  suggestedTechnologies: "",
  submissionRequirements: "",
};

export default function ProblemFormModal({
  open,
  mode,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: ProblemFormModalProps) {
  const [formData, setFormData] = useState<ProblemFormValues>(defaultValues);

  useEffect(() => {
    if (!open) return;

    setFormData({
      ...defaultValues,
      ...initialValues,
    });
  }, [open, initialValues]);

  if (!open) return null;

  const isViewMode = mode === "view";

  const titleText =
    mode === "create"
      ? "Create Problem Statement"
      : mode === "edit"
      ? "Edit Problem Statement"
      : "View Problem Statement";

  const subtitleText =
    mode === "create"
      ? "Add a new challenge statement for participants."
      : mode === "edit"
      ? "Update problem details without changing your current page structure."
      : "Review all details of this problem statement.";

  const handleChange = (
    field: keyof ProblemFormValues,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isViewMode || !onSubmit) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 sm:px-7">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Admin Problem Management</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              {titleText}
            </h2>
            <p className="mt-2 text-sm text-gray-500">{subtitleText}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6 sm:px-7">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Problem Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                disabled={isViewMode}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder="Enter problem title"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                disabled={isViewMode}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder="e.g. Healthcare"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  handleChange("difficulty", e.target.value as ProblemDifficulty)
                }
                disabled={isViewMode}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as ProblemStatus)
                }
                disabled={isViewMode}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Short Description
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => handleChange("shortDescription", e.target.value)}
                disabled={isViewMode}
                rows={3}
                className="w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder="Write a short summary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Full Description
              </label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => handleChange("fullDescription", e.target.value)}
                disabled={isViewMode}
                rows={6}
                className="w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder="Write the complete problem statement"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Suggested Technologies
              </label>
              <textarea
                value={formData.suggestedTechnologies}
                onChange={(e) =>
                  handleChange("suggestedTechnologies", e.target.value)
                }
                disabled={isViewMode}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder="Comma separated, e.g. Next.js, AI, MongoDB"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
                Submission Requirements
              </label>
              <textarea
                value={formData.submissionRequirements}
                onChange={(e) =>
                  handleChange("submissionRequirements", e.target.value)
                }
                disabled={isViewMode}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] px-4 py-3 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder={"Use commas or new lines\nGitHub repository\nPresentation deck\nDemo link"}
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#A01C33] px-5 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                  ? "Create Problem"
                  : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}