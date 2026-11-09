"use server";

import { Comment, connectDB } from "@craft/db";
import { COMMENT_STATUSES, type CommentStatus } from "@craft/shared";
import { attempt, type ActionResult } from "@/lib/action-result";
import { EDITORS, assertRole } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";

/** Only approved comments are public, so the site refreshes when that set changes. */
export async function setCommentStatus(id: string, status: CommentStatus): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(EDITORS);
    if (!COMMENT_STATUSES.includes(status)) throw new Error("Invalid status");
    await connectDB();
    const before = await Comment.findByIdAndUpdate(id, { $set: { status } }).select("status").lean();
    if (before?.status === "approved" || status === "approved") await revalidateSite({ all: true });
    return {};
  });
}

export async function deleteComment(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(EDITORS);
    await connectDB();
    const removed = await Comment.findByIdAndDelete(id).select("status").lean();
    if (removed?.status === "approved") await revalidateSite({ all: true });
    return {};
  });
}
