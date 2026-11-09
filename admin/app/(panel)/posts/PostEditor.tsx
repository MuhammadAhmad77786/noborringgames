"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { FACET_LABELS, FACETS, formatBytes, slugify, type ImageAsset, type Printable, type Role } from "@craft/shared";
import { ImageField } from "@/components/ImageField";
import { RichEditor } from "@/components/RichEditor";
import { SeoPanel } from "@/components/SeoPanel";
import { useToast } from "@/components/Toast";
import { uploadToCloudinary } from "@/lib/upload-client";
import { savePost, type PostInput } from "./actions";
import type { EditorContext } from "./load";

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PrintableRow({ p, onChange, onRemove }: { p: Printable; onChange: (p: Printable) => void; onRemove: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) return setError("Please choose a PDF file.");
    setError("");
    setProgress(0);
    try {
      const r = await uploadToCloudinary(file, "printables", setProgress);
      onChange({ ...p, fileUrl: r.url, public_id: r.public_id, fileSize: r.bytes, title: p.title || file.name.replace(/\.pdf$/i, "") });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="repeater-row">
      <div className="row g-2">
        <div className="col-12 col-md-4">
          <ImageField label="Preview image" folder="printables" value={p.previewImage} onChange={(img) => onChange({ ...p, previewImage: img ?? undefined })} ratio="17/22" />
        </div>
        <div className="col-12 col-md-8">
          <label className="form-label fw-bold small">Printable title</label>
          <input className="form-control form-control-sm mb-2" value={p.title} onChange={(e) => onChange({ ...p, title: e.target.value })} placeholder="Pumpkin template (3 sizes)" />
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => ref.current?.click()} disabled={progress !== null}>
              {progress !== null ? `Uploading ${progress}%` : p.fileUrl ? "Replace PDF" : "Upload PDF"}
            </button>
            {p.fileUrl && (
              <a href={p.fileUrl} target="_blank" rel="noopener" className="small">
                View file ({formatBytes(p.fileSize) || "PDF"})
              </a>
            )}
            <input ref={ref} type="file" accept="application/pdf" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          {error && <div className="text-danger small mb-2">{error}</div>}
          <div className="row g-2 align-items-center">
            <div className="col-5">
              <label className="form-label small fw-bold mb-0">Pages</label>
              <input type="number" min={1} className="form-control form-control-sm" value={p.pages ?? 1} onChange={(e) => onChange({ ...p, pages: Number(e.target.value) })} />
            </div>
            <div className="col-7 pt-3">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id={`gate-${p._id ?? p.fileUrl}`} checked={!!p.requireEmail} onChange={(e) => onChange({ ...p, requireEmail: e.target.checked })} />
                <label className="form-check-label small" htmlFor={`gate-${p._id ?? p.fileUrl}`}>
                  Require email to download
                </label>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between mt-2 small">
            <span className="text-secondary">{p.downloads ?? 0} downloads</span>
            <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={onRemove}>
              Remove printable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostEditor({ initial, ctx, role }: { initial: PostInput; ctx: EditorContext; role: Role }) {
  const [post, setPost] = useState<PostInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [tagText, setTagText] = useState(initial.tags.join(", "));
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => {
    setPost((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const slug = slugTouched ? post.slug : slugify(post.title);
  const primaryCat = ctx.categories.find((c) => post.categories.includes(c.id) && c.facet === "craftType") ?? ctx.categories.find((c) => post.categories.includes(c.id));
  const permalinkPath = ctx.permalink === "category-post" && primaryCat ? `/${primaryCat.slug}/${slug}` : `/${slug}`;
  const url = `${ctx.siteUrl}${permalinkPath}`;

  const imageAlts = useMemo(
    () => [post.featuredImage?.alt, post.pinterestImage?.alt, ...post.gallery.map((g) => g.alt)].filter(Boolean) as string[],
    [post.featuredImage, post.pinterestImage, post.gallery],
  );

  function save(statusOverride?: PostInput["status"]) {
    const payload: PostInput = {
      ...post,
      slug,
      status: statusOverride ?? post.status,
      tags: tagText.split(",").map((t) => t.trim()).filter(Boolean),
    };
    start(async () => {
      const res = await savePost(payload);
      if (!res.ok) return toast.show("err", res.error);
      setDirty(false);
      setPost((p) => ({ ...p, id: res.id, slug: res.slug, status: payload.status }));
      setSlugTouched(true);
      toast.show("ok", "Saved ✔ — the public site is refreshing.");
      if (!initial.id) router.replace(`/posts/${res.id}`);
      else router.refresh();
    });
  }

  const toggleCat = (id: string) => set("categories", post.categories.includes(id) ? post.categories.filter((c) => c !== id) : [...post.categories, id]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {toast.node}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">{initial.id ? "Edit post" : "New post"}</h1>
        <div className="d-flex gap-2">
          {initial.id && post.status !== "draft" && (
            <a className="btn btn-outline-dark" href={url} target="_blank" rel="noopener">
              View ↗
            </a>
          )}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Main column */}
        <div className="col-12 col-xl-8">
          <div className="card-x">
            <label className="form-label fw-bold" htmlFor="title">
              Title
            </label>
            <input id="title" className="form-control form-control-lg fw-bold" value={post.title} onChange={(e) => set("title", e.target.value)} placeholder="Paper Plate Pumpkin Craft (Free Printable Template)" required />
            <div className="mt-2 d-flex flex-wrap align-items-center gap-2 small">
              <span className="text-secondary">Permalink:</span>
              <span className="text-secondary">{ctx.siteUrl}{permalinkPath.replace(slug, "")}</span>
              <input
                aria-label="Slug"
                className="form-control form-control-sm d-inline-block"
                style={{ width: "auto", minWidth: 260 }}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value) || e.target.value.toLowerCase());
                }}
              />
              {slugTouched && !initial.id && (
                <button type="button" className="btn btn-sm btn-link p-0" onClick={() => setSlugTouched(false)}>
                  Reset to title
                </button>
              )}
            </div>
            <label className="form-label fw-bold mt-3" htmlFor="excerpt">
              Excerpt
            </label>
            <textarea id="excerpt" className="form-control" rows={2} value={post.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="One or two sentences shown in listings and as the default meta description." />
          </div>

          <div className="mb-3">
            <RichEditor value={post.content} onChange={(html) => set("content", html)} />
            <div className="form-text">
              Tip: use H2 headings like &ldquo;Step 1: Cut out the pieces&rdquo; — they become HowTo steps for Google.
            </div>
          </div>

          <div className="card-x">
            <h2>Quick facts</h2>
            <div className="row g-2">
              <div className="col-6 col-md-4">
                <label className="form-label small fw-bold" htmlFor="age">
                  Age range
                </label>
                <input id="age" className="form-control" value={post.ageRange} onChange={(e) => set("ageRange", e.target.value)} placeholder="Ages 3+" />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small fw-bold" htmlFor="difficulty">
                  Difficulty
                </label>
                <select id="difficulty" className="form-select" value={post.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                  <option>Easy</option>
                  <option>Medium</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold" htmlFor="time">
                  Time needed
                </label>
                <input id="time" className="form-control" value={post.timeNeeded} onChange={(e) => set("timeNeeded", e.target.value)} placeholder="15 min" />
              </div>
            </div>
          </div>

          <div className="card-x">
            <h2>Supplies</h2>
            {post.supplies.map((s, i) => (
              <div className="row g-2 mb-2" key={i}>
                <div className="col-12 col-md-5">
                  <input aria-label="Supply name" className="form-control form-control-sm" value={s.name} onChange={(e) => set("supplies", post.supplies.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Orange cardstock" />
                </div>
                <div className="col-10 col-md-6">
                  <input aria-label="Affiliate URL" className="form-control form-control-sm" type="url" value={s.affiliateUrl ?? ""} onChange={(e) => set("supplies", post.supplies.map((x, j) => (j === i ? { ...x, affiliateUrl: e.target.value } : x)))} placeholder="Affiliate link (optional)" />
                </div>
                <div className="col-2 col-md-1">
                  <button type="button" className="btn btn-sm btn-outline-danger w-100" aria-label="Remove supply" onClick={() => set("supplies", post.supplies.filter((_, j) => j !== i))}>
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => set("supplies", [...post.supplies, { name: "" }])}>
              + Add supply
            </button>
          </div>

          <div className="card-x">
            <h2>Printables (PDF)</h2>
            {post.printables.map((p, i) => (
              <PrintableRow
                key={p._id ?? i}
                p={p}
                onChange={(np) => set("printables", post.printables.map((x, j) => (j === i ? np : x)))}
                onRemove={() => set("printables", post.printables.filter((_, j) => j !== i))}
              />
            ))}
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => set("printables", [...post.printables, { title: "", fileUrl: "", pages: 1, requireEmail: false }])}>
              + Add printable
            </button>
          </div>

          <SeoPanel
            seo={post.seo}
            onChange={(s) => set("seo", s)}
            title={post.title}
            slug={slug}
            content={post.content}
            excerpt={post.excerpt}
            pinterestDescription={post.pinterestDescription}
            imageAlts={imageAlts}
            url={url}
            siteTitle={ctx.siteTitle}
            titleTemplate={ctx.titleTemplate}
          />
        </div>

        {/* Sidebar */}
        <div className="col-12 col-xl-4">
          <div className="card-x">
            <h2>Publish</h2>
            <label className="form-label small fw-bold" htmlFor="status">
              Status
            </label>
            <select id="status" className="form-select mb-2" value={post.status} onChange={(e) => set("status", e.target.value as PostInput["status"])}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <label className="form-label small fw-bold" htmlFor="pubdate">
              {post.status === "scheduled" ? "Publish on" : "Publish date"}
            </label>
            <input
              id="pubdate"
              type="datetime-local"
              className="form-control mb-3"
              value={toLocalInput(post.publishedAt)}
              onChange={(e) => set("publishedAt", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            />
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-dark flex-fill" disabled={pending} onClick={() => save("draft")}>
                Save draft
              </button>
              <button type="button" className="btn btn-teal flex-fill" disabled={pending} onClick={() => save(post.status === "scheduled" ? "scheduled" : "published")}>
                {post.status === "scheduled" ? "Schedule" : "Publish"}
              </button>
            </div>
          </div>

          {role !== "author" && (
            <div className="card-x">
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="pick" checked={post.isPick} onChange={(e) => set("isPick", e.target.checked)} />
                <label className="form-check-label fw-bold" htmlFor="pick">
                  ★ Most-loved pick (homepage)
                </label>
              </div>
              <label className="form-label small fw-bold" htmlFor="author">
                Author
              </label>
              <select id="author" className="form-select" value={post.author ?? ""} onChange={(e) => set("author", e.target.value)}>
                {ctx.authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="card-x">
            <h2>Categories</h2>
            {FACETS.map((f) => (
              <fieldset key={f} className="mb-3">
                <legend className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.08em" }}>
                  {FACET_LABELS[f]}
                </legend>
                <div className="d-flex flex-wrap gap-1">
                  {ctx.categories
                    .filter((c) => c.facet === f)
                    .map((c) => {
                      const on = post.categories.includes(c.id);
                      return (
                        <button key={c.id} type="button" className={`btn btn-sm ${on ? "btn-dark" : "btn-outline-secondary"}`} aria-pressed={on} onClick={() => toggleCat(c.id)}>
                          {c.emoji} {c.name}
                        </button>
                      );
                    })}
                </div>
              </fieldset>
            ))}
            <label className="form-label small fw-bold" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input id="tags" className="form-control" value={tagText} onChange={(e) => { setTagText(e.target.value); setDirty(true); }} placeholder="Printable, No glue, Ages 3+" />
            <div className="form-text">The first tag shows as a chip on post cards.</div>
          </div>

          <div className="card-x">
            <h2>Featured image</h2>
            <ImageField label="Featured image" value={post.featuredImage} onChange={(v) => set("featuredImage", v)} folder="posts" help="Landscape or square photo of the finished craft." />
          </div>

          <div className="card-x">
            <h2>Pinterest</h2>
            <ImageField label="Pinterest image (2:3)" value={post.pinterestImage} onChange={(v) => set("pinterestImage", v)} folder="pins" ratio="2/3" help="Separate tall pin graphic, 1000×1500. Used on cards, 'Pin this for later' and Rich Pins." />
            <label className="form-label small fw-bold" htmlFor="pin-title">
              Pin title
            </label>
            <input id="pin-title" className="form-control mb-1" maxLength={100} value={post.pinterestTitle} onChange={(e) => set("pinterestTitle", e.target.value)} />
            <div className="form-text mb-2">{post.pinterestTitle.length}/100</div>
            <label className="form-label small fw-bold" htmlFor="pin-desc">
              Pin description
            </label>
            <textarea id="pin-desc" className="form-control" rows={4} maxLength={500} value={post.pinterestDescription} onChange={(e) => set("pinterestDescription", e.target.value)} placeholder="Keyword-rich description used when readers save any image from this post." />
            <div className="form-text">{post.pinterestDescription.length}/500</div>
          </div>

          <div className="card-x">
            <h2>Gallery</h2>
            {post.gallery.map((g, i) => (
              <ImageField
                key={i}
                label={`Gallery image ${i + 1}`}
                value={g}
                onChange={(v) => set("gallery", v ? post.gallery.map((x, j) => (j === i ? v : x)) : post.gallery.filter((_, j) => j !== i))}
              />
            ))}
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => set("gallery", [...post.gallery, { url: "", alt: "" } as ImageAsset])}>
              + Add gallery image
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
