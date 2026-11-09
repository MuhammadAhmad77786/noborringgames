"use client";

import { useState } from "react";
import { FacebookIcon, LinkIcon, PinterestIcon } from "../Icons";

export function ShareButtons({ url, media, description }: { url: string; media?: string; description: string }) {
  const [copied, setCopied] = useState(false);
  const pin =
    "https://www.pinterest.com/pin/create/button/?" +
    new URLSearchParams({ url, media: media ?? "", description }).toString();
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="share-row" aria-label="Share this craft">
      <strong className="me-1">Share:</strong>
      <a className="share-btn pinterest" href={pin} target="_blank" rel="noopener nofollow">
        <PinterestIcon size={18} /> Pin it
      </a>
      <a className="share-btn" href={fb} target="_blank" rel="noopener nofollow">
        <FacebookIcon size={18} /> Facebook
      </a>
      <button type="button" className="share-btn" onClick={copy}>
        <LinkIcon /> {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
