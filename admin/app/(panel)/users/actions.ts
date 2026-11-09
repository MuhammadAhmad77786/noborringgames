"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { User, connectDB } from "@craft/db";
import { ROLES, type ImageAsset, type Role } from "@craft/shared";
import { attempt, type ActionResult } from "@/lib/action-result";
import { ADMINS, assertRole, getCurrentUser } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";

export type UserInput = {
  id?: string;
  name: string;
  email: string;
  role: Role;
  bio: string;
  avatar: ImageAsset | null;
  socialLinks: { website?: string; pinterest?: string; instagram?: string; facebook?: string };
  active: boolean;
  password?: string;
};

function checkPassword(pw: string) {
  if (pw.length < 10) throw new Error("Passwords need at least 10 characters.");
}

export async function saveUser(input: UserInput): Promise<ActionResult<{ id: string; tempPassword?: string }>> {
  return attempt(async () => {
    const me = await assertRole(ADMINS);
    await connectDB();
    const email = input.email.trim().toLowerCase();
    if (!input.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Name and a valid email are required.");
    if (!ROLES.includes(input.role)) throw new Error("Invalid role.");
    if (input.id === me.id && (input.role !== "admin" || !input.active)) {
      throw new Error("You can't demote or deactivate your own account.");
    }

    const doc = {
      name: input.name.trim(),
      email,
      role: input.role,
      bio: input.bio.trim().slice(0, 1000),
      avatar: input.avatar?.url ? input.avatar : undefined,
      socialLinks: input.socialLinks,
      active: input.active,
    };

    if (input.id) {
      const before = await User.findById(input.id).select("active role").lean();
      const update: Record<string, unknown> = { ...doc };
      // Deactivation or a role change ends existing sessions.
      const inc = before && (before.active !== input.active || before.role !== input.role) ? { sessionVersion: 1 } : undefined;
      await User.updateOne({ _id: input.id }, { $set: update, ...(inc ? { $inc: inc } : {}) });
      await revalidateSite({ all: true });
      return { id: input.id };
    }

    // New user: use the given password or generate a temporary one to share.
    let tempPassword: string | undefined;
    let pw = input.password?.trim() ?? "";
    if (!pw) {
      pw = randomBytes(9).toString("base64url");
      tempPassword = pw;
    }
    checkPassword(pw);
    const created = await User.create({ ...doc, passwordHash: await bcrypt.hash(pw, 12) });
    return { id: String(created._id), tempPassword };
  });
}

/** Admin resets someone's password; returns the new temporary password once. */
export async function resetPassword(id: string, newPassword?: string): Promise<ActionResult<{ tempPassword: string }>> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    const pw = newPassword?.trim() || randomBytes(9).toString("base64url");
    checkPassword(pw);
    await User.updateOne({ _id: id }, { $set: { passwordHash: await bcrypt.hash(pw, 12) }, $inc: { sessionVersion: 1 } });
    return { tempPassword: pw };
  });
}

/** Any logged-in user can change their own password. */
export async function changeOwnPassword(current: string, next: string): Promise<ActionResult> {
  return attempt(async () => {
    const me = await getCurrentUser();
    if (!me) throw new Error("Not logged in.");
    checkPassword(next);
    await connectDB();
    const user = await User.findById(me.id).select("+passwordHash");
    if (!user || !(await bcrypt.compare(current, user.passwordHash))) throw new Error("Current password is incorrect.");
    user.passwordHash = await bcrypt.hash(next, 12);
    await user.save();
    return {};
  });
}
