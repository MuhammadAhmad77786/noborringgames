import Link from "next/link";
import type { Metadata } from "next";
import { Comment } from "@craft/db";
import { EDITORS, requireUser } from "@/lib/auth";
import { CommentActions } from "./CommentActions";

export const metadata: Metadata = { title: "Comments" };
export const dynamic = "force-dynamic";

export default async function CommentsPage({ searchParams }: PageProps<"/comments">) {
  await requireUser(EDITORS);
  const sp = await searchParams;
  const status = sp.status === "approved" || sp.status === "spam" ? sp.status : "pending";
  const [comments, counts] = await Promise.all([
    Comment.find({ status }).sort({ createdAt: -1 }).limit(100).populate("post", "title slug").lean(),
    Comment.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const n = (s: string) => counts.find((c) => c._id === s)?.n ?? 0;
  const site = process.env.SITE_URL ?? "";

  return (
    <>
      <h1 className="page-title mb-3">Comments</h1>
      <ul className="nav nav-pills mb-3">
        {(["pending", "approved", "spam"] as const).map((s) => (
          <li className="nav-item" key={s}>
            <Link href={`/comments?status=${s}`} className={`nav-link text-capitalize ${status === s ? "active bg-dark" : "text-dark"}`}>
              {s} ({n(s)})
            </Link>
          </li>
        ))}
      </ul>
      {comments.length === 0 && <div className="card-x text-secondary">Nothing here. 🎉</div>}
      {comments.map((c) => {
        const post = c.post as unknown as { title?: string; slug?: string } | null;
        return (
          <div className="card-x" key={String(c._id)}>
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <div>
                <strong>{c.name}</strong> <span className="text-secondary small">&lt;{c.email}&gt;</span>
                <div className="small text-secondary">
                  {(c as { createdAt?: Date }).createdAt?.toLocaleString()} · on{" "}
                  {post?.slug ? (
                    <a href={`${site}/${post.slug}#comments`} target="_blank" rel="noopener">
                      {post.title}
                    </a>
                  ) : (
                    "deleted post"
                  )}
                </div>
              </div>
              <CommentActions id={String(c._id)} status={c.status ?? "pending"} />
            </div>
            <p className="mt-2 mb-0" style={{ whiteSpace: "pre-line" }}>
              {c.body}
            </p>
          </div>
        );
      })}
    </>
  );
}
