import mongoose from "mongoose";
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

async function getAnnouncementById(id: string) {
  return Announcement.findById(id).populate("createdBy", "name email role");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid announcement id" },
        { status: 400 }
      );
    }

    await connectDB();

    const announcement = await getAnnouncementById(id);

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      announcement: transformAnnouncement(announcement),
    });
  } catch (error) {
    console.error("GET /api/admin/announcements/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid announcement id" },
        { status: 400 }
      );
    }

    await connectDB();

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
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

      announcement.title = title;
    }

    if (body?.message !== undefined) {
      const message = String(body.message).trim();

      if (!message) {
        return NextResponse.json(
          { success: false, message: "Message cannot be empty" },
          { status: 400 }
        );
      }

      announcement.message = message;
    }

    if (body?.category !== undefined) {
      if (!isValidCategory(body.category)) {
        return NextResponse.json(
          { success: false, message: "Invalid category" },
          { status: 400 }
        );
      }

      announcement.category = body.category;
    }

    if (body?.pinned !== undefined) {
      announcement.pinned = Boolean(body.pinned);
    }

    await announcement.save();

    const updatedAnnouncement = await getAnnouncementById(id);

    return NextResponse.json({
      success: true,
      message: "Announcement updated successfully",
      announcement: transformAnnouncement(updatedAnnouncement),
    });
  } catch (error) {
    console.error("PATCH /api/admin/announcements/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid announcement id" },
        { status: 400 }
      );
    }

    await connectDB();

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 }
      );
    }

    await announcement.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/announcements/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}