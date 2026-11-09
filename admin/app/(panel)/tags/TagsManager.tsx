"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useToast } from "@/components/Toast";
import { deleteTag, saveTag } from "../categories/actions";

type Row = { id: string; name: string; slug: string; count: number };

export function TagsManager({ rows }: { rows: Row[] }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast.show("ok", msg);
        setName("");
        setEditing(null);
        router.refresh();
      } else toast.show("err", r.error ?? "Error");
    });

  return (
    <div className="row g-3">
      {toast.node}
      <div className="col-12 col-lg-4">
        <form
          className="card-x"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveTag({ name }), "Tag added");
          }}
        >
          <h2>Add tag</h2>
          <label className="form-label small fw-bold" htmlFor="tag-name">
            Name
          </label>
          <input id="tag-name" className="form-control mb-2" value={name} onChange={(e) => setName(e.target.value)} required placeholder="No glue" />
          <button className="btn btn-primary" disabled={pending}>
            Add
          </button>
        </form>
      </div>
      <div className="col-12 col-lg-8">
        <div className="table-x">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th className="text-end">Posts</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {editing?.id === r.id ? (
                      <input aria-label="Tag name" className="form-control form-control-sm" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                    ) : (
                      <strong>{r.name}</strong>
                    )}
                  </td>
                  <td className="small text-secondary">
                    {editing?.id === r.id ? (
                      <input aria-label="Tag slug" className="form-control form-control-sm" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                    ) : (
                      r.slug
                    )}
                  </td>
                  <td className="text-end">{r.count}</td>
                  <td className="text-end text-nowrap">
                    {editing?.id === r.id ? (
                      <>
                        <button className="btn btn-sm btn-teal me-1" disabled={pending} onClick={() => run(() => saveTag(editing), "Tag saved")}>
                          Save
                        </button>
                        <button className="btn btn-sm btn-light" onClick={() => setEditing(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-outline-dark me-1" onClick={() => setEditing(r)}>
                          Edit
                        </button>
                        <ConfirmButton onConfirm={() => run(() => deleteTag(r.id), "Tag deleted")}>Delete</ConfirmButton>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="text-secondary text-center py-4">
                    No tags yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
