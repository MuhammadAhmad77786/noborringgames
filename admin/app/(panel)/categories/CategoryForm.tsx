"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CARD_COLORS, FACET_LABELS, FACETS, slugify, type Facet } from "@craft/shared";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ImageField } from "@/components/ImageField";
import { useToast } from "@/components/Toast";
import { deleteCategory, saveCategory, type CategoryInput } from "./actions";

export function CategoryForm({ initial, parents }: { initial: CategoryInput; parents: { id: string; name: string; facet: Facet }[] }) {
  const [c, setC] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const set = <K extends keyof CategoryInput>(k: K, v: CategoryInput[K]) => setC((x) => ({ ...x, [k]: v }));

  const save = () =>
    start(async () => {
      const res = await saveCategory({ ...c, slug: c.slug || slugify(c.name) });
      if (!res.ok) return toast.show("err", res.error);
      toast.show("ok", "Category saved");
      if (!initial.id) router.replace(`/categories/${res.id}`);
      else router.refresh();
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {toast.node}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">{initial.id ? `Edit: ${initial.name}` : "New category"}</h1>
        <div className="d-flex gap-2">
          {initial.id && (
            <ConfirmButton
              onConfirm={() =>
                start(async () => {
                  const r = await deleteCategory(initial.id!);
                  if (r.ok) router.push("/categories");
                  else toast.show("err", r.error);
                })
              }
            >
              Delete
            </ConfirmButton>
          )}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card-x">
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold" htmlFor="name">
                  Name
                </label>
                <input id="name" className="form-control" required value={c.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold" htmlFor="slug">
                  Slug
                </label>
                <input id="slug" className="form-control" value={c.slug} placeholder={slugify(c.name)} onChange={(e) => set("slug", e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-bold" htmlFor="facet">
                  Facet
                </label>
                <select id="facet" className="form-select" value={c.facet} onChange={(e) => set("facet", e.target.value as Facet)}>
                  {FACETS.map((f) => (
                    <option key={f} value={f}>
                      {FACET_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-bold" htmlFor="emoji">
                  Emoji
                </label>
                <input id="emoji" className="form-control" value={c.emoji} onChange={(e) => set("emoji", e.target.value)} placeholder="🎃" />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-bold" htmlFor="order">
                  Sort order
                </label>
                <input id="order" type="number" className="form-control" value={c.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-bold" htmlFor="parent">
                  Parent (optional)
                </label>
                <select id="parent" className="form-select" value={c.parentCategory} onChange={(e) => set("parentCategory", e.target.value)}>
                  <option value="">None</option>
                  {parents
                    .filter((p) => p.facet === c.facet)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-bold" htmlFor="desc">
                  Description
                </label>
                <textarea id="desc" className="form-control" rows={3} value={c.description} onChange={(e) => set("description", e.target.value)} />
                <div className="form-text">Shown on the category page and on homepage audience cards.</div>
              </div>
            </div>
          </div>
          <div className="card-x">
            <h2>SEO</h2>
            <label className="form-label small fw-bold" htmlFor="seo-t">
              SEO title
            </label>
            <input id="seo-t" className="form-control mb-1" value={c.seo.title ?? ""} onChange={(e) => set("seo", { ...c.seo, title: e.target.value })} placeholder={`${c.name} Crafts & Printables`} />
            <div className="form-text mb-2">{(c.seo.title ?? "").length}/60</div>
            <label className="form-label small fw-bold" htmlFor="seo-d">
              Meta description
            </label>
            <textarea id="seo-d" className="form-control" rows={2} value={c.seo.metaDescription ?? ""} onChange={(e) => set("seo", { ...c.seo, metaDescription: e.target.value })} />
            <div className="form-text">{(c.seo.metaDescription ?? "").length}/160</div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card-x">
            <h2>Display</h2>
            <label className="form-label small fw-bold">Card color</label>
            <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
              {Object.entries(CARD_COLORS).map(([name, hex]) => (
                <button
                  key={name}
                  type="button"
                  className="btn btn-sm border"
                  style={{ background: hex, width: 40, height: 32, outline: c.cardColor.toLowerCase() === hex.toLowerCase() ? "3px solid #1F2A44" : undefined }}
                  aria-label={`${name} ${hex}`}
                  onClick={() => set("cardColor", hex)}
                />
              ))}
              <input type="color" className="form-control form-control-color" value={c.cardColor} onChange={(e) => set("cardColor", e.target.value)} aria-label="Custom color" />
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="nav" checked={c.showInNavbar} onChange={(e) => set("showInNavbar", e.target.checked)} />
              <label className="form-check-label" htmlFor="nav">
                Show in navbar &ldquo;More&rdquo; menu
              </label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="foot" checked={c.showInFooter} onChange={(e) => set("showInFooter", e.target.checked)} />
              <label className="form-check-label" htmlFor="foot">
                Show in footer
              </label>
            </div>
          </div>
          <div className="card-x">
            <ImageField label="Category image (social/OG)" folder="categories" value={c.image} onChange={(v) => set("image", v)} />
          </div>
          <div className="card-x" style={{ background: c.cardColor }}>
            <div style={{ fontSize: 28 }}>{c.emoji || "✂️"}</div>
            <div className="fw-bold fs-5" style={{ color: "#14998A" }}>
              {c.name || "Preview"}
            </div>
            <div className="small">{c.description}</div>
          </div>
        </div>
      </div>
    </form>
  );
}
