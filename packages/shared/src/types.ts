import type { CommentStatus, Difficulty, Facet, Permalink, PostStatus, Role } from "./constants";

/** Plain (JSON-serialisable) shapes shared by both apps. Ids and dates are strings. */

export interface ImageAsset {
  url: string;
  public_id?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SeoFields {
  title?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface Supply {
  name: string;
  affiliateUrl?: string;
}

export interface Printable {
  _id?: string;
  title: string;
  fileUrl: string;
  public_id?: string;
  previewImage?: ImageAsset;
  pages?: number;
  fileSize?: number;
  downloads?: number;
  requireEmail?: boolean;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  slug: string;
  facet: Facet;
  description?: string;
  emoji?: string;
  cardColor?: string;
  image?: ImageAsset;
  parentCategory?: string | null;
  showInNavbar?: boolean;
  showInFooter?: boolean;
  sortOrder?: number;
  seo?: { title?: string; metaDescription?: string };
  updatedAt?: string;
}

export interface TagDTO {
  _id: string;
  name: string;
  slug: string;
}

export interface AuthorDTO {
  _id: string;
  name: string;
  bio?: string;
  avatar?: ImageAsset;
  socialLinks?: Record<string, string>;
}

export interface PostDTO {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: ImageAsset;
  pinterestImage?: ImageAsset;
  pinterestTitle?: string;
  pinterestDescription?: string;
  gallery?: ImageAsset[];
  categories: CategoryDTO[];
  tags: TagDTO[];
  author?: AuthorDTO | null;
  status: PostStatus;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  ageRange?: string;
  difficulty?: Difficulty;
  timeNeeded?: string;
  supplies: Supply[];
  printables: Printable[];
  isPick?: boolean;
  views?: number;
  seo?: SeoFields;
  hasAffiliateLinks?: boolean;
}

/** Lightweight shape for cards and listings. */
export interface PostCardDTO {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: ImageAsset;
  pinterestImage?: ImageAsset;
  categories: Pick<CategoryDTO, "_id" | "name" | "slug" | "facet" | "emoji">[];
  tags?: TagDTO[];
  ageRange?: string;
  publishedAt?: string;
  updatedAt?: string;
  isPick?: boolean;
}

export interface CommentDTO {
  _id: string;
  post: string;
  name: string;
  body: string;
  status: CommentStatus;
  createdAt: string;
}

export interface PageDTO {
  _id: string;
  title: string;
  slug: string;
  content: string;
  seo?: SeoFields;
  updatedAt?: string;
}

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  avatar?: ImageAsset;
  socialLinks?: Record<string, string>;
  active: boolean;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface PinterestPin {
  image?: ImageAsset;
  link?: string;
}

export interface AdSettings {
  headScript?: string;
  afterSecondParagraph?: string;
  midContent?: string;
  inContent?: string;
  stickyMobile?: string;
}

export interface SiteSettingsDTO {
  siteTitle: string;
  tagline?: string;
  logo?: ImageAsset;
  favicon?: ImageAsset;
  defaultOgImage?: ImageAsset;
  socialLinks: { facebook?: string; instagram?: string; pinterest?: string };
  pinterestHandle?: string;
  footerBlurb?: string;
  permalink: Permalink;
  titleTemplate?: string;
  defaultMetaDescription?: string;
  ga4Id?: string;
  searchConsoleVerification?: string;
  pinterestVerification?: string;
  ads: AdSettings;
  adsTxt?: string;
  authorName?: string;
  emailProvider?: { provider?: "none" | "mailerlite" | "convertkit"; apiKey?: string; listId?: string };
  home: {
    heroBadge?: string;
    heroHeadline?: string;
    heroHighlight?: string;
    heroParagraph?: string;
    heroImage?: ImageAsset;
    stats: HeroStat[];
    currentSeasonCategoryIds: string[];
    seasonRowEyebrow?: string;
    seasonRowTitle?: string;
    seasonRowSubtitle?: string;
    seasonRowLinkText?: string;
    navInSeasonLabel?: string;
    navInSeasonCategoryId?: string | null;
    authorPhoto?: ImageAsset;
    authorEyebrow?: string;
    authorHeading?: string;
    authorBio?: string;
    authorButtonText?: string;
    pins: PinterestPin[];
    usePostPinsFallback?: boolean;
    newsletterEyebrow?: string;
    newsletterHeading?: string;
    newsletterText?: string;
    newsletterButton?: string;
  };
  updatedAt?: string;
}
