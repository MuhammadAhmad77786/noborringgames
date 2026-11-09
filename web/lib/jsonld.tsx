import { stripHtml, type PostDTO, type SiteSettingsDTO } from "@craft/shared";
import { abs } from "./site";

type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function websiteLd(settings: SiteSettingsDTO) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteTitle,
    url: abs("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${abs("/search")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Extracts h2/h3 headings + their following text as HowTo steps. */
function extractSteps(html: string): { name: string; text: string }[] {
  const steps: { name: string; text: string }[] = [];
  const re = /<h[23][^>]*>([\s\S]*?)<\/h[23]>([\s\S]*?)(?=<h[23]|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const name = stripHtml(m[1]);
    const text = stripHtml(m[2]).slice(0, 500);
    if (/^step\b|^\d+[.)]/i.test(name) && text) steps.push({ name, text });
  }
  // Fall back to an ordered list.
  if (!steps.length) {
    const ol = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (ol) {
      const items = ol[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [];
      items.forEach((li, i) => {
        const text = stripHtml(li);
        if (text) steps.push({ name: `Step ${i + 1}`, text });
      });
    }
  }
  return steps;
}

export function postLd(post: PostDTO, settings: SiteSettingsDTO, url: string) {
  const image = [post.featuredImage?.url, post.pinterestImage?.url].filter(Boolean).map((u) =>
    u!.startsWith("http") ? u! : abs(u!),
  );
  const author = post.author?.name || settings.authorName || settings.siteTitle;
  const base = {
    "@context": "https://schema.org",
    headline: post.title,
    name: post.title,
    description: post.seo?.metaDescription || post.excerpt || "",
    image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: author, url: abs("/about") },
    publisher: {
      "@type": "Organization",
      name: settings.siteTitle,
      logo: settings.logo?.url ? { "@type": "ImageObject", url: settings.logo.url } : undefined,
    },
    mainEntityOfPage: url,
  };

  const steps = extractSteps(post.content);
  if (post.supplies?.length && steps.length >= 2) {
    return {
      ...base,
      "@type": "HowTo",
      totalTime: toIsoDuration(post.timeNeeded),
      supply: post.supplies.map((s) => ({ "@type": "HowToSupply", name: s.name })),
      step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
    };
  }
  return { ...base, "@type": "Article" };
}

/** "15 min", "1 hour", "1 hr 30 min" -> ISO 8601 duration. */
function toIsoDuration(text?: string): string | undefined {
  if (!text) return undefined;
  const h = text.match(/(\d+)\s*(h|hr|hour)/i);
  const m = text.match(/(\d+)\s*(m|min)/i);
  if (!h && !m) return undefined;
  return `PT${h ? `${h[1]}H` : ""}${m ? `${m[1]}M` : ""}`;
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw; escape "<" so content can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
