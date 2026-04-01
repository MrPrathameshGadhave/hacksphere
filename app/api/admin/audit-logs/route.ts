import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import AdminLog from "@/models/AdminLog";
import "@/models/User";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const currentUser = verifyToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

function clampLimit(rawValue: string | null) {
  const parsed = Number(rawValue || 50);

  if (!Number.isFinite(parsed)) {
    return 50;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), 200);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getAdminFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const limit = clampLimit(new URL(request.url).searchParams.get("limit"));

    const [logs, total] = await Promise.all([
      AdminLog.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate({
          path: "admin",
          select: "name email",
        })
        .lean(),
      AdminLog.countDocuments(),
    ]);

    const items = logs.map((log: any) => ({
      id: String(log._id),
      action: log.action || "",
      targetType: log.targetType || "",
      targetId: log.targetId ? String(log.targetId) : null,
      targetLabel: log.targetLabel || "",
      details:
        log.details && typeof log.details === "object" ? log.details : {},
      createdAt: log.createdAt?.toISOString?.() || null,
      actor: {
        id: log.admin?._id ? String(log.admin._id) : "",
        name: log.admin?.name || "Admin",
        email: log.admin?.email || "",
      },
    }));

    return NextResponse.json({
      success: true,
      total,
      items,
    });
  } catch (error) {
    console.error("GET /api/admin/audit-logs error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch audit logs." },
      { status: 500 }
    );
  }
}
