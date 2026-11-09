import Image from "next/image";
import Link from "next/link";
import type { CommentDTO, PostCardDTO, PostDTO, SiteSettingsDTO } from "@craft/shared";
import { PostGrid } from "../PostCard";
import { SectionHeading } from "../SectionHeading";
import { preparePostHtml, splitForAds } from "@/lib/content";
import { JsonLd, breadcrumbLd, postLd } from "@/lib/jsonld";
import { abs, formatDate, postHref } from "@/lib/site";
import { AdSlot } from "./AdSlot";
import { CommentForm } from "./CommentForm";
import { PrintableBox } from "./PrintableBox";
import { ShareButtons } from "./ShareButtons";
import { ViewTracker } from "./ViewTracker";

export function PostView({
  post,
  settings,
  related,
  comments,
}: {
  post: PostDTO;
  settings: SiteSettingsDTO;
  related: PostCardDTO[];
  comments: CommentDTO[];
}) {
  const path = postHref(post, settings.permalink);
  const url = abs(path);
  const pinDescription = post.pinterestDescription || post.excerpt || post.title;
  const pinMedia = post.pinterestImage?.url
    ? post.pinterestImage.url.startsWith("http")
      ? post.pinterestImage.url
      : abs(post.pinterestImage.url)
    : undefined;
  const html = preparePostHtml(post.content, { pageUrl: url, pinDescription, pinMedia });
  const { first, middle, rest } = splitForAds(html);
  const ads = settings.ads;
  const primary = post.categories.find((c) => c.facet === "craftType") ?? post.categories[0];
  const updated = post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86_400_000;
  const author = post.author;

  const crumbs = [
    { name: "Home", path: "/" },
    ...(primary ? [{ name: primary.name, path: `/category/${primary.slug}` }] : []),
    { name: post.title, path },
  ];

  const facts = [
    { label: "Ages", value: post.ageRange },
    { label: "Difficulty", value: post.difficulty },
    { label: "Time", value: post.timeNeeded },
    { label: "Supplies", value: post.supplies?.length ? `${post.supplies.length} items` : undefined },
  ].filter((f) => f.value);

  return (
    <article className="container-x py-4 py-md-5">
      <JsonLd data={postLd(post, settings, url)} />
      <JsonLd data={breadcrumbLd(crumbs)} />
      <ViewTracker postId={post._id} />

      <div className="post-wrap">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            {crumbs.slice(0, -1).map((c) => (
              <li key={c.path}>
                <Link href={c.path}>{c.name}</Link>
              </li>
            ))}
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>

        <h1 className="post-title">{post.title}</h1>

        <div className="post-meta">
          {author?.avatar?.url && <Image src={author.avatar.url} alt="" width={36} height={36} />}
          {author?.name && (
            <span>
              By{" "}
              <Link href="/about" rel="author">
                {author.name}
              </Link>
            </span>
          )}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {updated && (
            <span>
              Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
            </span>
          )}
        </div>

        {post.categories.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {post.categories.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="chip">
                {c.emoji && <span aria-hidden="true">{c.emoji}</span>} {c.name}
              </Link>
            ))}
          </div>
        )}

        <div className="d-flex flex-wrap gap-2 align-items-center">
          {post.printables.length > 0 && (
            <a href="#printable" className="btn-x btn-orange btn-sm-x">
              ↓ Jump to printable
            </a>
          )}
          {post.supplies.length > 0 && (
            <a href="#supplies" className="btn-x btn-outline btn-sm-x">
              What you need
            </a>
          )}
        </div>
        {post.hasAffiliateLinks && (
          <p className="disclosure">
            This post contains affiliate links. If you buy through them, we may earn a small commission at no
            extra cost to you. <Link href="/affiliate-disclosure">Learn more</Link>.
          </p>
        )}

        {facts.length > 0 && (
          <dl className="quick-facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="qf-label">{f.label}</dt>
                <dd className="qf-value m-0">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {post.featuredImage?.url && (
          <figure className="featured" style={{ aspectRatio: aspect(post.featuredImage) }}>
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt || post.title}
              fill
              priority
              sizes="(max-width: 820px) 100vw, 780px"
              style={{ objectFit: "cover" }}
              data-pin-description={pinDescription}
              data-pin-media={pinMedia}
            />
          </figure>
        )}

        {post.supplies.length > 0 && (
          <section className="box" id="supplies" aria-labelledby="supplies-title">
            <h2 className="box-title" id="supplies-title">
              What you&apos;ll need
            </h2>
            <ul className="supplies-list">
              {post.supplies.map((s, i) => (
                <li key={`${s.name}-${i}`}>
                  <input type="checkbox" id={`supply-${i}`} />
                  <label htmlFor={`supply-${i}`}>
                    {s.affiliateUrl ? (
                      <a href={s.affiliateUrl} target="_blank" rel="sponsored noopener nofollow">
                        {s.name}
                      </a>
                    ) : (
                      s.name
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="prose">
          <div dangerouslySetInnerHTML={{ __html: first }} />
          <AdSlot html={ads.afterSecondParagraph} placement="after-p2" />
          {middle && <div dangerouslySetInnerHTML={{ __html: middle }} />}
          {middle && <AdSlot html={ads.midContent} placement="mid" />}
          {rest && <div dangerouslySetInnerHTML={{ __html: rest }} />}
        </div>

        <PrintableBox postId={post._id} printables={post.printables} />
        <AdSlot html={ads.inContent} placement="in-content" />

        {post.pinterestImage?.url && (
          <section className="pin-later" aria-labelledby="pin-later-title">
            <span className="eyebrow">Short on time?</span>
            <h2 className="h3" id="pin-later-title">
              <span className="hl">Pin this for later</span> 📌
            </h2>
            <div className="pin-later-img pin-wrap d-block">
              <Image
                src={post.pinterestImage.url}
                alt={post.pinterestImage.alt || post.pinterestTitle || post.title}
                fill
                sizes="400px"
                data-pin-description={pinDescription}
                data-pin-media={pinMedia}
              />
              <a
                className="pin-save"
                href={
                  "https://www.pinterest.com/pin/create/button/?" +
                  new URLSearchParams({ url, media: pinMedia ?? "", description: pinDescription }).toString()
                }
                target="_blank"
                rel="noopener nofollow"
              >
                Save
              </a>
            </div>
          </section>
        )}

        <ShareButtons url={url} media={pinMedia} description={pinDescription} />

        {author && (
          <aside className="author-box" aria-label="About the author">
            {author.avatar?.url && <Image src={author.avatar.url} alt="" width={84} height={84} />}
            <div>
              <span className="eyebrow">Written by</span>
              <h2 className="h4 mb-1">{author.name}</h2>
              {author.bio && <p className="mb-2">{author.bio}</p>}
              <Link href="/about" className="see-all">
                More about {author.name.split(" ")[0]} →
              </Link>
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="section-tight" aria-labelledby="related-title">
          <SectionHeading id="related-title" eyebrow="Keep crafting" title="You might also like" highlight="also like" />
          <PostGrid posts={related} permalink={settings.permalink} />
        </section>
      )}

      <section className="post-wrap section-tight" aria-labelledby="comments-title" id="comments">
        <h2 className="h3" id="comments-title">
          {comments.length ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}` : "Comments"}
        </h2>
        {comments.length === 0 && <p className="text-secondary">Be the first to share how yours turned out!</p>}
        {comments.map((c) => (
          <div key={c._id} className="comment">
            <div className="d-flex gap-2 align-items-baseline">
              <span className="comment-name">{c.name}</span>
              <time className="comment-date" dateTime={c.createdAt}>
                {formatDate(c.createdAt)}
              </time>
            </div>
            <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
              {c.body}
            </p>
          </div>
        ))}
        <CommentForm postId={post._id} />
      </section>

      <AdSlot html={ads.stickyMobile} placement="sticky" />
    </article>
  );
}

function aspect(img: { width?: number; height?: number }) {
  return img.width && img.height ? `${img.width} / ${img.height}` : "4 / 3";
}
