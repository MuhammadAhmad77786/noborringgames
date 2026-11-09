import Link from "next/link";
import { Types } from "mongoose";
import { Comment, Post, Subscriber } from "@craft/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const sp = await searchParams;
  const own = user.role === "author" ? { author: user.id } : {};
  const ownMatch = user.role === "author" ? { author: new Types.ObjectId(user.id) } : {};

  const [byStatus, recent, pending, subscribers, topDownloads, topViewed] = await Promise.all([
    Post.aggregate<{ _id: string; n: number }>([
      { $match: ownMatch },
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ]),
    Post.find(own).sort({ updatedAt: -1 }).limit(6).select("title status updatedAt").lean(),
    user.role !== "author"
      ? Comment.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).populate("post", "title").lean()
      : [],
    user.role === "admin" ? Subscriber.countDocuments() : null,
    Post.aggregate<{ _id: unknown; title: string; printable: string; downloads: number }>([
      { $match: ownMatch },
      { $unwind: "$printables" },
      { $project: { title: 1, printable: "$printables.title", downloads: "$printables.downloads" } },
      { $sort: { downloads: -1 } },
      { $limit: 5 },
    ]),
    Post.find({ ...own, status: "published" }).sort({ views: -1 }).limit(5).select("title views").lean(),
  ]);

  const count = (s: string) => byStatus.find((b) => b._id === s)?.n ?? 0;

  return (
    <>
      {sp.denied && <div className="alert alert-warning">You don&apos;t have permission to open that page.</div>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Hi {user.name.split(" ")[0]} 👋</h1>
        <Link href="/posts/new" className="btn btn-primary">
          + New post
        </Link>
      </div>

      <div className="row g-3 mb-4">
        {[
          { n: count("published"), l: "Published" },
          { n: count("scheduled"), l: "Scheduled" },
          { n: count("draft"), l: "Drafts" },
          ...(subscribers !== null ? [{ n: subscribers, l: "Subscribers" }] : []),
          ...(user.role !== "author" ? [{ n: pending.length, l: "Pending comments" }] : []),
        ].map((s) => (
          <div className="col-6 col-md-4 col-xl" key={s.l}>
            <div className="stat-card">
              <div className="num">{s.n}</div>
              <div className="lbl">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <div className="card-x">
            <h2>Recent posts</h2>
            <ul className="list-unstyled m-0">
              {recent.map((p) => (
                <li key={String(p._id)} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <Link href={`/posts/${p._id}`} className="fw-bold text-decoration-none text-truncate me-2">
                    {p.title}
                  </Link>
                  <StatusBadge status={p.status ?? "draft"} />
                </li>
              ))}
              {!recent.length && <li className="text-secondary">No posts yet.</li>}
            </ul>
          </div>
          {user.role !== "author" && (
            <div className="card-x">
              <h2>
                Pending comments <Link href="/comments" className="small fw-normal ms-2">Moderate →</Link>
              </h2>
              {pending.length === 0 && <p className="text-secondary m-0">All caught up.</p>}
              {pending.map((c) => (
                <div key={String(c._id)} className="py-2 border-bottom">
                  <div className="small">
                    <strong>{c.name}</strong> on <em>{(c.post as unknown as { title?: string })?.title ?? "a post"}</em>
                  </div>
                  <div className="small text-secondary text-truncate">{c.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-12 col-xl-6">
          <div className="card-x">
            <h2>Top downloaded printables</h2>
            <table className="table table-sm m-0">
              <tbody>
                {topDownloads.map((d, i) => (
                  <tr key={i}>
                    <td>
                      <Link href={`/posts/${String(d._id)}`} className="text-decoration-none fw-bold">
                        {d.printable}
                      </Link>
                      <div className="small text-secondary">{d.title}</div>
                    </td>
                    <td className="text-end fw-bold">{d.downloads ?? 0}</td>
                  </tr>
                ))}
                {!topDownloads.length && (
                  <tr>
                    <td className="text-secondary">No printables yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="card-x">
            <h2>Top viewed posts</h2>
            <table className="table table-sm m-0">
              <tbody>
                {topViewed.map((p) => (
                  <tr key={String(p._id)}>
                    <td>
                      <Link href={`/posts/${p._id}`} className="text-decoration-none fw-bold">
                        {p.title}
                      </Link>
                    </td>
                    <td className="text-end fw-bold">{p.views ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
