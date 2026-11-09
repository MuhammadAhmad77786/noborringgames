import { NextResponse } from "next/server";
import { Post, connectDB } from "@craft/db";
import { revalidateSite } from "@/lib/revalidate";

/**
 * Flips due scheduled posts to "published" and refreshes the public site.
 * Hit hourly by Vercel Cron (see admin/vercel.json), which sends
 * `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const res = await Post.updateMany({ status: "scheduled", publishedAt: { $lte: new Date() } }, { $set: { status: "published" } });
  if (res.modifiedCount > 0) await revalidateSite({ all: true });
  return NextResponse.json({ published: res.modifiedCount });
}
