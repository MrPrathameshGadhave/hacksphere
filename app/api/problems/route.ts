import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import ProblemStatement from "@/models/ProblemStatement";
import Team from "@/models/Team";

type ProblemDifficulty = "Easy" | "Medium" | "Hard";
type ProblemStatus = "Draft" | "Published" | "Archived";

function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  return verifyToken(token);
}

function isAdminRequest(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");
  return scope === "admin";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateUniqueSlug(title: string) {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    return `problem-${Date.now()}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (await ProblemStatement.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function validateDifficulty(value: unknown): value is ProblemDifficulty {
  return value === "Easy" || value === "Medium" || value === "Hard";
}

function validateStatus(value: unknown): value is ProblemStatus {
  return value === "Draft" || value === "Published" || value === "Archived";
}

async function transformProblem(problem: any) {
  const teamsInterested = await Team.countDocuments({
    problemStatement: problem._id,
  });

  return {
    id: problem._id.toString(),
    title: problem.title || "",
    slug: problem.slug || "",
    category: problem.category || "",
    difficulty: problem.difficulty || "Medium",
    status: problem.status || "Draft",
    shortDescription: problem.shortDescription || "",
    fullDescription: problem.fullDescription || "",
    suggestedTechnologies: Array.isArray(problem.suggestedTechnologies)
      ? problem.suggestedTechnologies
      : [],
    submissionRequirements: Array.isArray(problem.submissionRequirements)
      ? problem.submissionRequirements
      : [],
    teamsInterested,
    isActive: Boolean(problem.isActive),
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const adminScope = isAdminRequest(request);

    if (adminScope) {
      const user = getUserFromRequest(request);

      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const filter = adminScope
      ? {}
      : {
          status: "Published",
          isActive: true,
        };

    const problems = await ProblemStatement.find(filter).sort({
      createdAt: -1,
    });

    const formattedProblems = await Promise.all(
      problems.map((problem) => transformProblem(problem))
    );

    return NextResponse.json({
      success: true,
      problems: formattedProblems,
    });
  } catch (error) {
    console.error("GET /api/problems error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const title = String(body?.title || "").trim();
    const category = String(body?.category || "").trim();
    const shortDescription = String(body?.shortDescription || "").trim();
    const fullDescription = String(body?.fullDescription || "").trim();
    const difficulty = body?.difficulty;
    const status = body?.status;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    if (!shortDescription) {
      return NextResponse.json(
        { success: false, message: "Short description is required" },
        { status: 400 }
      );
    }

    if (!fullDescription) {
      return NextResponse.json(
        { success: false, message: "Full description is required" },
        { status: 400 }
      );
    }

    if (!validateDifficulty(difficulty)) {
      return NextResponse.json(
        { success: false, message: "Invalid difficulty" },
        { status: 400 }
      );
    }

    if (!validateStatus(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(title);

    const problem = await ProblemStatement.create({
      title,
      slug,
      category,
      difficulty,
      status,
      isActive: status === "Published",
      shortDescription,
      fullDescription,
      suggestedTechnologies: normalizeStringArray(body?.suggestedTechnologies),
      submissionRequirements: normalizeStringArray(body?.submissionRequirements),
    });

    const formattedProblem = await transformProblem(problem);

    return NextResponse.json(
      {
        success: true,
        message: "Problem created successfully",
        problem: formattedProblem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/problems error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A problem with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create problem" },
      { status: 500 }
    );
  }
}