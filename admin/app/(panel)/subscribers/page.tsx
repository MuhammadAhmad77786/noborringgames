import Link from "next/link";
import type { Metadata } from "next";
import { Subscriber } from "@craft/db";
import { ADMINS, requireUser } from "@/lib/auth";
import { SubscriberRowActions } from "./SubscriberRowActions";

export const metadata: Metadata = { title: "Subscribers" };
export const dynamic = "force-dynamic";
const PER_PAGE = 50;

export default async function SubscribersPage({ searchParams }: PageProps<"/subscribers">) {
  await requireUser(ADMINS);
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const source = sp.source === "newsletter" || sp.source === "printable" ? sp.source : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ email: rx }, { firstName: rx }];
  }
  if (source) filter.source = source;
  const [subs, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PER_PAGE).limit(PER_PAGE).populate("post", "title").lean(),
    Subscriber.countDocuments(filter),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const exportHref = `/api/subscribers/export?${new URLSearchParams({ ...(q ? { q } : {}), ...(source ? { source } : {}) })}`;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Subscribers <span className="text-secondary fs-5">({total})</span></h1>
        <a href={exportHref} className="btn btn-teal">
          ⬇ Export CSV
        </a>
      </div>
      <form className="card-x d-flex gap-2 flex-wrap align-items-end" method="get">
        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="sq">
            Search
          </label>
          <input id="sq" name="q" defaultValue={q} className="form-control form-control-sm" placeholder="Email or name" />
        </div>
        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="ss">
            Source
          </label>
          <select id="ss" name="source" defaultValue={source} className="form-select form-select-sm">
            <option value="">All</option>
            <option value="newsletter">Newsletter</option>
            <option value="printable">Printable download</option>
          </select>
        </div>
        <button className="btn btn-sm btn-dark">Filter</button>
      </form>
      <div className="table-x table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Email</th>
              <th>First name</th>
              <th>Source</th>
              <th>Provider</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={String(s._id)}>
                <td className="fw-bold">{s.email}</td>
                <td>{s.firstName}</td>
                <td className="small">
                  {s.source}
                  {(s.post as unknown as { title?: string })?.title && <div className="text-secondary">{(s.post as unknown as { title: string }).title}</div>}
                </td>
                <td className="small">{s.syncedAt ? "✔ synced" : "—"}</td>
                <td className="small">{(s as { createdAt?: Date }).createdAt?.toLocaleDateString()}</td>
                <td className="text-end">
                  <SubscriberRowActions id={String(s._id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        {page > 1 && <Link className="btn btn-sm btn-outline-dark" href={`/subscribers?${new URLSearchParams({ q, source, page: String(page - 1) })}`}>← Prev</Link>}
        {page < pages && <Link className="btn btn-sm btn-outline-dark" href={`/subscribers?${new URLSearchParams({ q, source, page: String(page + 1) })}`}>Next →</Link>}
      </div>
    </>
  );
}
