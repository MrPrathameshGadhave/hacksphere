import { z } from "zod";

export const submissionCreateSchema = z.object({
  projectTitle: z
    .string()
    .min(3, "Project title must be at least 3 characters")
    .max(100, "Project title must be less than 100 characters"),
  projectDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  techStack: z
    .array(z.string())
    .min(1, "Select at least one technology")
    .max(10, "Select at most 10 technologies"),
  githubLink: z
    .string()
    .url("Invalid GitHub URL")
    .optional()
    .or(z.literal("")),
  demoLink: z
    .string()
    .url("Invalid demo URL")
    .optional()
    .or(z.literal("")),
  pptLink: z
    .string()
    .url("Invalid presentation URL")
    .optional()
    .or(z.literal("")),
  videoLink: z
    .string()
    .url("Invalid video URL")
    .optional()
    .or(z.literal("")),
  images: z.array(z.string()).optional(),
  status: z.enum(["draft", "submitted"]).default("draft"),
});

export const submissionUpdateSchema = z.object({
  projectTitle: z
    .string()
    .min(3, "Project title must be at least 3 characters")
    .max(100, "Project title must be less than 100 characters")
    .optional(),
  projectDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  techStack: z
    .array(z.string())
    .min(1, "Select at least one technology")
    .max(10, "Select at most 10 technologies")
    .optional(),
  githubLink: z
    .string()
    .url("Invalid GitHub URL")
    .optional()
    .or(z.literal("")),
  demoLink: z
    .string()
    .url("Invalid demo URL")
    .optional()
    .or(z.literal("")),
  pptLink: z
    .string()
    .url("Invalid presentation URL")
    .optional()
    .or(z.literal("")),
  videoLink: z
    .string()
    .url("Invalid video URL")
    .optional()
    .or(z.literal("")),
  images: z.array(z.string()).optional(),
  status: z.enum(["draft", "submitted"]).optional(),
});

export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>;
export type SubmissionUpdateInput = z.infer<typeof submissionUpdateSchema>;
