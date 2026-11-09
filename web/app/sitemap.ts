import type { MetadataRoute } from "next";
import { getSettings, getSitemapData } from "@/lib/data";
import { abs, postHref } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, data] = await Promise.all([getSettings(), getSitemapData()]);
  const newest = data.posts.reduce<string | undefined>((max, p) => (!max || p.updatedAt > max ? p.updatedAt : max), undefined);

  return [
    { url: abs("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: abs("/crafts"), lastModified: newest, changeFrequency: "daily", priority: 0.8 },
    { url: abs("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/contact"), changeFrequency: "yearly", priority: 0.3 },
    ...data.posts.map((p) => ({
      url: abs(postHref({ slug: p.slug, categories: p.categories }, settings.permalink)),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...data.categories.map((c) => ({
      url: abs(`/category/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...data.pages
      .filter((p) => !["about", "contact"].includes(p.slug))
      .map((p) => ({ url: abs(`/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
