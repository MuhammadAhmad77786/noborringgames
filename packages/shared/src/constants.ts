export const FACETS = ["audience", "season", "craftType"] as const;
export type Facet = (typeof FACETS)[number];

export const FACET_LABELS: Record<Facet, string> = {
  audience: "Who's crafting?",
  season: "Season & holiday",
  craftType: "Craft type",
};

/** Short eyebrow labels used on listing pages. */
export const FACET_EYEBROWS: Record<Facet, string> = {
  audience: "Crafts for",
  season: "Season & holiday",
  craftType: "Craft type",
};

export const POST_STATUSES = ["draft", "published", "scheduled"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const ROLES = ["admin", "editor", "author"] as const;
export type Role = (typeof ROLES)[number];

export const COMMENT_STATUSES = ["pending", "approved", "spam"] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export const DIFFICULTIES = ["Easy", "Medium"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const PERMALINKS = ["post", "category-post"] as const;
export type Permalink = (typeof PERMALINKS)[number];

/** Pastel card fills from the brand palette. */
export const CARD_COLORS = {
  peach: "#FDE3D3",
  mint: "#D9F1EC",
  butter: "#FFF1C1",
  pink: "#FBD9E5",
} as const;
export type CardColor = keyof typeof CARD_COLORS;

export const PALETTE = {
  cream: "#FDF6EC",
  orange: "#F26B1D",
  teal: "#14998A",
  navy: "#1F2A44",
  yellow: "#FFD84D",
  mintBand: "#E0F2EE",
  ...CARD_COLORS,
} as const;

/** Slugs that cannot be used for posts/pages because they are app routes. */
export const RESERVED_SLUGS = [
  "crafts",
  "category",
  "search",
  "about",
  "contact",
  "api",
  "sitemap.xml",
  "robots.txt",
  "ads.txt",
  "_next",
];

export const POSTS_PER_PAGE = 16;
