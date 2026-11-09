import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PostGrid } from "@/components/PostCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getPageBySlug, getPicks, getSettings } from "@/lib/data";
import { JsonLd, breadcrumbLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/post-meta";
import { buildMetadata } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [s, page] = await Promise.all([getSettings(), getPageBySlug("about")]);
  if (page) return pageMetadata(page, s, "/about");
  return buildMetadata(s, { title: `About ${s.authorName ?? s.siteTitle}`, path: "/about" });
}

export default async function AboutPage() {
  const [settings, page, picks] = await Promise.all([getSettings(), getPageBySlug("about"), getPicks(3)]);
  const { home } = settings;
  const first = settings.authorName?.split(" ")[0] ?? "me";

  return (
    <div className="container-x">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: settings.authorName,
          image: home.authorPhoto?.url,
          sameAs: Object.values(settings.socialLinks).filter(Boolean),
        }}
      />
      <section className="section">
        <div className="row g-5 align-items-start">
          <div className="col-12 col-md-5 col-lg-4">
            <div className="author-photo">
              {home.authorPhoto?.url && (
                <Image src={home.authorPhoto.url} alt={home.authorPhoto.alt || settings.authorName || ""} fill priority sizes="(max-width: 767px) 90vw, 380px" />
              )}
            </div>
          </div>
          <div className="col-12 col-md-7 col-lg-8">
            <span className="eyebrow">{home.authorEyebrow || "The person behind the crafts"}</span>
            <h1 className="post-title">
              <span className="hl hl-wrap">{page?.title || `Hi, I'm ${first} 👋`}</span>
            </h1>
            {page?.content ? (
              <div className="prose" dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <p className="prose">{home.authorBio}</p>
            )}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Link href="/crafts" className="btn-x btn-orange">
                Browse all crafts
              </Link>
              <Link href="/contact" className="btn-x btn-outline">
                Say hello →
              </Link>
            </div>
          </div>
        </div>
      </section>
      {picks.length > 0 && (
        <section className="section pt-0">
          <SectionHeading eyebrow={`${first}'s favourites`} title="Start with these" highlight="these" />
          <PostGrid posts={picks} permalink={settings.permalink} />
        </section>
      )}
    </div>
  );
}
