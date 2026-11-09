import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Types } from "mongoose";
import { Post, toPlain } from "@craft/db";
import type { ImageAsset, Printable, SeoFields, Supply } from "@craft/shared";
import { requireUser } from "@/lib/auth";
import type { PostInput } from "../actions";
import { PostEditor } from "../PostEditor";
import { loadEditorContext } from "../load";

export const metadata: Metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: PageProps<"/posts/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();
  const ctx = await loadEditorContext();
  const raw = await Post.findById(id).populate("tags", "name").lean();
  if (!raw) notFound();
  if (user.role === "author" && String(raw.author) !== user.id) redirect("/posts?denied=1");

  const p = toPlain<Record<string, unknown> & { tags: { name: string }[]; categories: string[] }>(raw);
  const initial: PostInput = {
    id,
    title: String(p.title ?? ""),
    slug: String(p.slug ?? ""),
    excerpt: String(p.excerpt ?? ""),
    content: String(p.content ?? ""),
    featuredImage: (p.featuredImage as ImageAsset) ?? null,
    pinterestImage: (p.pinterestImage as ImageAsset) ?? null,
    pinterestTitle: String(p.pinterestTitle ?? ""),
    pinterestDescription: String(p.pinterestDescription ?? ""),
    gallery: (p.gallery as ImageAsset[]) ?? [],
    categories: (p.categories ?? []).map(String),
    tags: (p.tags ?? []).map((t) => t.name),
    author: p.author ? String(p.author) : undefined,
    status: (p.status as PostInput["status"]) ?? "draft",
    publishedAt: (p.publishedAt as string) ?? undefined,
    ageRange: String(p.ageRange ?? ""),
    difficulty: String(p.difficulty ?? "Easy"),
    timeNeeded: String(p.timeNeeded ?? ""),
    supplies: (p.supplies as Supply[]) ?? [],
    printables: (p.printables as Printable[]) ?? [],
    isPick: !!p.isPick,
    seo: (p.seo as SeoFields) ?? {},
  };

  return <PostEditor initial={initial} ctx={ctx} role={user.role} />;
}
