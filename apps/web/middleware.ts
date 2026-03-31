import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/tests", "/about", "/contact", "/login", "/register", "/unauthorized"];

// Patient portal paths
const PATIENT_PATHS = ["/portal", "/book-test", "/bookings", "/reports", "/profile"];
// Staff dashboard paths — each role has its own sub-path
const ADMIN_PATHS = ["/dashboard/admin"];
const LAB_PATHS = ["/dashboard/lab"];
const RECEPTIONIST_PATHS = ["/dashboard/receptionist"];
// Legacy /admin and /dashboard still supported
const LEGACY_STAFF = ["/admin", "/dashboard"];

function getToken(req: NextRequest): string | null {
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
  if (role === "admin") return "/dashboard/admin";
  if (role === "technician" || role === "pathologist") return "/dashboard/lab";
  if (role === "receptionist") return "/dashboard/receptionist";
  return "/portal";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = getToken(req);

  // No token — redirect to login for any protected path
  const isProtected =
    [...PATIENT_PATHS, ...ADMIN_PATHS, ...LAB_PATHS, ...RECEPTIONIST_PATHS, ...LEGACY_STAFF]
      .some((p) => pathname.startsWith(p));

  if (!token) {
    if (isProtected) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  const payload = decodePayload(token);
  const role = payload?.role;

  // Authenticated user hitting auth pages → send to their home
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL(roleHome(role), req.url));
  }

  // RBAC enforcement
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (LAB_PATHS.some((p) => pathname.startsWith(p)) && role !== "technician" && role !== "pathologist" && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (RECEPTIONIST_PATHS.some((p) => pathname.startsWith(p)) && role !== "receptionist" && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (PATIENT_PATHS.some((p) => pathname.startsWith(p)) && role !== "patient") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Legacy /admin → redirect to role home
  if (pathname.startsWith("/admin") && role === "patient") {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  // Legacy /dashboard → redirect to role home
  if (pathname === "/dashboard" && role) {
    return NextResponse.redirect(new URL(roleHome(role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|_next/data).*)"],
};
