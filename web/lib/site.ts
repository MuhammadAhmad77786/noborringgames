import type { Metadata } from "next";
import {
  absoluteUrl,
  applyTitleTemplate,
  categoryPath,
  cldOg,
  isCloudinaryUrl,
  postPath,
  type Permalink,
  type SiteSettingsDTO,
} from "@craft/shared";

export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function abs(path: string): string {
  return absoluteUrl(siteUrl(), path);
}

/** The post's URL under the configured permalink structure. */
export function postHref(
  post: { slug: string; categories?: { slug: string; facet?: string }[] },
  permalink: Permalink,
): string {
  // Primary category = first craft-type category, else the first category.
  const primary =
    post.categories?.find((c) => c.facet === "craftType")?.slug ?? post.categories?.[0]?.slug ?? null;
  return postPath({ slug: post.slug, primaryCategorySlug: primary }, permalink);
}

export { categoryPath };

export function ogImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const full = url.startsWith("http") ? url : abs(url);
  return isCloudinaryUrl(full) ? cldOg(full) : full;
}

/** Builds Next metadata from per-item SEO fields with SiteSettings fallbacks. */
export function buildMetadata(
  settings: SiteSettingsDTO,
  opts: {
    title: string;
    description?: string;
    path: string;
    canonical?: string;
    image?: string | null;
    noindex?: boolean;
    type?: "website" | "article";
    rawTitle?: boolean;
  },
): Metadata {
  const title = opts.rawTitle
    ? opts.title
    : applyTitleTemplate(opts.title, settings.titleTemplate || "%title% | %site%", settings.siteTitle);
  const description = opts.description || settings.defaultMetaDescription || settings.tagline || "";
  const image = ogImageUrl(opts.image || settings.defaultOgImage?.url);
  const canonical = opts.canonical || abs(opts.path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: opts.type ?? "website",
      title,
      description,
      url: canonical,
      siteName: settings.siteTitle,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
