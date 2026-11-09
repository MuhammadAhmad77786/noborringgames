import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FACET_EYEBROWS } from "@craft/shared";
import { ListingView, parseListingParams } from "@/components/Listing";
import { getAllCategories, getCategoryBySlug, getSettings, listPosts } from "@/lib/data";
import { JsonLd, breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata({ params, searchParams }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [s, cat] = await Promise.all([getSettings(), getCategoryBySlug(slug)]);
  if (!cat) return {};
  const { filters, page } = parseListingParams(await searchParams);
  return buildMetadata(s, {
    title: (cat.seo?.title || `${cat.name} Crafts & Printables`) + (page > 1 ? ` — Page ${page}` : ""),
    description: cat.seo?.metaDescription || cat.description,
    path: `/category/${cat.slug}${page > 1 ? `?page=${page}` : ""}`,
    image: cat.image?.url,
    noindex: filters.length > 0,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();
  const { filters, page } = parseListingParams(await searchParams);
  const [settings, categories] = await Promise.all([getSettings(), getAllCategories()]);
  const filterIds = categories.filter((c) => filters.includes(c.slug) && c._id !== cat._id).map((c) => c._id);
  const result = await listPosts({ requiredCategoryIds: [cat._id, ...filterIds], page });

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Crafts", path: "/crafts" },
          { name: cat.name, path: `/category/${cat.slug}` },
        ])}
      />
      <ListingView
        eyebrow={`${cat.emoji ? `${cat.emoji} ` : ""}${FACET_EYEBROWS[cat.facet]}`}
        title={`${cat.name} crafts`}
        highlight={cat.name}
        description={cat.description}
        base={`/category/${cat.slug}`}
        categories={categories}
        activeFilters={filters}
        excludeFacet={cat.facet}
        excludeId={cat._id}
        posts={result.posts}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        permalink={settings.permalink}
      />
    </>
  );
}
