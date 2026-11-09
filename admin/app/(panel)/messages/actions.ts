"use server";

import { ContactMessage, connectDB } from "@craft/db";
import { attempt, type ActionResult } from "@/lib/action-result";
import { ADMINS, assertRole } from "@/lib/auth";

export async function markMessage(id: string, read: boolean): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    await ContactMessage.updateOne({ _id: id }, { $set: { read } });
    return {};
  });
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    await ContactMessage.deleteOne({ _id: id });
    return {};
  });
}
