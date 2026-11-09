import type { Metadata } from "next";
import Link from "next/link";
import { PostGrid } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { getAllCategories, getPopularPosts, getSettings, searchPosts } from "@/lib/data";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const s = await getSettings();
  const q = String((await searchParams).q ?? "").slice(0, 100);
  return buildMetadata(s, { title: q ? `Search: ${q}` : "Search crafts", path: "/search", noindex: true });
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = String(Array.isArray(sp.q) ? sp.q[0] : sp.q ?? "").slice(0, 100);
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const [settings, result, categories] = await Promise.all([getSettings(), searchPosts(q, page), getAllCategories()]);
  const popular = result.total === 0 ? await getPopularPosts(4) : [];

  return (
    <div className="container-x">
      <div className="listing-head">
        <span className="eyebrow">Search</span>
        <h1>{q ? <>Results for <span className="hl">&ldquo;{q}&rdquo;</span></> : <span className="hl">Find a craft</span>}</h1>
        <div className="mt-3">
          <SearchBar defaultValue={q} id="search-page-q" />
        </div>
      </div>
      <div className="pb-5 mb-4">
        {q && (
          <p className="small text-secondary mb-3" aria-live="polite">
            {result.total} {result.total === 1 ? "craft" : "crafts"} found
          </p>
        )}
        {result.posts.length > 0 ? (
          <>
            <PostGrid posts={result.posts} permalink={settings.permalink} />
            {result.totalPages > 1 && (
              <nav className="pagination-x" aria-label="Pagination">
                {page > 1 && <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}>← Prev</Link>}
                <span className="is-current">{page}</span>
                {page < result.totalPages && <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}>Next →</Link>}
              </nav>
            )}
          </>
        ) : (
          <>
            {q && (
              <div className="empty-state mb-5">
                <h2 className="h4">No crafts matched &ldquo;{q}&rdquo;</h2>
                <p className="mb-0">Try a simpler word like &ldquo;pumpkin&rdquo; or browse a craft type below.</p>
              </div>
            )}
            <div className="pill-row mb-5">
              {categories
                .filter((c) => c.facet === "craftType")
                .map((c) => (
                  <Link key={c._id} href={`/category/${c.slug}`} className="pill">
                    <span aria-hidden="true">{c.emoji}</span> {c.name}
                  </Link>
                ))}
            </div>
            {popular.length > 0 && (
              <>
                <h2 className="h3 mb-3">Popular right now</h2>
                <PostGrid posts={popular} permalink={settings.permalink} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
