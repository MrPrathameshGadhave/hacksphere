import mongoose from "mongoose";
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

function isAdminScope(request: NextRequest) {
  return request.nextUrl.searchParams.get("scope") === "admin";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    return `problem-${Date.now()}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await ProblemStatement.findOne({ slug });

    if (!existing) break;
    if (excludeId && existing._id.toString() === excludeId) break;

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

async function findProblemByIdOrSlug(idOrSlug: string) {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await ProblemStatement.findById(idOrSlug);
    if (byId) return byId;
  }

  return ProblemStatement.findOne({ slug: idOrSlug.toLowerCase() });
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const adminScope = isAdminScope(request);

    if (adminScope) {
      const user = getUserFromRequest(request);

      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const problem = await findProblemByIdOrSlug(id);

    if (!problem) {
      return NextResponse.json(
        { success: false, message: "Problem not found" },
        { status: 404 }
      );
    }

    if (!adminScope && (problem.status !== "Published" || !problem.isActive)) {
      return NextResponse.json(
        { success: false, message: "Problem not available" },
        { status: 404 }
      );
    }

    const formattedProblem = await transformProblem(problem);

    return NextResponse.json({
      success: true,
      problem: formattedProblem,
    });
  } catch (error) {
    console.error("GET /api/problems/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const problem = await findProblemByIdOrSlug(id);

    if (!problem) {
      return NextResponse.json(
        { success: false, message: "Problem not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body?.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return NextResponse.json(
          { success: false, message: "Title cannot be empty" },
          { status: 400 }
        );
      }

      problem.title = title;
      problem.slug = await generateUniqueSlug(title, problem._id.toString());
    }

    if (body?.category !== undefined) {
      const category = String(body.category).trim();

      if (!category) {
        return NextResponse.json(
          { success: false, message: "Category cannot be empty" },
          { status: 400 }
        );
      }

      problem.category = category;
    }

    if (body?.shortDescription !== undefined) {
      const shortDescription = String(body.shortDescription).trim();

      if (!shortDescription) {
        return NextResponse.json(
          { success: false, message: "Short description cannot be empty" },
          { status: 400 }
        );
      }

      problem.shortDescription = shortDescription;
    }

    if (body?.fullDescription !== undefined) {
      const fullDescription = String(body.fullDescription).trim();

      if (!fullDescription) {
        return NextResponse.json(
          { success: false, message: "Full description cannot be empty" },
          { status: 400 }
        );
      }

      problem.fullDescription = fullDescription;
    }

    if (body?.difficulty !== undefined) {
      if (!validateDifficulty(body.difficulty)) {
        return NextResponse.json(
          { success: false, message: "Invalid difficulty" },
          { status: 400 }
        );
      }

      problem.difficulty = body.difficulty;
    }

    if (body?.status !== undefined) {
      if (!validateStatus(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status" },
          { status: 400 }
        );
      }

      problem.status = body.status;
    }

    if (body?.suggestedTechnologies !== undefined) {
      problem.suggestedTechnologies = normalizeStringArray(
        body.suggestedTechnologies
      );
    }

    if (body?.submissionRequirements !== undefined) {
      problem.submissionRequirements = normalizeStringArray(
        body.submissionRequirements
      );
    }

    problem.isActive = problem.status === "Published";

    await problem.save();

    const formattedProblem = await transformProblem(problem);

    return NextResponse.json({
      success: true,
      message: "Problem updated successfully",
      problem: formattedProblem,
    });
  } catch (error: any) {
    console.error("PATCH /api/problems/[id] error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A problem with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update problem" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const problem = await findProblemByIdOrSlug(id);

    if (!problem) {
      return NextResponse.json(
        { success: false, message: "Problem not found" },
        { status: 404 }
      );
    }

    const linkedTeamsCount = await Team.countDocuments({
      problemStatement: problem._id,
    });

    if (linkedTeamsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This problem is already linked to one or more teams. Archive it instead of deleting.",
        },
        { status: 400 }
      );
    }

    await problem.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/problems/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete problem" },
      { status: 500 }
    );
  }
}