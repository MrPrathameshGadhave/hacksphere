import { z } from "zod";

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTechStack(value: unknown) {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(",")
    : [];

  return Array.from(
    new Set(
      items
        .map((item) => String(item).trim())
        .filter(Boolean)
    )
  );
}

function normalizeImages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isGitHubUrl(value: string) {
  try {
    const url = new URL(value);
    return /(^|\.)github\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

const optionalHttpUrlSchema = (label: string) =>
  z.preprocess(
    toTrimmedString,
    z.string().refine(
      (value) => value.length === 0 || isHttpUrl(value),
      `Enter a valid ${label} URL`
    )
  );

const submissionBodySchema = z
  .object({
    projectTitle: z.preprocess(
      toTrimmedString,
      z.string().max(100, "Project title must be less than 100 characters")
    ),
    description: z.preprocess(
      toTrimmedString,
      z.string().max(2000, "Description must be less than 2000 characters")
    ),
    techStack: z.preprocess(
      normalizeTechStack,
      z
        .array(
          z
            .string()
            .trim()
            .min(1)
            .max(40, "Each technology must be less than 40 characters")
        )
        .max(10, "Select at most 10 technologies")
    ),
    githubLink: optionalHttpUrlSchema("GitHub repository").refine(
      (value) => value.length === 0 || isGitHubUrl(value),
      "Enter a valid GitHub repository URL"
    ),
    demoLink: optionalHttpUrlSchema("demo"),
    pptLink: optionalHttpUrlSchema("presentation"),
    videoLink: optionalHttpUrlSchema("video"),
    images: z.preprocess(
      normalizeImages,
      z
        .array(z.string().url("Each image must be a valid URL"))
        .max(5, "You can upload up to 5 images")
    ),
    status: z.enum(["draft", "submitted"]).default("draft"),
  })
  .superRefine((data, ctx) => {
    if (data.status !== "submitted") {
      return;
    }

    if (data.projectTitle.length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["projectTitle"],
        message: "Project title must be at least 3 characters",
      });
    }

    if (data.description.length < 20) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: "Description must be at least 20 characters",
      });
    }

    if (!data.githubLink) {
      ctx.addIssue({
        code: "custom",
        path: ["githubLink"],
        message: "GitHub repository link is required",
      });
    }

    if (!data.demoLink) {
      ctx.addIssue({
        code: "custom",
        path: ["demoLink"],
        message: "Demo link is required",
      });
    }

    if (data.techStack.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["techStack"],
        message: "Select at least one technology",
      });
    }
  });

export const submissionCreateSchema = submissionBodySchema;
export const submissionUpdateSchema = submissionBodySchema;

export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>;
export type SubmissionUpdateInput = z.infer<typeof submissionUpdateSchema>;
