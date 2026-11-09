"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/ImageField";
import { useToast } from "@/components/Toast";
import { saveSettings, type SettingsInput } from "./actions";

const TABS = ["Identity", "SEO", "Analytics", "Ads", "Email"] as const;

export function SettingsForm({ initial, hasApiKey, siteUrl }: { initial: SettingsInput; hasApiKey: boolean; siteUrl: string }) {
  const [s, setS] = useState(initial);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Identity");
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const set = <K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) => setS((x) => ({ ...x, [k]: v }));
  const input = (label: string, key: keyof SettingsInput, opts: { placeholder?: string; help?: string; textarea?: boolean } = {}) => (
    <div className="mb-3">
      <label className="form-label fw-bold small" htmlFor={`s-${key}`}>
        {label}
      </label>
      {opts.textarea ? (
        <textarea id={`s-${key}`} className="form-control" rows={3} value={String(s[key] ?? "")} placeholder={opts.placeholder} onChange={(e) => set(key, e.target.value as never)} />
      ) : (
        <input id={`s-${key}`} className="form-control" value={String(s[key] ?? "")} placeholder={opts.placeholder} onChange={(e) => set(key, e.target.value as never)} />
      )}
      {opts.help && <div className="form-text">{opts.help}</div>}
    </div>
  );
  const adField = (label: string, key: keyof SettingsInput["ads"], help: string) => (
    <div className="mb-3">
      <label className="form-label fw-bold small" htmlFor={`ad-${key}`}>
        {label}
      </label>
      <textarea id={`ad-${key}`} className="form-control font-monospace" rows={4} style={{ fontSize: 12 }} value={s.ads[key] ?? ""} onChange={(e) => set("ads", { ...s.ads, [key]: e.target.value })} />
      <div className="form-text">{help}</div>
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveSettings(s);
          if (r.ok) {
            toast.show("ok", "Settings saved");
            router.refresh();
          } else toast.show("err", r.error);
        });
      }}
    >
      {toast.node}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Settings</h1>
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
      <ul className="nav nav-pills mb-3" role="tablist">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button type="button" role="tab" aria-selected={tab === t} className={`nav-link ${tab === t ? "active bg-dark" : "text-dark"}`} onClick={() => setTab(t)}>
              {t}
            </button>
          </li>
        ))}
      </ul>

      {tab === "Identity" && (
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="card-x">
              {input("Site title", "siteTitle")}
              {input("Tagline", "tagline", { placeholder: "Free printable crafts for every season" })}
              {input("Author name", "authorName", { help: "Used in the navbar (About …), bylines and the homepage." })}
              {input("Footer blurb", "footerBlurb", { textarea: true })}
            </div>
            <div className="card-x">
              <h2>Social links</h2>
              {(["facebook", "instagram", "pinterest"] as const).map((k) => (
                <div className="mb-2" key={k}>
                  <label className="form-label small fw-bold text-capitalize" htmlFor={`soc-${k}`}>
                    {k}
                  </label>
                  <input id={`soc-${k}`} type="url" className="form-control" value={s.socialLinks[k] ?? ""} placeholder={`https://www.${k}.com/…`} onChange={(e) => set("socialLinks", { ...s.socialLinks, [k]: e.target.value })} />
                </div>
              ))}
              {input("Pinterest handle", "pinterestHandle", { placeholder: "paperpinwheel" })}
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="card-x">
              <ImageField label="Logo (square icon)" folder="site" value={s.logo} onChange={(v) => set("logo", v)} requireAlt={false} help="Leave empty to use the built-in pinwheel mark." />
              <ImageField label="Favicon (512×512 PNG)" folder="site" value={s.favicon} onChange={(v) => set("favicon", v)} requireAlt={false} />
            </div>
          </div>
        </div>
      )}

      {tab === "SEO" && (
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="card-x">
              {input("Title template", "titleTemplate", { help: "Use %title% and %site%. Example: %title% | %site%" })}
              {input("Default meta description", "defaultMetaDescription", { textarea: true })}
              <label className="form-label fw-bold small">Permalink structure</label>
              {(
                [
                  ["post", `${siteUrl}/post-slug`],
                  ["category-post", `${siteUrl}/category-slug/post-slug`],
                ] as const
              ).map(([v, label]) => (
                <div className="form-check" key={v}>
                  <input className="form-check-input" type="radio" name="permalink" id={`pl-${v}`} checked={s.permalink === v} onChange={() => set("permalink", v)} />
                  <label className="form-check-label" htmlFor={`pl-${v}`}>
                    <code>{label}</code>
                  </label>
                </div>
              ))}
              <div className="form-text">Switching is safe: old URLs 301-redirect to the new structure.</div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="card-x">
              <ImageField label="Default social (OG) image — 1200×630" folder="site" value={s.defaultOgImage} onChange={(v) => set("defaultOgImage", v)} />
            </div>
          </div>
        </div>
      )}

      {tab === "Analytics" && (
        <div className="card-x" style={{ maxWidth: 720 }}>
          {input("Google Analytics 4 measurement ID", "ga4Id", { placeholder: "G-XXXXXXXXXX" })}
          {input("Google Search Console verification", "searchConsoleVerification", { help: "Just the content value of the google-site-verification meta tag." })}
          {input("Pinterest domain verification", "pinterestVerification", { help: "The content value of the p:domain_verify meta tag." })}
        </div>
      )}

      {tab === "Ads" && (
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="card-x">
              <p className="small text-secondary">
                Slots render nothing until you paste a snippet. When filled, each slot reserves its height so pages don&apos;t jump (no CLS).
              </p>
              {adField("Ad network head script", "headScript", "Loaded once on every page (e.g. Mediavine/Raptive/AdSense loader).")}
              {adField("After 2nd paragraph", "afterSecondParagraph", "Inside posts, after the second paragraph.")}
              {adField("Mid-content", "midContent", "Inside posts, halfway through the content.")}
              {adField("In-content (after printable)", "inContent", "Below the printable download box.")}
              {adField("Sticky bottom (mobile)", "stickyMobile", "Fixed to the bottom of the screen on phones only.")}
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="card-x">
              <label className="form-label fw-bold small" htmlFor="adstxt">
                ads.txt
              </label>
              <textarea id="adstxt" className="form-control font-monospace" rows={14} style={{ fontSize: 12 }} value={s.adsTxt} onChange={(e) => set("adsTxt", e.target.value)} />
              <div className="form-text">
                Served at <code>{siteUrl}/ads.txt</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Email" && (
        <div className="card-x" style={{ maxWidth: 720 }}>
          <p className="small text-secondary">Subscribers are always saved in the database. Optionally also send them to your email provider.</p>
          <label className="form-label fw-bold small" htmlFor="ep">
            Provider
          </label>
          <select id="ep" className="form-select mb-3" value={s.emailProvider.provider} onChange={(e) => set("emailProvider", { ...s.emailProvider, provider: e.target.value as SettingsInput["emailProvider"]["provider"] })}>
            <option value="none">None (database only)</option>
            <option value="mailerlite">MailerLite</option>
            <option value="convertkit">Kit (ConvertKit)</option>
          </select>
          {s.emailProvider.provider !== "none" && (
            <>
              <label className="form-label fw-bold small" htmlFor="ep-key">
                API key {hasApiKey && <span className="badge text-bg-success ms-1">saved</span>}
              </label>
              <input id="ep-key" type="password" autoComplete="off" className="form-control mb-1" value={s.emailProvider.apiKey} placeholder={hasApiKey ? "Leave blank to keep the saved key" : ""} onChange={(e) => set("emailProvider", { ...s.emailProvider, apiKey: e.target.value })} />
              <label className="form-label fw-bold small mt-2" htmlFor="ep-list">
                {s.emailProvider.provider === "mailerlite" ? "Group ID (optional)" : "Form ID"}
              </label>
              <input id="ep-list" className="form-control" value={s.emailProvider.listId} onChange={(e) => set("emailProvider", { ...s.emailProvider, listId: e.target.value })} />
            </>
          )}
        </div>
      )}
    </form>
  );
}
