import Image from "next/image";
import Link from "next/link";
import type { Permalink, PostCardDTO } from "@craft/shared";
import { postHref } from "@/lib/site";

/** Small chips: printable / age / craft type. */
function cardChips(post: PostCardDTO): string[] {
  const chips: string[] = [];
  if (post.ageRange) chips.push(post.ageRange);
  const type = post.categories.find((c) => c.facet === "craftType");
  if (type) chips.push(type.name);
  post.tags?.slice(0, 1).forEach((t) => chips.push(t.name));
  return chips.slice(0, 2);
}

export function PostCard({
  post,
  permalink,
  size = "md",
  pick = false,
  priority = false,
}: {
  post: PostCardDTO;
  permalink: Permalink;
  size?: "md" | "lg";
  pick?: boolean;
  priority?: boolean;
}) {
  const img = post.pinterestImage?.url ? post.pinterestImage : post.featuredImage;
  const chips = cardChips(post);
  return (
    <Link
      href={postHref(post, permalink)}
      className={`card-retro post-card ${size === "lg" ? "post-card-lg" : ""}`}
    >
      <div className="thumb">
        {pick && <span className="pick-badge">★ PICK</span>}
        {img?.url && (
          <Image
            src={img.url}
            alt={img.alt || post.title}
            fill
            priority={priority}
            sizes={size === "lg" ? "(max-width: 575px) 100vw, (max-width: 991px) 50vw, 380px" : "(max-width: 991px) 50vw, 280px"}
          />
        )}
      </div>
      <div className="body">
        <h3>{post.title}</h3>
        {chips.length > 0 && (
          <div className="chips">
            {chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function PostGrid({
  posts,
  permalink,
  priorityCount = 0,
}: {
  posts: PostCardDTO[];
  permalink: Permalink;
  priorityCount?: number;
}) {
  return (
    <div className="grid-posts">
      {posts.map((p, i) => (
        <PostCard key={p._id} post={p} permalink={permalink} priority={i < priorityCount} />
      ))}
    </div>
  );
}
