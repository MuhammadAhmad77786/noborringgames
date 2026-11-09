import type { Metadata } from "next";
import { Post, Tag } from "@craft/db";
import { EDITORS, requireUser } from "@/lib/auth";
import { TagsManager } from "./TagsManager";

export const metadata: Metadata = { title: "Tags" };
export const dynamic = "force-dynamic";

export default async function TagsPage() {
  await requireUser(EDITORS);
  const [tags, counts] = await Promise.all([
    Tag.find().sort({ name: 1 }).lean(),
    Post.aggregate<{ _id: unknown; n: number }>([{ $unwind: "$tags" }, { $group: { _id: "$tags", n: { $sum: 1 } } }]),
  ]);
  const rows = tags.map((t) => ({
    id: String(t._id),
    name: t.name,
    slug: t.slug,
    count: counts.find((c) => String(c._id) === String(t._id))?.n ?? 0,
  }));
  return (
    <>
      <h1 className="page-title mb-3">Tags</h1>
      <TagsManager rows={rows} />
    </>
  );
}
