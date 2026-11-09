import { Types } from "mongoose";
import { Post, connectDB } from "@craft/db";
import { clientIp, json, rateLimit } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const postId = typeof body?.postId === "string" ? body.postId : "";
  if (!Types.ObjectId.isValid(postId)) return json({ ok: false }, 400);
  if (!rateLimit(`view:${clientIp(req)}:${postId}`, 1, 30 * 60_000)) return json({ ok: true });
  await connectDB();
  await Post.updateOne({ _id: postId }, { $inc: { views: 1 } });
  return json({ ok: true });
}
