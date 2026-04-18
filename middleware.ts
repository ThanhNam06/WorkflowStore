import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-geo-country") ||
    request.headers.get("x-country") ||
    "US";

  res.cookies.set("COUNTRY_CODE", country.toUpperCase(), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
