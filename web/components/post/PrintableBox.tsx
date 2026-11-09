"use client";

import Image from "next/image";
import { useState } from "react";
import { formatBytes, type Printable } from "@craft/shared";
import { DownloadIcon } from "../Icons";

function PrintableItem({ postId, printable }: { postId: string; printable: Printable }) {
  const directUrl = `/api/download/${postId}/${printable._id}`;
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const meta = [
    printable.pages ? `${printable.pages} ${printable.pages === 1 ? "page" : "pages"}` : null,
    formatBytes(printable.fileSize) || null,
    "PDF",
  ]
    .filter(Boolean)
    .join(" · ");

  async function unlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "printable", postId, printableId: printable._id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Please check your details.");
      setUnlockedUrl(json.downloadUrl);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const fid = `gate-${printable._id}`;

  return (
    <div className="printable-item">
      <div className="printable-thumb">
        {printable.previewImage?.url && (
          <Image
            src={printable.previewImage.url}
            alt={printable.previewImage.alt || `${printable.title} preview`}
            fill
            sizes="140px"
          />
        )}
      </div>
      <div>
        <h3 className="h4 mb-1">{printable.title}</h3>
        <p className="printable-meta">{meta}</p>
        {!printable.requireEmail || unlockedUrl ? (
          <a href={unlockedUrl ?? directUrl} className="btn-x btn-orange" rel="nofollow">
            <DownloadIcon /> Download free PDF
          </a>
        ) : (
          <>
            <p className="mb-1 small fw-bold">Pop in your email and the PDF is yours. We&apos;ll send a few more freebies too.</p>
            <form className="gate-form" onSubmit={unlock}>
              <label htmlFor={`${fid}-n`} className="visually-hidden-x">
                First name
              </label>
              <input id={`${fid}-n`} name="firstName" placeholder="First name" autoComplete="given-name" />
              <label htmlFor={`${fid}-e`} className="visually-hidden-x">
                Email
              </label>
              <input id={`${fid}-e`} name="email" type="email" required placeholder="Email address" autoComplete="email" />
              <div className="hp-field" aria-hidden="true">
                <input name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <button className="btn-x btn-orange" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Unlocking…" : "Get the printable"}
              </button>
            </form>
            {status === "error" && (
              <p className="form-msg text-danger" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function PrintableBox({ postId, printables }: { postId: string; printables: Printable[] }) {
  if (!printables.length) return null;
  return (
    <section className="printable-box" id="printable" aria-labelledby="printable-title">
      <span className="eyebrow">Free printable</span>
      <h2 className="box-title" id="printable-title">
        Grab your free printable
      </h2>
      {printables.map((p) => (
        <PrintableItem key={p._id} postId={postId} printable={p} />
      ))}
      <p className="small mt-3 mb-0">For personal and classroom use. Print on regular or cardstock paper, &ldquo;actual size&rdquo;.</p>
    </section>
  );
}
