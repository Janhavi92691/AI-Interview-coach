/**
 * @file lib/auth.js
 * @description Explainable authentication module using bcryptjs for salted hashing
 * and jose for HS256-signed session JWTs stored in httpOnly cookies.
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { AppError } from "./errors.js";

export const SESSION_COOKIE_NAME = "aic_session";
const SESSION_EXPIRY = "7d";
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Returns the secret key for signing JWTs as a Uint8Array.
 * @returns {Uint8Array}
 */
function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || "ai-interview-coach-dev-secret-key-replace-in-production-2026";
  return new TextEncoder().encode(secret);
}

/**
 * Hashes a plaintext password with bcrypt (12 rounds).
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new AppError("INVALID_INPUT", "Password must be at least 8 characters long.", 400);
  }
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Timing-safe password verification.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Creates and signs a session JWT with HS256.
 * @param {{ id: string, email: string, name: string }} user
 * @returns {Promise<string>}
 */
export async function createSessionToken(user) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(getAuthSecret());
}

/**
 * Verifies a session JWT and returns the decoded payload, or null if invalid/expired.
 * @param {string} token
 * @returns {Promise<{ sub: string, email: string, name: string } | null>}
 */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

/**
 * Returns standard cookie configuration for the session token.
 * @returns {import("next/dist/server/web/types").ResponseCookie}
 */
export function getSessionCookieOptions(maxAgeSeconds = 7 * 24 * 60 * 60) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * Retrieves the current authenticated user from request cookies or headers.
 * Throws AppError(UNAUTHORIZED) if requireAuth is true and user is missing.
 *
 * @param {{ requireAuth?: boolean }} [options]
 * @returns {Promise<{ id: string, email: string, name: string } | null>}
 */
export async function getCurrentUser(options = { requireAuth: false }) {
  try {
    let cookieStore;
    try {
      const nextHeaders = await import("next/headers");
      cookieStore = await nextHeaders.cookies();
    } catch {
      if (options.requireAuth) {
        throw new AppError("UNAUTHORIZED", "You must be logged in to access this resource.", 401);
      }
      return null;
    }

    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      if (options.requireAuth) {
        throw new AppError("UNAUTHORIZED", "You must be logged in to access this resource.", 401);
      }
      return null;
    }

    const payload = await verifySessionToken(sessionCookie.value);
    if (!payload || !payload.sub) {
      if (options.requireAuth) {
        throw new AppError("UNAUTHORIZED", "Your session has expired. Please log in again.", 401);
      }
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (options.requireAuth) {
      throw new AppError("UNAUTHORIZED", "Authentication verification failed.", 401, error);
    }
    return null;
  }
}
