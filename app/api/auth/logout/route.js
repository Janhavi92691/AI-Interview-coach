/**
 * @file app/api/auth/logout/route.js
 * @description Invalidates the current user session by clearing the httpOnly cookie.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const options = getSessionCookieOptions(0); // Max-Age 0 clears the cookie
  cookieStore.set(options.name, "", options);

  return NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
}
