import type { Metadata } from "next";
import type { PageDTO, PostDTO, SiteSettingsDTO } from "@craft/shared";
import { abs, buildMetadata, postHref } from "./site";

export function postMetadata(post: PostDTO, s: SiteSettingsDTO): Metadata {
  const path = postHref(post, s.permalink);
  const base = buildMetadata(s, {
    title: post.seo?.title || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    path,
    canonical: post.seo?.canonicalUrl,
    image: post.seo?.ogImage || post.featuredImage?.url,
    noindex: post.seo?.noindex,
    type: "article",
  });
  const author = post.author?.name || s.authorName || s.siteTitle;
  // Rich Pins read standard Open Graph article tags.
  return {
    ...base,
    authors: [{ name: author, url: abs("/about") }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [author],
      section: post.categories.find((c) => c.facet === "craftType")?.name,
      tags: post.tags.map((t) => t.name),
    },
    other: {
      "article:author": author,
      ...(post.publishedAt ? { "article:published_time": post.publishedAt } : {}),
      "pinterest-rich-pin": "true",
    },
  };
}

export function pageMetadata(page: PageDTO, s: SiteSettingsDTO, path: string): Metadata {
  return buildMetadata(s, {
    title: page.seo?.title || page.title,
    description: page.seo?.metaDescription,
    path,
    canonical: page.seo?.canonicalUrl,
    image: page.seo?.ogImage,
    noindex: page.seo?.noindex,
  });
}
