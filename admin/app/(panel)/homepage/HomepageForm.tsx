"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Facet } from "@craft/shared";
import { ImageField } from "@/components/ImageField";
import { useToast } from "@/components/Toast";
import { saveHomepage, type HomepageInput } from "../settings/actions";

function Field({ label, id, value, onChange, textarea, placeholder, help }: { label: string; id: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string; help?: string }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold small" htmlFor={id}>
        {label}
      </label>
      {textarea ? (
        <textarea id={id} className="form-control" rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} className="form-control" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {help && <div className="form-text">{help}</div>}
    </div>
  );
}

export function HomepageForm({ initial, categories }: { initial: HomepageInput; categories: { id: string; name: string; facet: Facet; emoji: string }[] }) {
  const [h, setH] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const set = <K extends keyof HomepageInput>(k: K, v: HomepageInput[K]) => setH((x) => ({ ...x, [k]: v }));
  const seasons = categories.filter((c) => c.facet === "season");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveHomepage(h);
          if (r.ok) {
            toast.show("ok", "Homepage saved — refreshing the live site.");
            router.refresh();
          } else toast.show("err", r.error);
        });
      }}
    >
      {toast.node}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Homepage</h1>
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save homepage"}
        </button>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="card-x">
            <h2>1 · Hero</h2>
            <Field id="badge" label="Badge (with emoji)" value={h.heroBadge} onChange={(v) => set("heroBadge", v)} placeholder="✂️ Real crafts, tested at our kitchen table" />
            <Field id="headline" label="Headline" value={h.heroHeadline} onChange={(v) => set("heroHeadline", v)} placeholder="Every season deserves a little craft." />
            <Field id="highlight" label="Words shown in orange" value={h.heroHighlight} onChange={(v) => set("heroHighlight", v)} placeholder="a little craft." help="Must appear in the headline. Defaults to the last two words." />
            <Field id="para" label="Paragraph" textarea value={h.heroParagraph} onChange={(v) => set("heroParagraph", v)} />
            <label className="form-label fw-bold small">Stats (4)</label>
            <div className="row g-2 mb-2">
              {h.stats.map((s, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <input aria-label={`Stat ${i + 1} value`} className="form-control form-control-sm mb-1 fw-bold" value={s.value} placeholder="100s" onChange={(e) => set("stats", h.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                  <input aria-label={`Stat ${i + 1} label`} className="form-control form-control-sm" value={s.label} placeholder="OF PRINTABLES" onChange={(e) => set("stats", h.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                </div>
              ))}
            </div>
          </div>

          <div className="card-x">
            <h2>3 · In season now</h2>
            <label className="form-label fw-bold small">Current season categories</label>
            <div className="d-flex flex-wrap gap-1 mb-3">
              {seasons.map((c) => {
                const on = h.currentSeasonCategoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    className={`btn btn-sm ${on ? "btn-dark" : "btn-outline-secondary"}`}
                    onClick={() => set("currentSeasonCategoryIds", on ? h.currentSeasonCategoryIds.filter((x) => x !== c.id) : [...h.currentSeasonCategoryIds, c.id])}
                  >
                    {c.emoji} {c.name}
                  </button>
                );
              })}
            </div>
            <div className="row g-2">
              <div className="col-md-6">
                <Field id="s-eyebrow" label="Eyebrow" value={h.seasonRowEyebrow} onChange={(v) => set("seasonRowEyebrow", v)} placeholder="🍂 In season now" />
              </div>
              <div className="col-md-6">
                <Field id="s-title" label="Heading" value={h.seasonRowTitle} onChange={(v) => set("seasonRowTitle", v)} placeholder="Fall & Halloween crafts" />
              </div>
              <div className="col-md-6">
                <Field id="s-sub" label="Subtitle" value={h.seasonRowSubtitle} onChange={(v) => set("seasonRowSubtitle", v)} />
              </div>
              <div className="col-md-6">
                <Field id="s-link" label="Link text" value={h.seasonRowLinkText} onChange={(v) => set("seasonRowLinkText", v)} placeholder="See all fall crafts →" />
              </div>
            </div>
            <hr />
            <label className="form-label fw-bold small">Navbar &ldquo;in-season&rdquo; link</label>
            <div className="row g-2">
              <div className="col-md-6">
                <select aria-label="In-season nav category" className="form-select" value={h.navInSeasonCategoryId} onChange={(e) => set("navInSeasonCategoryId", e.target.value)}>
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <input aria-label="In-season nav label" className="form-control" value={h.navInSeasonLabel} onChange={(e) => set("navInSeasonLabel", e.target.value)} placeholder="Christmas Crafts" />
              </div>
            </div>
          </div>

          <div className="card-x">
            <h2>6 · About the author</h2>
            <Field id="a-eyebrow" label="Eyebrow" value={h.authorEyebrow} onChange={(v) => set("authorEyebrow", v)} placeholder="THE PERSON BEHIND THE CRAFTS" />
            <Field id="a-heading" label="Heading" value={h.authorHeading} onChange={(v) => set("authorHeading", v)} placeholder="Hi, I'm Maya 👋" />
            <Field id="a-bio" label="Short bio" textarea value={h.authorBio} onChange={(v) => set("authorBio", v)} />
            <Field id="a-btn" label="Button text" value={h.authorButtonText} onChange={(v) => set("authorButtonText", v)} placeholder="More about Maya →" />
          </div>

          <div className="card-x">
            <h2>9 · Newsletter band</h2>
            <Field id="n-eyebrow" label="Eyebrow" value={h.newsletterEyebrow} onChange={(v) => set("newsletterEyebrow", v)} placeholder="FREE CRAFT PRINTABLES" />
            <Field id="n-heading" label="Heading" value={h.newsletterHeading} onChange={(v) => set("newsletterHeading", v)} placeholder="Never run out of crafts to make" />
            <Field id="n-text" label="Text" textarea value={h.newsletterText} onChange={(v) => set("newsletterText", v)} />
            <Field id="n-btn" label="Button" value={h.newsletterButton} onChange={(v) => set("newsletterButton", v)} placeholder="SEND ME CRAFTS" />
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card-x">
            <ImageField label="Hero image (transparent PNG cut-out)" folder="site" value={h.heroImage} onChange={(v) => set("heroImage", v)} help="A child's hands holding a finished paper craft works best. Square-ish, transparent background." />
          </div>
          <div className="card-x">
            <ImageField label="Author photo" folder="authors" value={h.authorPhoto} onChange={(v) => set("authorPhoto", v)} ratio="4/5" />
          </div>
          <div className="card-x">
            <h2>8 · Pinterest row (5 pins)</h2>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="fallback" checked={h.usePostPinsFallback} onChange={(e) => set("usePostPinsFallback", e.target.checked)} />
              <label className="form-check-label small" htmlFor="fallback">
                If no pins are set here, use the newest posts&apos; Pinterest images
              </label>
            </div>
            {h.pins.map((p, i) => (
              <div className="repeater-row" key={i}>
                <ImageField label={`Pin ${i + 1}`} folder="pins" ratio="2/3" value={p.image} onChange={(v) => set("pins", h.pins.map((x, j) => (j === i ? { ...x, image: v ?? undefined } : x)))} />
                <input aria-label={`Pin ${i + 1} link`} className="form-control form-control-sm" type="url" placeholder="https://www.pinterest.com/pin/…" value={p.link ?? ""} onChange={(e) => set("pins", h.pins.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
