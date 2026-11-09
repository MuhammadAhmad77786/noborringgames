import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@craft/shared";

/** Edge/Node-safe JWT helpers (used by proxy.ts and server code). */

export const SESSION_COOKIE = "craft_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = { sub: string; role: Role; name: string; v: number };

function key() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("NEXTAUTH_SECRET must be set (min 16 chars)");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name, v: payload.v })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { sub: payload.sub, role: payload.role as Role, name: String(payload.name ?? ""), v: Number(payload.v ?? 0) };
  } catch {
    return null;
  }
}
