"use client";

import { useEffect, useRef } from "react";

/**
 * Injects an admin-provided HTML snippet (ad network tags) and executes any
 * <script> tags inside it. `target="head"` appends to document.head once.
 */
export function HtmlSnippet({
  html,
  target = "inline",
  className,
}: {
  html: string;
  target?: "inline" | "head";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!html) return;
    const host = target === "head" ? document.head : ref.current;
    if (!host) return;
    const marker = `snippet-${hash(html)}`;
    if (target === "head" && document.head.querySelector(`[data-snippet="${marker}"]`)) return;
    const frag = document.createRange().createContextualFragment(html);
    frag.childNodes.forEach((n) => {
      if (n instanceof Element) n.setAttribute("data-snippet", marker);
    });
    host.appendChild(frag);
    return () => {
      if (target === "inline") host.innerHTML = "";
    };
  }, [html, target]);

  if (target === "head") return null;
  return <div ref={ref} className={className} />;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
