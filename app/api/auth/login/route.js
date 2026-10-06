/**
 * @file app/api/auth/login/route.js
 * @description Authenticates an existing user and establishes an httpOnly session cookie.
 * Features timing-safe password comparison to prevent user enumeration attacks.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { verifyPassword, createSessionToken, getSessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { AppError, toErrorResponse } from "@/lib/errors";

// Pre-computed dummy hash to prevent timing attacks when an email does not exist
const DUMMY_HASH = "$2a$12$e8Y2lY3mG2s5eXgR3yF/3uqz9j2q8V8K2G7z.5uU9n7qE3w6tZ7xK";

export async function POST(req) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      throw new AppError("AUTH_INVALID_CREDENTIALS", "Invalid email or password.", 401);
    }

    const { email, password } = validation.data;

    // Look up user by email
    const result = await query("SELECT id, name, email, password_hash FROM dbo.users WHERE email = @email", {
      email,
    });

    const user = result.recordset[0];
    const hashToVerify = user ? user.password_hash : DUMMY_HASH;
    const isValid = await verifyPassword(password, hashToVerify);

    if (!user || !isValid) {
      throw new AppError("AUTH_INVALID_CREDENTIALS", "Invalid email or password.", 401);
    }

    // Generate session JWT
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Set secure httpOnly cookie
    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions();
    cookieStore.set(cookieOptions.name, token, cookieOptions);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "Logged in successfully.",
    });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
