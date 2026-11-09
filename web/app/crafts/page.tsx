import type { Metadata } from "next";
import { ListingView, parseListingParams } from "@/components/Listing";
import { getAllCategories, getSettings, listPosts } from "@/lib/data";
import { JsonLd, breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata({ searchParams }: PageProps<"/crafts">): Promise<Metadata> {
  const s = await getSettings();
  const { filters, page } = parseListingParams(await searchParams);
  const meta = buildMetadata(s, {
    title: page > 1 ? `All Printable Crafts — Page ${page}` : "All Printable Crafts",
    description: `Every free printable craft on ${s.siteTitle}: coloring pages, paper crafts, templates and seasonal projects for kids, classrooms and grown-ups.`,
    path: page > 1 ? `/crafts?page=${page}` : "/crafts",
    // Filtered combinations are thin duplicates of category pages.
    noindex: filters.length > 0,
  });
  return meta;
}

export default async function CraftsPage({ searchParams }: PageProps<"/crafts">) {
  const { filters, page } = parseListingParams(await searchParams);
  const [settings, categories] = await Promise.all([getSettings(), getAllCategories()]);
  const ids = categories.filter((c) => filters.includes(c.slug)).map((c) => c._id);
  const result = await listPosts({ requiredCategoryIds: ids, page });

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "All crafts", path: "/crafts" }])} />
      <ListingView
        eyebrow="The whole craft closet"
        title="All crafts"
        highlight="crafts"
        description="Every printable, template and project in one place. Use the chips to narrow it down by who's crafting, the season, or the type of craft."
        base="/crafts"
        categories={categories}
        activeFilters={filters}
        posts={result.posts}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        permalink={settings.permalink}
      />
    </>
  );
}
