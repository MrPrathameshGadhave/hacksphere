import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { buildAdminCertificateCatalog } from "@/lib/admin/certificates";

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const currentUser = verifyToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
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

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const userId = searchParams.get("userId");
    const catalog = await buildAdminCertificateCatalog();

    if ((teamId && !userId) || (!teamId && userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Both teamId and userId are required for a certificate preview.",
        },
        { status: 400 }
      );
    }

    if (teamId && userId) {
      const item = catalog.items.find(
        (certificate) =>
          certificate.teamId === teamId && certificate.userId === userId
      );

      if (!item) {
        return NextResponse.json(
          {
            success: false,
            message: "Certificate not found for this participant.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        item,
        meta: catalog.meta,
      });
    }

    return NextResponse.json({
      success: true,
      items: catalog.items,
      meta: catalog.meta,
    });
  } catch (error) {
    console.error("GET /api/admin/certificates error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch certificates.",
      },
      { status: 500 }
    );
  }
}
