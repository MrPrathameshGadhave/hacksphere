import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Announcement from "@/models/Announcement";
import "@/models/User";

type AnnouncementCategory = "general" | "important" | "deadline" | "result";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== "admin") {
    return null;
  }

  return decoded;
}

function isValidCategory(value: unknown): value is AnnouncementCategory {
  return (
    value === "general" ||
    value === "important" ||
    value === "deadline" ||
    value === "result"
  );
}

function normalizeCreatedBy(user: any) {
  if (!user) return null;

  return {
    id: user._id?.toString?.() || "",
    name: user.name || "",
    email: user.email || "",
    role: user.role || "",
  };
}

function transformAnnouncement(announcement: any) {
  const createdBy = normalizeCreatedBy(announcement.createdBy);

  return {
    id: announcement._id?.toString?.() || "",
    title: announcement.title || "",
    message: announcement.message || "",
    category: announcement.category || "general",
    pinned: Boolean(announcement.pinned),
    createdBy,
    createdByName:
      createdBy?.name || createdBy?.email || "Admin",
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const announcements = await Announcement.find({})
      .populate("createdBy", "name email role")
      .sort({ pinned: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      announcements: announcements.map(transformAnnouncement),
    });
  } catch (error) {
    console.error("GET /api/admin/announcements error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const title = String(body?.title || "").trim();
    const message = String(body?.message || "").trim();
    const category = body?.category;
    const pinned = Boolean(body?.pinned);

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      );
    }

    if (!isValidCategory(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    const announcement = await Announcement.create({
      title,
      message,
      category,
      pinned,
      createdBy: admin.userId,
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate("createdBy", "name email role");

    return NextResponse.json(
      {
        success: true,
        message: "Announcement created successfully",
        announcement: transformAnnouncement(populatedAnnouncement),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/announcements error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create announcement" },
      { status: 500 }
    );
  }
}