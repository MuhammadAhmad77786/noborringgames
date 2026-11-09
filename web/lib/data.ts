import "server-only";
import { cache } from "react";
import { Types } from "mongoose";
import {
  Category,
  Comment,
  Page,
  Post,
  connectDB,
  getSiteSettingsDoc,
  toPlain,
} from "@craft/db";
import {
  POSTS_PER_PAGE,
  type CategoryDTO,
  type CommentDTO,
  type Facet,
  type PageDTO,
  type PostCardDTO,
  type PostDTO,
  type SiteSettingsDTO,
} from "@craft/shared";

/*
 * All public reads go through here. Pages are ISR-cached (see `revalidate`
 * exports) and refreshed on demand by the admin via /api/revalidate, so these
 * functions only run at build/regeneration time. React `cache` dedupes calls
 * within one render (e.g. generateMetadata + page).
 */

const CARD_FIELDS =
  "title slug excerpt featuredImage pinterestImage categories tags ageRange publishedAt updatedAt isPick";
const CARD_CATEGORY_FIELDS = "name slug facet emoji";

/** Published, or scheduled with a publish date that has passed. */
function liveFilter(): Record<string, unknown> {
  return { status: { $in: ["published", "scheduled"] }, publishedAt: { $lte: new Date() } };
}

/** Mongoose 9 types filters strictly; our filters are built dynamically. */
type PostFilter = Parameters<typeof Post.find>[0];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pf = (f: Record<string, unknown>) => f as any as Exclude<PostFilter, undefined>;

const DEFAULT_SETTINGS: SiteSettingsDTO = {
  siteTitle: "Craft Blog",
  socialLinks: {},
  permalink: "post",
  ads: {},
  home: { stats: [], currentSeasonCategoryIds: [], pins: [] },
};

export const getSettings = cache(async (): Promise<SiteSettingsDTO> => {
  await connectDB();
  const doc = await getSiteSettingsDoc();
  const s = toPlain<Partial<SiteSettingsDTO>>(doc ?? {});
  // Never let provider API keys reach rendered pages / RSC payloads.
  delete s.emailProvider;
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    socialLinks: { ...(s.socialLinks ?? {}) },
    ads: { ...(s.ads ?? {}) },
    home: { ...DEFAULT_SETTINGS.home, ...(s.home ?? {}) },
  };
});

export const getAllCategories = cache(async (): Promise<CategoryDTO[]> => {
  await connectDB();
  const cats = await Category.find().sort({ facet: 1, sortOrder: 1, name: 1 }).lean();
  return toPlain<CategoryDTO[]>(cats);
});

export async function getCategoriesByFacet(facet: Facet): Promise<CategoryDTO[]> {
  return (await getAllCategories()).filter((c) => c.facet === facet);
}

export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryDTO | null> => {
  return (await getAllCategories()).find((c) => c.slug === slug) ?? null;
});

function cardQuery(filter: Record<string, unknown>) {
  return Post.find(pf({ ...liveFilter(), ...filter }))
    .select(CARD_FIELDS)
    .populate("categories", CARD_CATEGORY_FIELDS)
    .populate("tags", "name slug");
}

export const getLatestPosts = cache(async (limit = 8): Promise<PostCardDTO[]> => {
  await connectDB();
  const posts = await cardQuery({}).sort({ publishedAt: -1 }).limit(limit).lean();
  return toPlain<PostCardDTO[]>(posts);
});

export async function getPostsInCategories(categoryIds: string[], limit = 4): Promise<PostCardDTO[]> {
  if (!categoryIds.length) return [];
  await connectDB();
  const ids = categoryIds.filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  const posts = await cardQuery({ categories: { $in: ids } })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return toPlain<PostCardDTO[]>(posts);
}

export const getPicks = cache(async (limit = 3): Promise<PostCardDTO[]> => {
  await connectDB();
  const posts = await cardQuery({ isPick: true }).sort({ publishedAt: -1 }).limit(limit).lean();
  return toPlain<PostCardDTO[]>(posts);
});

export const getPopularPosts = cache(async (limit = 4): Promise<PostCardDTO[]> => {
  await connectDB();
  const posts = await cardQuery({}).sort({ views: -1, publishedAt: -1 }).limit(limit).lean();
  return toPlain<PostCardDTO[]>(posts);
});

/** Posts that have a dedicated Pinterest image, for the homepage pin row fallback. */
export async function getPinPosts(limit = 5): Promise<PostCardDTO[]> {
  await connectDB();
  const posts = await cardQuery({ "pinterestImage.url": { $nin: [null, ""] } })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return toPlain<PostCardDTO[]>(posts);
}

/**
 * Paginated listing. `requiredCategoryIds` are AND-ed (a post must be in all of them),
 * which is how the facet filter chips narrow a category listing.
 */
export async function listPosts({
  requiredCategoryIds = [],
  page = 1,
  perPage = POSTS_PER_PAGE,
}: {
  requiredCategoryIds?: string[];
  page?: number;
  perPage?: number;
}): Promise<{ posts: PostCardDTO[]; total: number; totalPages: number; page: number }> {
  await connectDB();
  const ids = requiredCategoryIds.filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  const filter = ids.length ? { categories: { $all: ids } } : {};
  const total = await Post.countDocuments(pf({ ...liveFilter(), ...filter }));
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const posts = await cardQuery(filter)
    .sort({ publishedAt: -1 })
    .skip((safePage - 1) * perPage)
    .limit(perPage)
    .lean();
  return { posts: toPlain<PostCardDTO[]>(posts), total, totalPages, page: safePage };
}

export async function searchPosts(
  q: string,
  page = 1,
  perPage = POSTS_PER_PAGE,
): Promise<{ posts: PostCardDTO[]; total: number; totalPages: number }> {
  const term = q.trim().slice(0, 100);
  if (!term) return { posts: [], total: 0, totalPages: 1 };
  await connectDB();
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Text index for relevance; regex fallback catches partial words ("pumpk").
  const filter = {
    $or: [{ $text: { $search: term } }],
  };
  let total = 0;
  let posts: unknown[] = [];
  try {
    total = await Post.countDocuments(pf({ ...liveFilter(), ...filter }));
    posts = await cardQuery(filter)
      .sort({ score: { $meta: "textScore" }, publishedAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
  } catch {
    total = 0;
  }
  if (total === 0) {
    const regex = new RegExp(escaped, "i");
    const rf = { $or: [{ title: regex }, { excerpt: regex }, { pinterestDescription: regex }] };
    total = await Post.countDocuments(pf({ ...liveFilter(), ...rf }));
    posts = await cardQuery(rf)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
  }
  return { posts: toPlain<PostCardDTO[]>(posts), total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export const getPostBySlug = cache(async (slug: string): Promise<PostDTO | null> => {
  await connectDB();
  const post = await Post.findOne(pf({ ...liveFilter(), slug: slug.toLowerCase() }))
    .populate("categories")
    .populate("tags", "name slug")
    .populate("author", "name bio avatar socialLinks")
    .lean();
  if (!post) return null;
  const dto = toPlain<PostDTO>(post);
  dto.hasAffiliateLinks = dto.supplies?.some((s) => !!s.affiliateUrl) ?? false;
  return dto;
});

export async function getRelatedPosts(post: PostDTO, limit = 4): Promise<PostCardDTO[]> {
  await connectDB();
  const related = post.categories
    .filter((c) => c.facet === "season" || c.facet === "craftType")
    .map((c) => new Types.ObjectId(c._id));
  if (!related.length) return [];
  const posts = await cardQuery({ _id: { $ne: new Types.ObjectId(post._id) }, categories: { $in: related } })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return toPlain<PostCardDTO[]>(posts);
}

export async function getApprovedComments(postId: string): Promise<CommentDTO[]> {
  await connectDB();
  const comments = await Comment.find({ post: postId, status: "approved" })
    .select("post name body status createdAt")
    .sort({ createdAt: 1 })
    .lean();
  return toPlain<CommentDTO[]>(comments);
}

export const getPageBySlug = cache(async (slug: string): Promise<PageDTO | null> => {
  await connectDB();
  const page = await Page.findOne({ slug }).lean();
  return page ? toPlain<PageDTO>(page) : null;
});

export async function getSitemapData() {
  await connectDB();
  const [posts, categories, pages] = await Promise.all([
    Post.find(pf({ ...liveFilter(), "seo.noindex": { $ne: true } }))
      .select("slug updatedAt categories")
      .populate("categories", "slug")
      .lean(),
    Category.find().select("slug updatedAt").lean(),
    Page.find({ "seo.noindex": { $ne: true } }).select("slug updatedAt").lean(),
  ]);
  return toPlain<{
    posts: { slug: string; updatedAt: string; categories: { slug: string }[] }[];
    categories: { slug: string; updatedAt: string }[];
    pages: { slug: string; updatedAt: string }[];
  }>({ posts, categories, pages });
}
