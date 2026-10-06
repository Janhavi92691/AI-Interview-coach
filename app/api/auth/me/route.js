/**
 * @file app/api/auth/me/route.js
 * @description Returns the currently authenticated user's profile, or null if unauthenticated.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser({ requireAuth: false });
  return NextResponse.json({ user });
}
