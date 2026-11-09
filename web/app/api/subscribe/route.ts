import { after } from "next/server";
import { Types } from "mongoose";
import { Post, Subscriber, connectDB } from "@craft/db";
import { clientIp, isEmail, json, rateLimit, signDownload, str } from "@/lib/api";
import { syncSubscriberToProvider } from "@/lib/email-provider";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);
  // Honeypot: bots fill hidden fields. Pretend success.
  if (str(body.website, 200)) return json({ ok: true });
  if (!rateLimit(`sub:${clientIp(req)}`, 8, 60_000)) return json({ error: "Too many attempts, try again in a minute." }, 429);

  const email = str(body.email, 200).toLowerCase();
  if (!isEmail(email)) return json({ error: "Please enter a valid email address." }, 400);
  const firstName = str(body.firstName, 80);
  const source = body.source === "printable" ? "printable" : "newsletter";

  await connectDB();

  let downloadUrl: string | undefined;
  let postRef: Types.ObjectId | undefined;
  if (source === "printable") {
    const postId = str(body.postId, 40);
    const printableId = str(body.printableId, 40);
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(printableId)) {
      return json({ error: "Unknown printable." }, 400);
    }
    const post = await Post.findOne({ _id: postId, "printables._id": printableId }).select("_id").lean();
    if (!post) return json({ error: "Unknown printable." }, 404);
    postRef = post._id;
    downloadUrl = `/api/download/${postId}/${printableId}?t=${encodeURIComponent(signDownload(postId, printableId))}`;
  }

  const sub = await Subscriber.findOneAndUpdate(
    { email },
    {
      $setOnInsert: { email, source, ...(postRef ? { post: postRef } : {}) },
      ...(firstName ? { $set: { firstName } } : {}),
    },
    { upsert: true, returnDocument: "after" },
  ).lean();

  if (sub && !sub.syncedAt) {
    after(() => syncSubscriberToProvider({ _id: sub._id, email: sub.email, firstName: sub.firstName }));
  }

  return json({ ok: true, downloadUrl });
}
