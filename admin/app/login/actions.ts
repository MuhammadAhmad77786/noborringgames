"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { User, connectDB } from "@craft/db";
import { createSession, destroySession } from "@/lib/auth";

let dummyHash: string | undefined;

// Per-instance throttle: 8 attempts / 15 min per IP+email.
const attempts = new Map<string, { n: number; reset: number }>();
function throttled(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.reset < now) {
    attempts.set(key, { n: 1, reset: now + 15 * 60_000 });
    return false;
  }
  a.n++;
  return a.n > 8;
}

export type LoginState = { error: string; email?: string };

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const nextRaw = String(form.get("next") ?? "/");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  if (!email || !password) return { error: "Enter your email and password.", email };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(`${ip}:${email}`)) return { error: "Too many attempts. Try again in 15 minutes.", email };

  await connectDB();
  const user = await User.findOne({ email }).select("+passwordHash name role active sessionVersion");
  // Compare against a dummy hash when the user doesn't exist to keep timing similar.
  dummyHash ??= await bcrypt.hash("timing-equaliser", 12);
  const hash = user?.passwordHash ?? dummyHash;
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) return { error: "That email and password don't match.", email };
  if (!user.active) return { error: "This account has been deactivated.", email };

  user.lastLoginAt = new Date();
  await user.save();
  await createSession({ id: String(user._id), role: user.role as "admin", name: user.name, sessionVersion: user.sessionVersion ?? 0 });
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
