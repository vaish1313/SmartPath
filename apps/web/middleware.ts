import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/tests", "/about", "/contact", "/login", "/register", "/unauthorized", "/api/auth", "/auth/google/callback"];

const PATIENT_PATHS = ["/portal", "/book-test", "/bookings", "/reports", "/profile", "/dashboard"];
const ADMIN_PATHS = ["/admin"];

function getCustomToken(req: NextRequest): string | null {
  return req.cookies.get("smartpath_token")?.value ?? null;
}

function decodePayload(token: string): { role?: string } | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function roleHome(role: string | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "lab_technician" || role === "pathologist") return "/admin/lab";
  if (role === "receptionist") return "/admin/bookings";
  return "/portal";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const customToken = getCustomToken(req);
  // Check NextAuth session (Google OAuth users)
  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuthenticated = !!customToken || !!nextAuthToken;

  const isProtected = [...PATIENT_PATHS, ...ADMIN_PATHS].some((p) => pathname.startsWith(p));

  if (!isAuthenticated) {
    if (isProtected) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  // Determine role — custom token takes priority, Google OAuth defaults to patient
  let role: string | undefined;
  if (customToken) {
    role = decodePayload(customToken)?.role;
  } else if (nextAuthToken) {
    role = "patient"; // Google OAuth = patient by default
  }

  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL(roleHome(role), req.url));
  }

  // Block patients from staff routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role === "patient") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Patient-only paths — skip if it's a staff path
  const isStaffPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (!isStaffPath && PATIENT_PATHS.some((p) => pathname.startsWith(p)) && role !== "patient") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|_next/data).*)"],
};