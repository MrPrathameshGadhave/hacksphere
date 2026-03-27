"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const scoreSchema = z.object({
  innovation: z.number().min(0).max(10, "Must be between 0-10"),
  technicalComplexity: z.number().min(0).max(10, "Must be between 0-10"),
  uiUx: z.number().min(0).max(10, "Must be between 0-10"),
  impact: z.number().min(0).max(10, "Must be between 0-10"),
  presentation: z.number().min(0).max(10, "Must be between 0-10"),
  feedback: z.string().optional(),
  status: z.enum(["draft", "submitted"]),
});

type ScoreFormValues = z.infer<typeof scoreSchema>;

interface ScoreFormProps {
  initialValues?: Partial<ScoreFormValues>;
  onSubmit: (values: ScoreFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ScoreForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: ScoreFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: initialValues || {
      innovation: 5,
      technicalComplexity: 5,
      uiUx: 5,
      impact: 5,
      presentation: 5,
      feedback: "",
      status: "draft",
    },
  });

  const values = watch();
  const totalScore = (
    (values.innovation || 0) +
    (values.technicalComplexity || 0) +
    (values.uiUx || 0) +
    (values.impact || 0) +
    (values.presentation || 0)
  ) / 5;

  const onFormSubmit = async (data: ScoreFormValues) => {
    try {
      await onSubmit(data);
      toast.success("Evaluation submitted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit evaluation"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Scoring Criteria */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#202225]">Evaluation Criteria</h3>

        {[
          {
            key: "innovation",
            label: "Innovation",
            description: "Creativity and originality of the solution",
          },
          {
            key: "technicalComplexity",
            label: "Technical Complexity",
            description: "Difficulty and sophistication of implementation",
          },
          {
            key: "uiUx",
            label: "UI/UX Design",
            description: "User interface and user experience quality",
          },
          {
            key: "impact",
            label: "Real-World Impact",
            description: "Applicability and potential impact",
          },
          {
            key: "presentation",
            label: "Presentation",
            description: "Clarity and quality of project presentation",
          },
        ].map((criterion) => (
          <div
            key={criterion.key}
            className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#202225]">{criterion.label}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {criterion.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  {...register(criterion.key as keyof ScoreFormValues, {
                    valueAsNumber: true,
                  })}
                  className="h-2 w-24 cursor-pointer rounded-lg bg-gray-200"
                />
                <span className="w-12 rounded-lg bg-[#A01C33] px-3 py-2 text-center font-bold text-white">
                  {values[criterion.key as keyof ScoreFormValues] || 0}
                </span>
              </div>
            </div>
            {errors[criterion.key as keyof ScoreFormValues] && (
              <p className="mt-2 text-sm text-red-600">
                {
                  errors[criterion.key as keyof ScoreFormValues]?.message as string
                }
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Total Score */}
      <div className="rounded-[28px] bg-gradient-to-r from-[#A01C33] to-[#7E1428] p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-white/80">
          Overall Score
        </p>
        <p className="mt-2 text-4xl font-black">
          {totalScore.toFixed(1)}/10
        </p>
      </div>

      {/* Feedback */}
      <div>
        <label htmlFor="feedback" className="mb-2 block text-sm font-semibold text-[#202225]">
          Feedback (Optional)
        </label>
        <textarea
          id="feedback"
          {...register("feedback")}
          placeholder="Provide detailed feedback for the team..."
          rows={5}
          className="w-full rounded-2xl border border-gray-300 bg-white p-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
        />
      </div>

      {/* Status */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#202225]">
          Submission Status
        </label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer transition hover:border-[#A01C33]">
            <input
              type="radio"
              value="draft"
              {...register("status")}
              className="h-4 w-4 accent-[#A01C33]"
            />
            <span className="text-sm font-medium text-[#202225]">
              Save as Draft
            </span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer transition hover:border-[#A01C33]">
            <input
              type="radio"
              value="submitted"
              {...register("status")}
              className="h-4 w-4 accent-[#A01C33]"
            />
            <span className="text-sm font-medium text-[#202225]">
              Submit Evaluation
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-[#A01C33] px-6 py-3 font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Submitting..." : "Submit Evaluation"}
      </button>
    </form>
  );
}
