/**
 * @file middleware.js
 * @description Next.js edge-compatible middleware enforcing session authentication
 * on protected routes and redirecting unauthenticated users to /login.
 */

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/interview",
  "/results",
  "/history",
  "/resume",
  "/profile",
];

const AUTH_PAGES = ["/login", "/signup"];

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || "ai-interview-coach-dev-secret-key-replace-in-production-2026";
  return new TextEncoder().encode(secret);
}

export default async function proxy(req) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("aic_session")?.value;

  let isValidSession = false;
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, getAuthSecret());
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // 1. Protected route accessed without valid session
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isValidSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth page (login/signup) accessed with an active session
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);
  if (isAuthPage && isValidSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interview/:path*",
    "/results/:path*",
    "/history/:path*",
    "/resume/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};
