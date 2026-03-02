import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Redirect old/demo routes to the new single-purpose app gate. */
const REDIRECT_TO_GATE = [
  "/demo",
  "/dashboard",
  "/dashboard/employee",
  "/dashboard/coach",
  "/dashboard/hr",
  "/dashboard/leidinggevende",
  "/timeout/start/demo",
  "/run/demo",
  "/coach/demo",
  "/hr/demo",
];

function pathMatches(path: string): boolean {
  if (REDIRECT_TO_GATE.includes(path)) return true;
  if (path.startsWith("/demo/") || path.startsWith("/dashboard/") || path.startsWith("/timeout/run/demo") || path.startsWith("/run/demo/") || path.startsWith("/coach/demo/") || path.startsWith("/hr/demo/")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (pathMatches(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/demo",
    "/demo/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/timeout/start/demo",
    "/timeout/run/demo",
    "/timeout/run/demo/:path*",
    "/run/demo",
    "/run/demo/:path*",
    "/coach/demo",
    "/coach/demo/:path*",
    "/hr/demo",
    "/hr/demo/:path*",
  ],
};
