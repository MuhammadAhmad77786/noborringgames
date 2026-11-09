import Link from "next/link";
import type { Metadata } from "next";
import { Types } from "mongoose";
import { Category, Post, User } from "@craft/db";
import { FACET_LABELS, FACETS, POST_STATUSES } from "@craft/shared";
import { requireUser } from "@/lib/auth";
import { PostsTable, type PostRow } from "./PostsTable";

export const metadata: Metadata = { title: "Posts" };
export const dynamic = "force-dynamic";
const PER_PAGE = 25;

export default async function PostsPage({ searchParams }: PageProps<"/posts">) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const status = typeof sp.status === "string" && (POST_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const category = typeof sp.category === "string" && Types.ObjectId.isValid(sp.category) ? sp.category : "";
  const author = typeof sp.author === "string" && Types.ObjectId.isValid(sp.author) ? sp.author : "";
  const pick = sp.pick === "1";
  const page = Math.max(1, Number(sp.page) || 1);

  const filter: Record<string, unknown> = {};
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (status) filter.status = status;
  if (category) filter.categories = new Types.ObjectId(category);
  if (pick) filter.isPick = true;
  if (user.role === "author") filter.author = new Types.ObjectId(user.id);
  else if (author) filter.author = new Types.ObjectId(author);

  const [posts, total, categories, authors] = await Promise.all([
    Post.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .select("title slug status publishedAt updatedAt isPick views featuredImage pinterestImage author categories printables")
      .populate("author", "name")
      .populate("categories", "name")
      .lean(),
    Post.countDocuments(filter),
    Category.find().sort({ facet: 1, sortOrder: 1 }).select("name facet").lean(),
    user.role === "author" ? [] : User.find().select("name").lean(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const rows: PostRow[] = posts.map((p) => ({
    id: String(p._id),
    title: p.title,
    slug: p.slug,
    status: p.status ?? "draft",
    publishedAt: p.publishedAt?.toISOString(),
    updatedAt: (p as { updatedAt?: Date }).updatedAt?.toISOString(),
    isPick: !!p.isPick,
    views: p.views ?? 0,
    downloads: (p.printables ?? []).reduce((n, x) => n + (x.downloads ?? 0), 0),
    thumb: p.pinterestImage?.url || p.featuredImage?.url || "",
    author: (p.author as unknown as { name?: string })?.name ?? "—",
    categories: ((p.categories as unknown as { name: string }[]) ?? []).map((c) => c.name),
  }));

  const qs = (patch: Record<string, string | number>) => {
    const params = new URLSearchParams();
    const base = { q, status, category, author, pick: pick ? "1" : "", page: String(page) };
    for (const [k, v] of Object.entries({ ...base, ...patch })) if (v) params.set(k, String(v));
    return `/posts?${params}`;
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Posts</h1>
        <Link href="/posts/new" className="btn btn-primary">
          + New post
        </Link>
      </div>

      <form className="card-x d-flex flex-wrap gap-2 align-items-end" method="get">
        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="f-q">
            Search
          </label>
          <input id="f-q" name="q" className="form-control form-control-sm" defaultValue={q} placeholder="Title…" />
        </div>
        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="f-status">
            Status
          </label>
          <select id="f-status" name="status" className="form-select form-select-sm" defaultValue={status}>
            <option value="">All</option>
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="f-cat">
            Category
          </label>
          <select id="f-cat" name="category" className="form-select form-select-sm" defaultValue={category}>
            <option value="">All</option>
            {FACETS.map((f) => (
              <optgroup key={f} label={FACET_LABELS[f]}>
                {categories
                  .filter((c) => c.facet === f)
                  .map((c) => (
                    <option key={String(c._id)} value={String(c._id)}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
        {user.role !== "author" && (
          <div>
            <label className="form-label small fw-bold mb-1" htmlFor="f-author">
              Author
            </label>
            <select id="f-author" name="author" className="form-select form-select-sm" defaultValue={author}>
              <option value="">All</option>
              {authors.map((a) => (
                <option key={String(a._id)} value={String(a._id)}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-check mb-1">
          <input className="form-check-input" type="checkbox" name="pick" value="1" id="f-pick" defaultChecked={pick} />
          <label className="form-check-label small fw-bold" htmlFor="f-pick">
            ★ Picks only
          </label>
        </div>
        <button className="btn btn-sm btn-dark" type="submit">
          Filter
        </button>
        <Link href="/posts" className="btn btn-sm btn-link">
          Reset
        </Link>
      </form>

      <PostsTable rows={rows} canDelete siteUrl={process.env.SITE_URL ?? ""} />

      <div className="d-flex justify-content-between align-items-center mt-3 small">
        <span className="text-secondary">
          {total} posts · page {page} of {pages}
        </span>
        <div className="d-flex gap-2">
          {page > 1 && (
            <Link className="btn btn-sm btn-outline-dark" href={qs({ page: page - 1 })}>
              ← Prev
            </Link>
          )}
          {page < pages && (
            <Link className="btn btn-sm btn-outline-dark" href={qs({ page: page + 1 })}>
              Next →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
