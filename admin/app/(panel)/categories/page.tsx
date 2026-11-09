import Link from "next/link";
import type { Metadata } from "next";
import { Category, Post } from "@craft/db";
import { FACET_LABELS, FACETS } from "@craft/shared";
import { EDITORS, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireUser(EDITORS);
  const [cats, counts] = await Promise.all([
    Category.find().sort({ facet: 1, sortOrder: 1, name: 1 }).lean(),
    Post.aggregate<{ _id: unknown; n: number }>([{ $unwind: "$categories" }, { $group: { _id: "$categories", n: { $sum: 1 } } }]),
  ]);
  const countOf = (id: unknown) => counts.find((c) => String(c._id) === String(id))?.n ?? 0;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Categories</h1>
        <Link href="/categories/new" className="btn btn-primary">
          + New category
        </Link>
      </div>
      {FACETS.map((f) => (
        <div key={f} className="mb-4">
          <h2 className="h6 fw-bold text-uppercase text-secondary">{FACET_LABELS[f]}</h2>
          <div className="table-x table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Order</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Card</th>
                  <th>Navbar</th>
                  <th>Footer</th>
                  <th className="text-end">Posts</th>
                </tr>
              </thead>
              <tbody>
                {cats
                  .filter((c) => c.facet === f)
                  .map((c) => (
                    <tr key={String(c._id)}>
                      <td>{c.sortOrder}</td>
                      <td>
                        <Link href={`/categories/${c._id}`} className="fw-bold text-decoration-none">
                          {c.emoji} {c.name}
                        </Link>
                      </td>
                      <td className="small text-secondary">/category/{c.slug}</td>
                      <td>
                        <span className="d-inline-block border rounded" style={{ width: 28, height: 18, background: c.cardColor ?? "#fff" }} title={c.cardColor ?? ""} />
                      </td>
                      <td>{c.showInNavbar ? "✔" : ""}</td>
                      <td>{c.showInFooter ? "✔" : ""}</td>
                      <td className="text-end">{countOf(c._id)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
