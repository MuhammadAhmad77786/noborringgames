"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatBytes } from "@craft/shared";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useToast } from "@/components/Toast";
import { thumb, uploadToCloudinary } from "@/lib/upload-client";
import { deleteMedia, listMedia, updateAlt, type MediaItem } from "./actions";

export function MediaLibrary({ canDelete }: { canDelete: boolean }) {
  const [type, setType] = useState<"image" | "raw">("image");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [next, setNext] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const load = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError("");
      const r = await listMedia({ type, q, cursor });
      setLoading(false);
      if (!r.ok) return setError(r.error);
      setItems((prev) => (cursor ? [...prev, ...r.items] : r.items));
      setNext(r.next);
    },
    [type, q],
  );

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    try {
      for (const f of Array.from(files)) {
        setUploading(0);
        await uploadToCloudinary(f, f.name.toLowerCase().endsWith(".pdf") ? "printables" : "posts", setUploading);
      }
      toast.show("ok", "Uploaded");
      // Cloudinary search indexing can lag a few seconds.
      setTimeout(() => load(), 1500);
    } catch (e) {
      toast.show("err", (e as Error).message);
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="row g-3">
      {toast.node}
      <div className="col-12 col-xl-9">
        <div className="card-x d-flex flex-wrap gap-2 align-items-center">
          <div className="btn-group" role="group" aria-label="File type">
            <button className={`btn btn-sm ${type === "image" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setType("image")}>
              Images
            </button>
            <button className={`btn btn-sm ${type === "raw" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setType("raw")}>
              PDFs
            </button>
          </div>
          <input aria-label="Search media" className="form-control form-control-sm" style={{ maxWidth: 260 }} placeholder="Search filename or alt…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-sm btn-primary ms-auto" onClick={() => fileRef.current?.click()} disabled={uploading !== null}>
            {uploading !== null ? `Uploading ${uploading}%` : "Upload files"}
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" hidden onChange={(e) => upload(e.target.files)} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="media-grid">
          {items.map((m) => (
            <button key={m.public_id} type="button" className={`media-tile ${selected?.public_id === m.public_id ? "selected" : ""}`} onClick={() => {
                setSelected(m);
                setAlt(m.alt ?? "");
              }}>
              <div className="m-thumb">
                {m.resource_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(m.url, 300)} alt={m.alt ?? ""} loading="lazy" />
                ) : (
                  <span className="fs-1" aria-hidden="true">
                    📄
                  </span>
                )}
              </div>
              <div className="m-name">{m.public_id.split("/").pop()}</div>
            </button>
          ))}
        </div>
        {loading && <p className="text-secondary mt-3">Loading…</p>}
        {!loading && !items.length && !error && <p className="text-secondary mt-3">No files found.</p>}
        {next && !loading && (
          <button className="btn btn-outline-dark mt-3" onClick={() => load(next)}>
            Load more
          </button>
        )}
      </div>
      <div className="col-12 col-xl-3">
        {selected ? (
          <div className="card-x position-sticky" style={{ top: 70 }}>
            <h2 className="text-truncate">{selected.public_id.split("/").pop()}</h2>
            {selected.resource_type === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb(selected.url, 500)} alt={selected.alt ?? ""} className="img-fluid rounded mb-2 border" />
            )}
            <div className="small text-secondary mb-2">
              {selected.width ? `${selected.width}×${selected.height} · ` : ""}
              {formatBytes(selected.bytes)} · {new Date(selected.created_at).toLocaleDateString()}
              <div>{selected.folder}</div>
            </div>
            <label className="form-label small fw-bold" htmlFor="m-url">
              URL
            </label>
            <div className="input-group input-group-sm mb-2">
              <input id="m-url" className="form-control" readOnly value={selected.url} />
              <button
                className="btn btn-outline-dark"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(selected.url);
                  toast.show("ok", "URL copied");
                }}
              >
                Copy
              </button>
            </div>
            {selected.resource_type === "image" && (
              <>
                <label className="form-label small fw-bold" htmlFor="m-alt">
                  Alt text (library default)
                </label>
                <textarea id="m-alt" className="form-control form-control-sm mb-2" rows={2} value={alt} onChange={(e) => setAlt(e.target.value)} />
                <button
                  className="btn btn-sm btn-teal mb-3"
                  onClick={async () => {
                    const r = await updateAlt(selected.public_id, alt);
                    if (r.ok) {
                      toast.show("ok", "Alt text saved");
                      setItems((list) => list.map((x) => (x.public_id === selected.public_id ? { ...x, alt } : x)));
                    } else toast.show("err", r.error);
                  }}
                >
                  Save alt text
                </button>
                <p className="form-text">Alt text on posts is stored per use; this updates the library copy.</p>
              </>
            )}
            {canDelete && (
              <div>
                <ConfirmButton
                  onConfirm={async () => {
                    const r = await deleteMedia(selected.public_id, selected.resource_type);
                    if (r.ok) {
                      setItems((list) => list.filter((x) => x.public_id !== selected.public_id));
                      setSelected(null);
                      toast.show("ok", "Deleted from Cloudinary");
                    } else toast.show("err", r.error);
                  }}
                  confirmText="Delete permanently"
                >
                  Delete file
                </ConfirmButton>
                <div className="form-text">Posts still pointing at this file will show a broken image.</div>
              </div>
            )}
          </div>
        ) : (
          <div className="card-x text-secondary small">Select a file to see details, copy its URL or edit alt text.</div>
        )}
      </div>
    </div>
  );
}
