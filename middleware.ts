import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Redirect legacy routes to gate (clean single-purpose app). */
function pathMatches(path: string): boolean {
  return (
    path.startsWith("/demo") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/timeout") ||
    path.startsWith("/run/demo") ||
    path.startsWith("/coach/demo") ||
    path.startsWith("/hr/demo") ||
    path.startsWith("/start/demo")
  );
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
  matcher: ["/demo/:path*", "/dashboard/:path*", "/timeout/:path*", "/run/demo/:path*", "/coach/demo/:path*", "/hr/demo/:path*", "/start/demo/:path*"],
};
