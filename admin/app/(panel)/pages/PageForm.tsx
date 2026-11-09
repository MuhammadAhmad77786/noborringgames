"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { slugify } from "@craft/shared";
import { ConfirmButton } from "@/components/ConfirmButton";
import { RichEditor } from "@/components/RichEditor";
import { SeoPanel } from "@/components/SeoPanel";
import { useToast } from "@/components/Toast";
import { deletePage, savePage, type PageInput } from "./actions";

export function PageForm({ initial, siteUrl, siteTitle, titleTemplate }: { initial: PageInput; siteUrl: string; siteTitle: string; titleTemplate: string }) {
  const [p, setP] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const slug = p.slug || slugify(p.title);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await savePage({ ...p, slug });
          if (!r.ok) return toast.show("err", r.error);
          toast.show("ok", "Page saved");
          if (!initial.id) router.replace(`/pages/${r.id}`);
          else router.refresh();
        });
      }}
    >
      {toast.node}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">{initial.id ? "Edit page" : "New page"}</h1>
        <div className="d-flex gap-2">
          {initial.id && (
            <ConfirmButton
              onConfirm={() =>
                start(async () => {
                  const r = await deletePage(initial.id!);
                  if (r.ok) router.push("/pages");
                  else toast.show("err", r.error);
                })
              }
            >
              Delete
            </ConfirmButton>
          )}
          <button className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="card-x">
            <label className="form-label fw-bold" htmlFor="ptitle">
              Title
            </label>
            <input id="ptitle" className="form-control form-control-lg fw-bold" required value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
            <div className="mt-2 small d-flex gap-2 align-items-center">
              <span className="text-secondary">{siteUrl}/</span>
              <input aria-label="Slug" className="form-control form-control-sm" style={{ maxWidth: 280 }} value={p.slug} placeholder={slugify(p.title)} onChange={(e) => setP({ ...p, slug: e.target.value })} />
            </div>
          </div>
          <RichEditor value={p.content} onChange={(content) => setP((x) => ({ ...x, content }))} folder="pages" />
        </div>
        <div className="col-12 col-xl-4">
          <SeoPanel
            seo={p.seo}
            onChange={(seo) => setP({ ...p, seo })}
            title={p.title}
            slug={slug}
            content={p.content}
            excerpt=""
            pinterestDescription=""
            imageAlts={[]}
            url={`${siteUrl}/${slug}`}
            siteTitle={siteTitle}
            titleTemplate={titleTemplate}
          />
        </div>
      </div>
    </form>
  );
}
