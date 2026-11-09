/** Helpers used by the admin SEO panel and by the public site's metadata. */

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function firstParagraph(html: string): string {
  const m = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return stripHtml(m ? m[1] : html).slice(0, 600);
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

export function applyTitleTemplate(title: string, template?: string, siteTitle?: string): string {
  if (!template) return title;
  return template.replace("%title%", title).replace("%site%", siteTitle ?? "");
}

export const SEO_LIMITS = {
  titleMaxChars: 60,
  titleMaxPx: 580,
  descMin: 120,
  descMax: 160,
};
