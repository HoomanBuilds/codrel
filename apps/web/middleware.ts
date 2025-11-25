import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = [
  "/auth",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

const TOKEN_API = ["/api/ask", "/api/ingest"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (TOKEN_API.some((p) => pathname.startsWith(p))) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
      return NextResponse.json({ error: "Missing API token" }, { status: 401 });
    return NextResponse.next();
  }

  const session = await getToken({ req });

  if (!session) {
    const loginUrl = new URL("/auth", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
