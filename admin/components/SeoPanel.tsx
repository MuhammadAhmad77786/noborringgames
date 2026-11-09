"use client";

import { useMemo, useSyncExternalStore } from "react";
import { SEO_LIMITS, firstParagraph, stripHtml, truncate, type SeoFields } from "@craft/shared";

let canvas: HTMLCanvasElement | null = null;
const noopSubscribe = () => () => {};
/** True only after hydration, so server and first client render agree. */
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
function pxWidth(text: string, measure: boolean, font = "20px Arial") {
  if (!measure || typeof document === "undefined") return text.length * 9;
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 9;
  ctx.font = font;
  return ctx.measureText(text).width;
}

function Bar({ value, max, okMin = 0 }: { value: number; max: number; okMin?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value > max ? "#c0392b" : value >= okMin ? "#14998a" : "#f0a500";
  return (
    <div className="seo-bar mt-1" aria-hidden="true">
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="check-item">
      <span className={ok ? "check-ok" : "check-bad"} aria-hidden="true">
        {ok ? "✔" : "✘"}
      </span>
      <span>
        <span className="visually-hidden">{ok ? "Pass: " : "Fix: "}</span>
        {children}
      </span>
    </div>
  );
}

export function SeoPanel({
  seo,
  onChange,
  title,
  slug,
  content,
  excerpt,
  pinterestDescription,
  imageAlts,
  url,
  siteTitle,
  titleTemplate,
}: {
  seo: SeoFields;
  onChange: (s: SeoFields) => void;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  pinterestDescription: string;
  imageAlts: string[];
  url: string;
  siteTitle: string;
  titleTemplate: string;
}) {
  const set = (patch: Partial<SeoFields>) => onChange({ ...seo, ...patch });
  const baseTitle = seo.title?.trim() || title;
  const fullTitle = (titleTemplate || "%title% | %site%").replace("%title%", baseTitle).replace("%site%", siteTitle);
  const desc = seo.metaDescription?.trim() || excerpt || truncate(stripHtml(content), 158);
  const isClient = useIsClient();
  const titlePx = pxWidth(fullTitle, isClient);
  const kw = (seo.focusKeyword ?? "").trim().toLowerCase();

  const checks = useMemo(() => {
    if (!kw) return null;
    const kwSlug = kw.replace(/[^a-z0-9]+/g, "-");
    const contentAlts = Array.from(content.matchAll(/<img[^>]*alt="([^"]*)"/gi)).map((m) => m[1]);
    const alts = [...imageAlts, ...contentAlts].map((a) => a.toLowerCase());
    const text = stripHtml(content).toLowerCase();
    const words = text.split(/\s+/).filter(Boolean).length;
    const occurrences = text.split(kw).length - 1;
    return [
      { ok: baseTitle.toLowerCase().includes(kw), label: "Focus keyword in SEO title" },
      { ok: baseTitle.toLowerCase().startsWith(kw) || baseTitle.toLowerCase().indexOf(kw) < 20, label: "Keyword near the start of the title" },
      { ok: desc.toLowerCase().includes(kw), label: "Focus keyword in meta description" },
      { ok: firstParagraph(content).toLowerCase().includes(kw), label: "Focus keyword in the first paragraph" },
      { ok: slug.includes(kwSlug), label: "Focus keyword in the URL slug" },
      { ok: alts.some((a) => a.includes(kw)), label: "Focus keyword in an image alt text" },
      { ok: pinterestDescription.toLowerCase().includes(kw), label: "Focus keyword in the Pinterest description" },
      { ok: words >= 300, label: `Content length ${words} words (300+ recommended)` },
      { ok: occurrences >= 2, label: `Keyword appears ${occurrences}× in content` },
    ];
  }, [kw, baseTitle, desc, content, slug, imageAlts, pinterestDescription]);

  const score = checks ? Math.round((checks.filter((c) => c.ok).length / checks.length) * 100) : null;

  return (
    <div className="card-x">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="m-0">SEO</h2>
        {score !== null && (
          <span className={`badge fs-6 ${score >= 80 ? "text-bg-success" : score >= 50 ? "text-bg-warning" : "text-bg-danger"}`}>
            {score}/100
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="small fw-bold text-secondary mb-1">Google preview</div>
        <div className="serp">
          <div className="serp-url">{url}</div>
          <div className="serp-title">{fullTitle}</div>
          <div className="serp-desc">{truncate(desc, 160)}</div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="seo-kw">
          Focus keyword
        </label>
        <input id="seo-kw" className="form-control" value={seo.focusKeyword ?? ""} onChange={(e) => set({ focusKeyword: e.target.value })} placeholder="e.g. paper plate pumpkin craft" />
      </div>
      {checks && (
        <div className="mb-3 p-2 bg-light rounded">
          {checks.map((c) => (
            <Check key={c.label} ok={c.ok}>
              {c.label}
            </Check>
          ))}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="seo-title">
          SEO title
        </label>
        <input id="seo-title" className="form-control" value={seo.title ?? ""} onChange={(e) => set({ title: e.target.value })} placeholder={title} />
        <Bar value={titlePx} max={SEO_LIMITS.titleMaxPx} okMin={300} />
        <div className="form-text">
          {fullTitle.length} characters · {Math.round(titlePx)} / {SEO_LIMITS.titleMaxPx}px
          {titlePx > SEO_LIMITS.titleMaxPx && " — Google will likely truncate this."}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="seo-desc">
          Meta description
        </label>
        <textarea id="seo-desc" className="form-control" rows={3} value={seo.metaDescription ?? ""} onChange={(e) => set({ metaDescription: e.target.value })} placeholder="Falls back to the excerpt" />
        <Bar value={(seo.metaDescription ?? "").length} max={SEO_LIMITS.descMax} okMin={SEO_LIMITS.descMin} />
        <div className="form-text">
          {(seo.metaDescription ?? "").length} / {SEO_LIMITS.descMax} characters (aim for {SEO_LIMITS.descMin}–{SEO_LIMITS.descMax})
        </div>
      </div>

      <details>
        <summary className="fw-bold mb-2">Advanced</summary>
        <div className="mb-3">
          <label className="form-label fw-bold" htmlFor="seo-canonical">
            Canonical URL override
          </label>
          <input id="seo-canonical" className="form-control" type="url" value={seo.canonicalUrl ?? ""} onChange={(e) => set({ canonicalUrl: e.target.value })} placeholder={url} />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold" htmlFor="seo-og">
            Social (OG) image URL override
          </label>
          <input id="seo-og" className="form-control" type="url" value={seo.ogImage ?? ""} onChange={(e) => set({ ogImage: e.target.value })} placeholder="Defaults to the featured image" />
        </div>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="seo-noindex" checked={!!seo.noindex} onChange={(e) => set({ noindex: e.target.checked })} />
          <label className="form-check-label" htmlFor="seo-noindex">
            noindex — hide from search engines
          </label>
        </div>
      </details>
    </div>
  );
}
