import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Legacy route /toegang redirect naar start (/). */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/toegang") {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.delete("next");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/toegang"],
};
