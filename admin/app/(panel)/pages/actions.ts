"use server";

import { Page, connectDB } from "@craft/db";
import { slugify, type SeoFields } from "@craft/shared";
import { attempt, type ActionResult } from "@/lib/action-result";
import { ADMINS, assertRole } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";
import { sanitizeContent } from "@/lib/sanitize";

export type PageInput = { id?: string; title: string; slug: string; content: string; seo: SeoFields };

export async function savePage(input: PageInput): Promise<ActionResult<{ id: string }>> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    const title = input.title.trim();
    if (!title) throw new Error("Title is required.");
    const slug = slugify(input.slug || title);
    const doc = {
      title,
      slug,
      content: sanitizeContent(input.content),
      seo: {
        title: input.seo.title?.trim(),
        metaDescription: input.seo.metaDescription?.trim(),
        canonicalUrl: input.seo.canonicalUrl?.trim(),
        ogImage: input.seo.ogImage?.trim(),
        noindex: !!input.seo.noindex,
      },
    };
    let id = input.id;
    if (id) await Page.updateOne({ _id: id }, { $set: doc });
    else id = String((await Page.create(doc))._id);
    await revalidateSite({ all: true });
    return { id: id! };
  });
}

export async function deletePage(id: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    await Page.deleteOne({ _id: id });
    await revalidateSite({ all: true });
    return {};
  });
}
