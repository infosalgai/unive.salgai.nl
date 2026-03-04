import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Legacy / overbodige routes die naar start (/) redirecten. */
const LEGACY_EXACT = ["/toegang"] as const;
const LEGACY_PREFIXES = [
  "/demo",
  "/dashboard",
  "/timeout",
  "/run/demo",
  "/coach/demo",
  "/hr/demo",
  "/start/demo",
] as const;

function isLegacyPath(path: string): boolean {
  if (LEGACY_EXACT.includes(path as (typeof LEGACY_EXACT)[number])) return true;
  return LEGACY_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  if (!isLegacyPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.delete("next");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    ...LEGACY_EXACT,
    ...LEGACY_PREFIXES.map((p) => `${p}/:path*`),
  ],
};
