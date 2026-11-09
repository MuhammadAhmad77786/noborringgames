"use server";

import { Types } from "mongoose";
import { Category, Post, Tag, User, connectDB } from "@craft/db";
import { RESERVED_SLUGS, slugify, type ImageAsset, type PostStatus, type Printable, type SeoFields, type Supply } from "@craft/shared";
import { attempt, type ActionResult } from "@/lib/action-result";
import { ALL_ROLES, EDITORS, assertRole, type CurrentUser } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";
import { sanitizeContent } from "@/lib/sanitize";

export type PostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: ImageAsset | null;
  pinterestImage: ImageAsset | null;
  pinterestTitle: string;
  pinterestDescription: string;
  gallery: ImageAsset[];
  categories: string[];
  tags: string[]; // tag names
  author?: string;
  status: PostStatus;
  publishedAt?: string; // ISO
  ageRange: string;
  difficulty: string;
  timeNeeded: string;
  supplies: Supply[];
  printables: Printable[];
  isPick: boolean;
  seo: SeoFields;
};

async function canEdit(user: CurrentUser, postId: string) {
  if (user.role !== "author") return true;
  const post = await Post.findById(postId).select("author").lean();
  return !!post && String(post.author) === user.id;
}

function cleanImage(img: ImageAsset | null | undefined) {
  if (!img?.url) return undefined;
  return { url: img.url, public_id: img.public_id, alt: (img.alt ?? "").slice(0, 300), width: img.width, height: img.height };
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const clash = await Post.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
  throw new Error("Could not find a free slug");
}

export async function savePost(input: PostInput): Promise<ActionResult<{ id: string; slug: string }>> {
  return attempt(async () => {
    const user = await assertRole(ALL_ROLES);
    await connectDB();
    if (input.id && !(await canEdit(user, input.id))) throw new Error("You can only edit your own posts.");

    const title = input.title.trim();
    if (!title) throw new Error("A title is required.");
    const baseSlug = slugify(input.slug || title);
    if (!baseSlug) throw new Error("The slug can't be empty.");
    if (RESERVED_SLUGS.includes(baseSlug)) throw new Error(`"${baseSlug}" is reserved — please choose another slug.`);
    const slug = await uniqueSlug(baseSlug, input.id);

    // Images need alt text (accessibility + Pinterest).
    for (const [label, img] of [["Featured image", input.featuredImage], ["Pinterest image", input.pinterestImage]] as const) {
      if (img?.url && !img.alt?.trim()) throw new Error(`${label} needs alt text.`);
    }
    if (input.gallery.some((g) => g.url && !g.alt?.trim())) throw new Error("Every gallery image needs alt text.");

    const categoryIds = input.categories.filter(Types.ObjectId.isValid);
    const validCats = await Category.find({ _id: { $in: categoryIds } }).select("_id").lean();

    // Upsert tags by name.
    const tagIds: Types.ObjectId[] = [];
    for (const name of [...new Set(input.tags.map((t) => t.trim()).filter(Boolean))].slice(0, 20)) {
      const tslug = slugify(name);
      if (!tslug) continue;
      const tag = await Tag.findOneAndUpdate({ slug: tslug }, { $setOnInsert: { name, slug: tslug } }, { upsert: true, returnDocument: "after" }).lean();
      if (tag) tagIds.push(tag._id);
    }

    // Authors always own their posts; editors/admins may assign.
    let author = user.id;
    if (user.role !== "author" && input.author && Types.ObjectId.isValid(input.author)) {
      const exists = await User.exists({ _id: input.author });
      if (exists) author = input.author;
    }

    let publishedAt = input.publishedAt ? new Date(input.publishedAt) : undefined;
    if (publishedAt && Number.isNaN(publishedAt.getTime())) publishedAt = undefined;
    let status = input.status;
    if (status === "published" && !publishedAt) publishedAt = new Date();
    if (status === "scheduled") {
      if (!publishedAt) throw new Error("Pick a date and time to schedule this post.");
      if (publishedAt <= new Date()) status = "published";
    }
    if (status === "published" && publishedAt && publishedAt > new Date()) status = "scheduled";

    const doc = {
      title,
      slug,
      excerpt: input.excerpt.trim().slice(0, 500),
      content: sanitizeContent(input.content),
      featuredImage: cleanImage(input.featuredImage),
      pinterestImage: cleanImage(input.pinterestImage),
      pinterestTitle: input.pinterestTitle.trim().slice(0, 100),
      pinterestDescription: input.pinterestDescription.trim().slice(0, 500),
      gallery: input.gallery.map(cleanImage).filter(Boolean),
      categories: validCats.map((c) => c._id),
      tags: tagIds,
      author,
      status,
      publishedAt,
      ageRange: input.ageRange.trim().slice(0, 40),
      difficulty: input.difficulty || "Easy",
      timeNeeded: input.timeNeeded.trim().slice(0, 40),
      supplies: input.supplies
        .filter((s) => s.name.trim())
        .map((s) => ({ name: s.name.trim().slice(0, 200), affiliateUrl: /^https?:\/\//.test(s.affiliateUrl ?? "") ? s.affiliateUrl : undefined })),
      printables: input.printables
        .filter((p) => p.fileUrl)
        .map((p) => ({
          ...(p._id && Types.ObjectId.isValid(p._id) ? { _id: p._id } : {}),
          title: p.title.trim() || title,
          fileUrl: p.fileUrl,
          public_id: p.public_id,
          previewImage: cleanImage(p.previewImage),
          pages: Math.max(1, Number(p.pages) || 1),
          fileSize: Number(p.fileSize) || undefined,
          downloads: Number(p.downloads) || 0,
          requireEmail: !!p.requireEmail,
        })),
      isPick: user.role === "author" ? undefined : !!input.isPick,
      seo: {
        title: input.seo.title?.trim(),
        metaDescription: input.seo.metaDescription?.trim(),
        focusKeyword: input.seo.focusKeyword?.trim(),
        canonicalUrl: input.seo.canonicalUrl?.trim(),
        ogImage: input.seo.ogImage?.trim(),
        noindex: !!input.seo.noindex,
      },
    };
    if (doc.isPick === undefined) delete (doc as Partial<typeof doc>).isPick;

    let id = input.id;
    if (id) {
      // Keep download counters from the DB (the form copy may be stale).
      const existing = await Post.findById(id).select("printables").lean();
      for (const p of doc.printables) {
        const match = existing?.printables?.find((e) => "_id" in p && String(e._id) === String(p._id));
        if (match) p.downloads = match.downloads ?? 0;
      }
      await Post.updateOne({ _id: id }, { $set: doc });
    } else {
      const created = await Post.create(doc);
      id = String(created._id);
    }

    await revalidateSite({ all: true });
    return { id: id!, slug };
  });
}

export async function bulkPosts(ids: string[], action: "publish" | "draft" | "delete"): Promise<ActionResult<{ count: number }>> {
  return attempt(async () => {
    const user = await assertRole(ALL_ROLES);
    await connectDB();
    const valid = ids.filter(Types.ObjectId.isValid);
    const filter: Record<string, unknown> = { _id: { $in: valid } };
    if (user.role === "author") filter.author = user.id;
    let count = 0;
    if (action === "delete") {
      if (user.role === "author") {
        count = (await Post.deleteMany(filter)).deletedCount;
      } else {
        await assertRole(EDITORS);
        count = (await Post.deleteMany(filter)).deletedCount;
      }
    } else if (action === "publish") {
      count = (await Post.updateMany({ ...filter, publishedAt: { $exists: true, $ne: null } }, { $set: { status: "published" } })).modifiedCount;
      count += (await Post.updateMany({ ...filter, $or: [{ publishedAt: null }, { publishedAt: { $exists: false } }] }, { $set: { status: "published", publishedAt: new Date() } })).modifiedCount;
    } else {
      count = (await Post.updateMany(filter, { $set: { status: "draft" } })).modifiedCount;
    }
    await revalidateSite({ all: true });
    return { count };
  });
}
