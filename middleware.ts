import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

type UserRole = "participant" | "judge" | "admin";

type TokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("hacksphere_token")?.value;

  const isParticipantRoute = pathname.startsWith("/participant");
  const isJudgeRoute = pathname.startsWith("/judge");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = await verifyJWT(token);

  if (!decoded) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("hacksphere_token");
    return response;
  }

  const userRole = decoded.role;

  if (isParticipantRoute && userRole !== "participant") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isJudgeRoute && userRole !== "judge") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/participant/:path*", "/judge/:path*", "/admin/:path*"],
};