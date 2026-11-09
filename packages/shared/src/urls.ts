import type { Permalink } from "./constants";

export function postPath(
  post: { slug: string; primaryCategorySlug?: string | null },
  permalink: Permalink = "post",
): string {
  if (permalink === "category-post" && post.primaryCategorySlug) {
    return `/${post.primaryCategorySlug}/${post.slug}`;
  }
  return `/${post.slug}`;
}

export function categoryPath(slug: string): string {
  return `/category/${slug}`;
}

export function absoluteUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
