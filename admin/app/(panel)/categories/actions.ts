"use server";

import { Types } from "mongoose";
import { Category, Post, Tag, connectDB } from "@craft/db";
import { FACETS, slugify, type Facet, type ImageAsset } from "@craft/shared";
import { attempt, type ActionResult } from "@/lib/action-result";
import { EDITORS, assertRole } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";

export type CategoryInput = {
  id?: string;
  name: string;
  slug: string;
  facet: Facet;
  description: string;
  emoji: string;
  cardColor: string;
  image: ImageAsset | null;
  parentCategory: string;
  showInNavbar: boolean;
  showInFooter: boolean;
  sortOrder: number;
  seo: { title?: string; metaDescription?: string };
};

export async function saveCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  return attempt(async () => {
    await assertRole(EDITORS);
    await connectDB();
    const name = input.name.trim();
    if (!name) throw new Error("Name is required.");
    if (!FACETS.includes(input.facet)) throw new Error("Pick a facet.");
    const slug = slugify(input.slug || name);
    const clash = await Category.exists({ slug, ...(input.id ? { _id: { $ne: input.id } } : {}) });
    if (clash) throw new Error(`Another category already uses the slug "${slug}".`);
    if (input.image?.url && !input.image.alt?.trim()) throw new Error("The category image needs alt text.");

    const doc = {
      name,
      slug,
      facet: input.facet,
      description: input.description.trim().slice(0, 600),
      emoji: input.emoji.trim().slice(0, 8),
      cardColor: /^#[0-9a-f]{6}$/i.test(input.cardColor) ? input.cardColor : "#FDE3D3",
      image: input.image?.url ? input.image : undefined,
      parentCategory: Types.ObjectId.isValid(input.parentCategory) && input.parentCategory !== input.id ? input.parentCategory : null,
      showInNavbar: !!input.showInNavbar,
      showInFooter: !!input.showInFooter,
      sortOrder: Number(input.sortOrder) || 0,
      seo: { title: input.seo.title?.trim(), metaDescription: input.seo.metaDescription?.trim() },
    };
    let id = input.id;
    if (id) await Category.updateOne({ _id: id }, { $set: doc });
    else id = String((await Category.create(doc))._id);
    await revalidateSite({ all: true });
    return { id: id! };
  });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(EDITORS);
    await connectDB();
    await Post.updateMany({ categories: id }, { $pull: { categories: id } });
    await Category.deleteOne({ _id: id });
    await revalidateSite({ all: true });
    return {};
  });
}

export async function saveTag(input: { id?: string; name: string; slug?: string }): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(EDITORS);
    await connectDB();
    const name = input.name.trim();
    if (!name) throw new Error("Name is required.");
    const slug = slugify(input.slug || name);
    if (input.id) await Tag.updateOne({ _id: input.id }, { $set: { name, slug } });
    else await Tag.create({ name, slug });
    await revalidateSite({ all: true });
    return {};
  });
}

export async function deleteTag(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(EDITORS);
    await connectDB();
    await Post.updateMany({ tags: id }, { $pull: { tags: id } });
    await Tag.deleteOne({ _id: id });
    await revalidateSite({ all: true });
    return {};
  });
}
