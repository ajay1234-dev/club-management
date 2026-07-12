import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { ROLE_VALUES } from "@/lib/constants/roles";
import { isRouteAllowed } from "@/lib/permissions";

const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
const protectedRoutes = ["/dashboard", "/api/private"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    isProtected &&
    token?.role &&
    ROLE_VALUES.includes(token.role as (typeof ROLE_VALUES)[number])
  ) {
    const role = token.role as (typeof ROLE_VALUES)[number];
    if (!isRouteAllowed(role, pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
};
