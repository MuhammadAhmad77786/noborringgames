import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, connectDB } from "@craft/db";
import type { Role } from "@craft/shared";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

export type CurrentUser = { id: string; name: string; email: string; role: Role; avatar?: string };

export async function createSession(user: { id: string; role: Role; name: string; sessionVersion: number }) {
  const token = await signSession({ sub: user.id, role: user.role, name: user.name, v: user.sessionVersion });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Verifies the session cookie AND re-checks the user in the database
 * (still active, same session version), so deactivation or a password
 * reset logs the user out immediately.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  await connectDB();
  const user = await User.findById(session.sub).select("name email role active sessionVersion avatar").lean();
  if (!user || !user.active || (user.sessionVersion ?? 0) !== session.v) return null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as Role,
    avatar: user.avatar?.url ?? undefined,
  };
});

/** Use in every page and server action. Redirects to /login when not allowed. */
export async function requireUser(roles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/?denied=1");
  return user;
}

/** For server actions that return errors instead of redirecting. */
export async function assertRole(roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Your session has expired. Please log in again.");
  if (!roles.includes(user.role)) throw new Error("You don't have permission to do that.");
  return user;
}

export const ALL_ROLES: Role[] = ["admin", "editor", "author"];
export const EDITORS: Role[] = ["admin", "editor"];
export const ADMINS: Role[] = ["admin"];
