"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { thumb } from "@/lib/upload-client";
import { bulkPosts } from "./actions";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string;
  updatedAt?: string;
  isPick: boolean;
  views: number;
  downloads: number;
  thumb: string;
  author: string;
  categories: string[];
};

export function PostsTable({ rows, canDelete, siteUrl }: { rows: PostRow[]; canDelete: boolean; siteUrl: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const all = rows.length > 0 && selected.length === rows.length;

  const run = (action: "publish" | "draft" | "delete") =>
    start(async () => {
      const res = await bulkPosts(selected, action);
      if (res.ok) {
        toast.show("ok", `${res.count} post(s) updated`);
        setSelected([]);
        router.refresh();
      } else toast.show("err", res.error);
    });

  return (
    <>
      {toast.node}
      <div className="d-flex gap-2 align-items-center mb-2" aria-live="polite">
        <span className="small text-secondary">{selected.length} selected</span>
        <button className="btn btn-sm btn-teal" disabled={!selected.length || pending} onClick={() => run("publish")}>
          Publish
        </button>
        <button className="btn btn-sm btn-outline-dark" disabled={!selected.length || pending} onClick={() => run("draft")}>
          Move to draft
        </button>
        {canDelete && (
          <ConfirmButton disabled={!selected.length || pending} onConfirm={() => run("delete")} confirmText={`Delete ${selected.length}`}>
            Delete
          </ConfirmButton>
        )}
      </div>
      <div className="table-x table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  aria-label="Select all"
                  checked={all}
                  onChange={() => setSelected(all ? [] : rows.map((r) => r.id))}
                />
              </th>
              <th style={{ width: 56 }} />
              <th>Title</th>
              <th>Status</th>
              <th>Categories</th>
              <th>Author</th>
              <th className="text-end">Views</th>
              <th className="text-end">Downloads</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    aria-label={`Select ${r.title}`}
                    checked={selected.includes(r.id)}
                    onChange={(e) => setSelected((s) => (e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id)))}
                  />
                </td>
                <td>
                  {r.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb(r.thumb, 100)} alt="" className="thumb-sm" />
                  ) : (
                    <div className="thumb-sm" />
                  )}
                </td>
                <td>
                  <Link href={`/posts/${r.id}`} className="fw-bold text-decoration-none">
                    {r.title}
                  </Link>
                  {r.isPick && <span className="badge text-bg-warning ms-2">★ Pick</span>}
                  <div className="small">
                    <a href={`${siteUrl}/${r.slug}`} target="_blank" rel="noopener" className="text-secondary">
                      /{r.slug}
                    </a>
                  </div>
                </td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td className="small" style={{ maxWidth: 220 }}>
                  {r.categories.join(", ")}
                </td>
                <td className="small">{r.author}</td>
                <td className="text-end">{r.views}</td>
                <td className="text-end">{r.downloads}</td>
                <td className="small text-nowrap">
                  {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "—"}
                  <div className="text-secondary">upd. {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ""}</div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="text-center text-secondary py-4">
                  No posts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
