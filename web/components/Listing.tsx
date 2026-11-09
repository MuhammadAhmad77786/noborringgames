import Link from "next/link";
import { FACET_LABELS, FACETS, type CategoryDTO, type Facet, type Permalink, type PostCardDTO } from "@craft/shared";
import { PostGrid } from "./PostCard";
import { Highlighted } from "./SectionHeading";

function buildHref(base: string, filters: string[], page?: number) {
  const params = new URLSearchParams();
  if (filters.length) params.set("with", filters.join(","));
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function FilterChips({
  base,
  categories,
  active,
  excludeFacet,
  excludeId,
}: {
  base: string;
  categories: CategoryDTO[];
  active: string[];
  excludeFacet?: Facet;
  excludeId?: string;
}) {
  const facets = FACETS.filter((f) => f !== excludeFacet);
  return (
    <div className="mt-4" aria-label="Filter crafts">
      {facets.map((facet) => {
        const cats = categories.filter((c) => c.facet === facet && c._id !== excludeId);
        if (!cats.length) return null;
        return (
          <div className="filter-row" key={facet}>
            <span className="filter-row-label">{FACET_LABELS[facet]}</span>
            {cats.map((c) => {
              const on = active.includes(c.slug);
              // One active chip per facet: picking a chip replaces others in that facet.
              const sameFacet = categories.filter((x) => x.facet === facet).map((x) => x.slug);
              const next = on ? active.filter((s) => s !== c.slug) : [...active.filter((s) => !sameFacet.includes(s)), c.slug];
              return (
                <Link
                  key={c._id}
                  href={buildHref(base, next)}
                  className={`chip ${on ? "is-active" : ""}`}
                  aria-pressed={on}
                  rel="nofollow"
                  scroll={false}
                >
                  {c.emoji && <span aria-hidden="true">{c.emoji}</span>} {c.name}
                </Link>
              );
            })}
          </div>
        );
      })}
      {active.length > 0 && (
        <Link href={base} className="see-all small">
          Clear filters
        </Link>
      )}
    </div>
  );
}

export function Pagination({
  base,
  filters,
  page,
  totalPages,
}: {
  base: string;
  filters: string[];
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav className="pagination-x" aria-label="Pagination">
      {page > 1 && (
        <Link href={buildHref(base, filters, page - 1)} rel="prev">
          ← Prev
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} aria-hidden="true">
            …
          </span>
        ) : p === page ? (
          <span key={p} className="is-current" aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={buildHref(base, filters, p)} aria-label={`Page ${p}`}>
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={buildHref(base, filters, page + 1)} rel="next">
          Next →
        </Link>
      )}
    </nav>
  );
}

export function ListingView({
  eyebrow,
  title,
  highlight,
  description,
  base,
  categories,
  activeFilters,
  excludeFacet,
  excludeId,
  posts,
  total,
  page,
  totalPages,
  permalink,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  base: string;
  categories: CategoryDTO[];
  activeFilters: string[];
  excludeFacet?: Facet;
  excludeId?: string;
  posts: PostCardDTO[];
  total: number;
  page: number;
  totalPages: number;
  permalink: Permalink;
}) {
  return (
    <>
      <div className="container-x listing-head">
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          <Highlighted title={title} highlight={highlight} />
        </h1>
        {description && (
          <p className="section-sub" style={{ maxWidth: 680 }}>
            {description}
          </p>
        )}
        <FilterChips
          base={base}
          categories={categories}
          active={activeFilters}
          excludeFacet={excludeFacet}
          excludeId={excludeId}
        />
      </div>
      <div className="container-x pb-5 mb-4">
        <p className="small text-secondary mb-3" aria-live="polite">
          {total} {total === 1 ? "craft" : "crafts"}
          {page > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {posts.length ? (
          <PostGrid posts={posts} permalink={permalink} priorityCount={4} />
        ) : (
          <div className="empty-state">
            <h2 className="h4">No crafts here yet</h2>
            <p className="mb-3">Try removing a filter, or browse everything.</p>
            <Link href="/crafts" className="btn-x btn-orange">
              Browse all crafts
            </Link>
          </div>
        )}
        <Pagination base={base} filters={activeFilters} page={page} totalPages={totalPages} />
      </div>
    </>
  );
}

export function parseListingParams(sp: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(sp.with) ? sp.with.join(",") : sp.with ?? "";
  const filters = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[a-z0-9-]{1,90}$/.test(s))
    .slice(0, 3);
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  return { filters, page };
}
