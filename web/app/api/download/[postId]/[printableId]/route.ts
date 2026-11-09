import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { Post, connectDB } from "@craft/db";
import { cldAttachment, slugify } from "@craft/shared";
import { verifyDownload } from "@/lib/api";
import { abs } from "@/lib/site";

/** Counts the download and redirects to the PDF on Cloudinary. */
export async function GET(req: Request, ctx: RouteContext<"/api/download/[postId]/[printableId]">) {
  const { postId, printableId } = await ctx.params;
  if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(printableId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectDB();
  const post = await Post.findOne(
    { _id: postId, "printables._id": printableId, status: { $in: ["published", "scheduled"] } },
    { slug: 1, "printables.$": 1 },
  ).lean();
  const printable = post?.printables?.[0];
  if (!post || !printable) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (printable.requireEmail) {
    const token = new URL(req.url).searchParams.get("t");
    if (!verifyDownload(postId, printableId, token)) {
      // Send them back to the gate form on the post.
      return NextResponse.redirect(abs(`/${post.slug}#printable`), 302);
    }
  }

  await Post.updateOne({ _id: postId, "printables._id": printableId }, { $inc: { "printables.$.downloads": 1 } });

  const target = printable.fileUrl.startsWith("http") ? printable.fileUrl : abs(printable.fileUrl);
  const res = NextResponse.redirect(cldAttachment(target, slugify(printable.title)), 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}
