/**
 * @file app/api/auth/signup/route.js
 * @description Registers a new candidate, stores hashed credentials, and issues an httpOnly session JWT.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { hashPassword, createSessionToken, getSessionCookieOptions } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";
import { AppError, toErrorResponse } from "@/lib/errors";

export async function POST(req) {
  try {
    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input data.";
      throw new AppError("INVALID_INPUT", firstError, 400);
    }

    const { name, email, password } = validation.data;

    // Check for existing user
    const existing = await query("SELECT id FROM dbo.users WHERE email = @email", { email });
    if (existing.recordset.length > 0) {
      throw new AppError("AUTH_DUPLICATE_EMAIL", "An account with this email already exists.", 409);
    }

    // Salt and hash password with bcrypt (12 rounds)
    const password_hash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Insert user into Azure SQL
    await query(
      `INSERT INTO dbo.users (id, name, email, password_hash)
       VALUES (@id, @name, @email, @password_hash)`,
      { id: userId, name, email, password_hash }
    );

    // Create session token and set httpOnly cookie
    const token = await createSessionToken({ id: userId, email, name });
    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions();
    cookieStore.set(cookieOptions.name, token, cookieOptions);

    return NextResponse.json(
      {
        user: { id: userId, name, email },
        message: "Account created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
