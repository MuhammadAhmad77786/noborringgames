import { cldOptimized, isCloudinaryUrl } from "@craft/shared";

function escAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getAttr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3]) : undefined;
}

function setAttr(tag: string, name: string, value: string): string {
  const re = new RegExp(`\\s${name}\\s*=\\s*("[^"]*"|'[^']*')`, "i");
  const attr = ` ${name}="${escAttr(value)}"`;
  return re.test(tag) ? tag.replace(re, attr) : tag.replace(/^<img/i, `<img${attr}`);
}

/**
 * Prepares stored post HTML for the public page:
 * - Cloudinary images get f_auto/q_auto + srcset, lazy loading, async decoding
 * - every image gets Pinterest data-pin-* attributes and a hover "Save" button
 */
export function preparePostHtml(
  html: string,
  opts: { pageUrl: string; pinDescription: string; pinMedia?: string },
): string {
  let index = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    index++;
    const src = getAttr(tag, "src") ?? "";
    const alt = getAttr(tag, "alt") ?? "";
    let out = tag;
    if (isCloudinaryUrl(src)) {
      out = setAttr(out, "src", cldOptimized(src, 800));
      out = setAttr(
        out,
        "srcset",
        [400, 800, 1200].map((w) => `${cldOptimized(src, w)} ${w}w`).join(", "),
      );
      out = setAttr(out, "sizes", "(max-width: 820px) 100vw, 780px");
    }
    if (!getAttr(out, "loading")) out = setAttr(out, "loading", index === 1 ? "eager" : "lazy");
    out = setAttr(out, "decoding", "async");
    out = setAttr(out, "data-pin-description", opts.pinDescription);
    if (opts.pinMedia) out = setAttr(out, "data-pin-media", opts.pinMedia);
    out = setAttr(out, "data-pin-url", opts.pageUrl);

    const media = src.startsWith("http") ? src : opts.pinMedia ?? src;
    const pinHref =
      "https://www.pinterest.com/pin/create/button/?" +
      new URLSearchParams({ url: opts.pageUrl, media, description: opts.pinDescription || alt }).toString();
    return `<span class="pin-wrap">${out}<a class="pin-save" href="${escAttr(pinHref)}" target="_blank" rel="noopener nofollow" aria-label="Save this image to Pinterest" data-pin-do="none">Save</a></span>`;
  });
}

/**
 * Splits content at paragraph boundaries so ad slots can be inserted
 * "after the 2nd paragraph" and "mid-content".
 */
export function splitForAds(html: string): { first: string; middle: string; rest: string } {
  // Only split after top-level paragraphs (not ones inside lists/quotes/tables).
  const ends: number[] = [];
  const re = /<(\/?)(blockquote|ul|ol|table|figure|div|p)\b[^>]*>/gi;
  let depth = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (tag === "p") {
      if (closing && depth === 0) ends.push(m.index + m[0].length);
      continue;
    }
    depth = Math.max(0, depth + (closing ? -1 : 1));
  }
  if (ends.length < 3) return { first: html, middle: "", rest: "" };
  const afterSecond = ends[1];
  const midIndex = ends[Math.max(2, Math.floor(ends.length / 2))] ?? html.length;
  if (midIndex <= afterSecond) return { first: html.slice(0, afterSecond), middle: html.slice(afterSecond), rest: "" };
  return {
    first: html.slice(0, afterSecond),
    middle: html.slice(afterSecond, midIndex),
    rest: html.slice(midIndex),
  };
}
