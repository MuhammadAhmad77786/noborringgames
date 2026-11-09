import "server-only";
import { Category, User, connectDB, getSiteSettingsDoc } from "@craft/db";
import type { Facet } from "@craft/shared";

export type EditorContext = {
  categories: { id: string; name: string; facet: Facet; emoji?: string; slug: string }[];
  authors: { id: string; name: string }[];
  siteUrl: string;
  siteTitle: string;
  titleTemplate: string;
  permalink: "post" | "category-post";
};

export async function loadEditorContext(): Promise<EditorContext> {
  await connectDB();
  const [cats, users, settings] = await Promise.all([
    Category.find().sort({ facet: 1, sortOrder: 1, name: 1 }).select("name facet emoji slug").lean(),
    User.find({ active: true }).select("name").sort({ name: 1 }).lean(),
    getSiteSettingsDoc(),
  ]);
  return {
    categories: cats.map((c) => ({ id: String(c._id), name: c.name, facet: c.facet as Facet, emoji: c.emoji ?? undefined, slug: c.slug })),
    authors: users.map((u) => ({ id: String(u._id), name: u.name })),
    siteUrl: (process.env.SITE_URL ?? "").replace(/\/$/, ""),
    siteTitle: settings?.siteTitle ?? "",
    titleTemplate: settings?.titleTemplate ?? "%title% | %site%",
    permalink: (settings?.permalink as "post" | "category-post") ?? "post",
  };
}
