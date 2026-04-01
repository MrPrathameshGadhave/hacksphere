import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { buildAdminCertificateCatalog } from "@/lib/admin/certificates";

function getParticipantFromRequest(request: NextRequest) {
  const token = request.cookies.get("hacksphere_token")?.value;

  if (!token) return null;

  const currentUser = verifyToken(token);

  if (!currentUser || currentUser.role !== "participant") {
    return null;
  }

  return currentUser;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getParticipantFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const catalog = await buildAdminCertificateCatalog();
    const item =
      catalog.items.find(
        (certificate) => certificate.userId === currentUser.userId
      ) || null;
    const published = catalog.meta.publishState === "Published";

    if (!published) {
      return NextResponse.json({
        success: true,
        published: false,
        available: false,
        item: null,
        meta: catalog.meta,
        message:
          "Certificates unlock after official results are published on the leaderboard.",
      });
    }

    if (!item) {
      return NextResponse.json({
        success: true,
        published: true,
        available: false,
        item: null,
        meta: catalog.meta,
        message:
          "No certificate is available for your account yet. Certificates are issued for participants linked to official submission standings.",
      });
    }

    return NextResponse.json({
      success: true,
      published: true,
      available: true,
      item,
      meta: catalog.meta,
      message: "Your certificate is ready to download.",
    });
  } catch (error) {
    console.error("GET /api/participant/certificate error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch your certificate.",
      },
      { status: 500 }
    );
  }
}
