import { Types } from "mongoose";
import { Comment, Post, connectDB } from "@craft/db";
import { clientIp, isEmail, json, rateLimit, str } from "@/lib/api";

/** New comments are always held for moderation in the admin queue. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);
  if (str(body.website, 200)) return json({ ok: true }); // honeypot
  const ip = clientIp(req);
  if (!rateLimit(`cmt:${ip}`, 4, 60_000)) return json({ error: "Slow down a little and try again in a minute." }, 429);

  const postId = str(body.postId, 40);
  const name = str(body.name, 80);
  const email = str(body.email, 200).toLowerCase();
  const text = str(body.body, 4000);
  if (!Types.ObjectId.isValid(postId)) return json({ error: "Unknown post." }, 400);
  if (!name || !text) return json({ error: "Please add your name and a comment." }, 400);
  if (!isEmail(email)) return json({ error: "Please enter a valid email address." }, 400);
  // Simple link-spam heuristic: too many URLs goes straight to spam.
  const links = (text.match(/https?:\/\//gi) ?? []).length;

  await connectDB();
  const exists = await Post.exists({ _id: postId, status: { $in: ["published", "scheduled"] } });
  if (!exists) return json({ error: "Unknown post." }, 404);

  await Comment.create({ post: postId, name, email, body: text, ip, status: links > 2 ? "spam" : "pending" });
  return json({ ok: true });
}
