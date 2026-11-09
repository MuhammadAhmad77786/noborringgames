import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Confetti } from "@/components/Confetti";
import { PinterestIcon } from "@/components/Icons";
import { NewsletterForm } from "@/components/NewsletterForm";
import { PostCard, PostGrid } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { Highlighted, SectionHeading } from "@/components/SectionHeading";
import {
  getAllCategories,
  getLatestPosts,
  getPicks,
  getPinPosts,
  getPostsInCategories,
  getSettings,
} from "@/lib/data";
import { JsonLd, websiteLd } from "@/lib/jsonld";
import { buildMetadata, postHref } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: s.tagline ? `${s.siteTitle} — ${s.tagline}` : s.siteTitle,
    rawTitle: true,
    description: s.defaultMetaDescription,
    path: "/",
  });
}

export default async function HomePage() {
  const settings = await getSettings();
  const { home } = settings;
  const [categories, picks, latest, pinPosts] = await Promise.all([
    getAllCategories(),
    getPicks(3),
    getLatestPosts(8),
    getPinPosts(5),
  ]);
  const seasonPosts = await getPostsInCategories(home.currentSeasonCategoryIds ?? [], 4);
  const audience = categories.filter((c) => c.facet === "audience").slice(0, 6);
  const craftTypes = categories.filter((c) => c.facet === "craftType");
  const seasonCats = categories.filter((c) => home.currentSeasonCategoryIds?.includes(c._id));
  const firstSeason = seasonCats[0];
  const authorFirst = settings.authorName?.split(" ")[0] || "me";
  const pl = settings.permalink;

  // Pin row: admin-curated pins, falling back to posts' Pinterest images.
  const curatedPins = (home.pins ?? []).filter((p) => p.image?.url).slice(0, 5);
  const pins =
    curatedPins.length > 0 || !home.usePostPinsFallback
      ? curatedPins.map((p) => ({ src: p.image!.url, alt: p.image!.alt || "Craft pin", href: p.link || "#" }))
      : pinPosts.map((p) => ({
          src: p.pinterestImage!.url,
          alt: p.pinterestImage!.alt || p.title,
          href: postHref(p, pl),
        }));
  const pinterestUrl =
    settings.socialLinks.pinterest ||
    (settings.pinterestHandle ? `https://www.pinterest.com/${settings.pinterestHandle}/` : "#");

  const headline = home.heroHeadline || "Every season deserves a little craft.";

  return (
    <>
      <JsonLd data={websiteLd(settings)} />

      {/* 1. Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <Confetti />
        <div className="container-x position-relative">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7">
              {home.heroBadge && <span className="hero-badge">{home.heroBadge}</span>}
              <h1 className="hero-title" id="hero-title">
                <HeroHeadline text={headline} highlight={home.heroHighlight} />
              </h1>
              {home.heroParagraph && <p className="hero-lead">{home.heroParagraph}</p>}
              <SearchBar />
              <div className="hero-ctas">
                <Link href="/crafts" className="btn-x btn-orange">
                  Browse all crafts
                </Link>
                <span className="hero-or">or</span>
                <Link href={firstSeason ? `/category/${firstSeason.slug}` : "/crafts"} className="btn-x btn-outline">
                  See what&apos;s in season →
                </Link>
              </div>
              {home.stats?.length > 0 && (
                <dl className="stats">
                  {home.stats.slice(0, 4).map((s) => (
                    <div key={s.label}>
                      <dt className="visually-hidden-x">{s.label}</dt>
                      <dd className="m-0">
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label" aria-hidden="true">
                          {s.label}
                        </div>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <div className="col-12 col-lg-5">
              <div className="hero-art">
                <div className="hero-blob" />
                {home.heroImage?.url && (
                  <Image
                    src={home.heroImage.url}
                    alt={home.heroImage.alt || ""}
                    fill
                    priority
                    sizes="(max-width: 991px) 90vw, 480px"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Who's crafting? */}
      {audience.length > 0 && (
        <section className="section" aria-labelledby="who-title">
          <div className="container-x">
            <SectionHeading
              id="who-title"
              eyebrow="Start here"
              title="Who's crafting?"
              highlight="crafting?"
              subtitle="Pick your crew and we'll show you crafts that fit their hands and attention span."
            />
            <div className="grid-3">
              {audience.map((c) => (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  className="card-retro audience-card"
                  style={{ background: c.cardColor || "#FDE3D3" }}
                >
                  <span className="emoji" aria-hidden="true">
                    {c.emoji}
                  </span>
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. In season now */}
      {seasonPosts.length > 0 && (
        <section className="section band-mint" aria-labelledby="season-title">
          <div className="container-x">
            <SectionHeading
              id="season-title"
              eyebrow={home.seasonRowEyebrow || "🍂 In season now"}
              title={home.seasonRowTitle || `${seasonCats.map((c) => c.name).join(" & ")} crafts`}
              highlight={seasonCats[0]?.name}
              subtitle={home.seasonRowSubtitle || "This row fills itself from your newest seasonal posts."}
              link={
                firstSeason
                  ? { href: `/category/${firstSeason.slug}`, label: home.seasonRowLinkText || `See all ${firstSeason.name.toLowerCase()} crafts →` }
                  : undefined
              }
            />
            <PostGrid posts={seasonPosts} permalink={pl} />
          </div>
        </section>
      )}

      {/* 4. Most-loved crafts */}
      {picks.length > 0 && (
        <section className="section" aria-labelledby="picks-title">
          <div className="container-x">
            <SectionHeading
              id="picks-title"
              eyebrow={`Hand-picked by ${authorFirst}`}
              title="Most-loved crafts"
              highlight="Most-loved"
              subtitle="The ones readers print again and again — tested, fussed over and kid-approved."
            />
            <div className="grid-3">
              {picks.map((p) => (
                <PostCard key={p._id} post={p} permalink={pl} size="lg" pick />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Browse by craft type */}
      {craftTypes.length > 0 && (
        <section className="section-tight" aria-labelledby="types-title">
          <div className="container-x">
            <SectionHeading
              id="types-title"
              eyebrow="Another way in"
              title="Browse by craft type"
              highlight="craft type"
              subtitle="Know what you're in the mood for? Jump straight to it."
            />
            <div className="pill-row">
              {craftTypes.map((c) => (
                <Link key={c._id} href={`/category/${c.slug}`} className="pill">
                  <span aria-hidden="true">{c.emoji}</span>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. About the author */}
      <section className="section" aria-labelledby="author-title">
        <div className="container-x">
          <div className="row g-5 align-items-center">
            <div className="col-12 col-md-5 col-lg-4">
              <div className="author-photo">
                {home.authorPhoto?.url && (
                  <Image
                    src={home.authorPhoto.url}
                    alt={home.authorPhoto.alt || settings.authorName || ""}
                    fill
                    sizes="(max-width: 767px) 90vw, 380px"
                  />
                )}
              </div>
            </div>
            <div className="col-12 col-md-7 col-lg-8">
              <div className="author-card">
                <span className="eyebrow">{home.authorEyebrow || "The person behind the crafts"}</span>
                <h2 id="author-title">{home.authorHeading || `Hi, I'm ${authorFirst} 👋`}</h2>
                {home.authorBio && <p className="mb-4">{home.authorBio}</p>}
                <Link href="/about" className="btn-x btn-teal">
                  {home.authorButtonText || `More about ${authorFirst} →`}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Latest crafts */}
      {latest.length > 0 && (
        <section className="section pt-0" aria-labelledby="latest-title">
          <div className="container-x">
            <SectionHeading
              id="latest-title"
              eyebrow="Fresh off the press"
              title="Latest crafts"
              highlight="Latest"
              subtitle="New printables and projects, straight from the craft table."
              link={{ href: "/crafts", label: "All crafts →" }}
            />
            <PostGrid posts={latest} permalink={pl} />
            <div className="text-center mt-5">
              <Link href="/crafts" className="btn-x btn-orange">
                See all crafts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 8. Pinterest */}
      <section className="pt-5" aria-labelledby="pin-title">
        <div className="container-x text-center mb-4">
          <div className="stripe stripe-short" />
          <span className="eyebrow">Where our craft time begins</span>
          <h2 className="section-title" id="pin-title">
            Follow me on <Highlighted title="Pinterest" />
          </h2>
          {settings.pinterestHandle && (
            <p className="section-sub">
              <a href={pinterestUrl} target="_blank" rel="noopener">
                @{settings.pinterestHandle}
              </a>
            </p>
          )}
        </div>
        <div className="pin-row">
          {pins.slice(0, 5).map((p, i) => (
            <Link key={`${p.href}-${i}`} href={p.href} className="pin-tile">
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 767px) 33vw, 17vw" />
            </Link>
          ))}
          <a href={pinterestUrl} className="pin-tile pin-cta" target="_blank" rel="noopener">
            <PinterestIcon size={44} />
            <span>SEE ALL OUR PINS →</span>
          </a>
        </div>
      </section>

      {/* 9. Newsletter */}
      <section className="section band-teal text-center" aria-labelledby="nl-title">
        <div className="container-x">
          <span className="eyebrow">{home.newsletterEyebrow || "Free craft printables"}</span>
          <h2 className="section-title" id="nl-title">
            {home.newsletterHeading || "Never run out of crafts to make"}
          </h2>
          {home.newsletterText && <p className="mb-0 mx-auto" style={{ maxWidth: 560 }}>{home.newsletterText}</p>}
          <NewsletterForm buttonText={home.newsletterButton || "SEND ME CRAFTS"} />
        </div>
      </section>
    </>
  );
}

/** Headline with the highlighted phrase (default: last two words) in orange. */
function HeroHeadline({ text, highlight }: { text: string; highlight?: string }) {
  let word = highlight?.trim();
  if (!word || !text.includes(word)) {
    const parts = text.split(" ");
    word = parts.slice(-2).join(" ");
  }
  const i = text.lastIndexOf(word);
  return (
    <>
      {text.slice(0, i)}
      <span className="accent">{word}</span>
      {text.slice(i + word.length)}
    </>
  );
}
