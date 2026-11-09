"use server";

import { Subscriber, connectDB } from "@craft/db";
import { attempt, type ActionResult } from "@/lib/action-result";
import { ADMINS, assertRole } from "@/lib/auth";

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    await Subscriber.deleteOne({ _id: id });
    return {};
  });
}
