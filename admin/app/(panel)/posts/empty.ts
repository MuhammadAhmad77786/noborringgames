import type { PostInput } from "./actions";

export function emptyPost(): PostInput {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: null,
    pinterestImage: null,
    pinterestTitle: "",
    pinterestDescription: "",
    gallery: [],
    categories: [],
    tags: [],
    status: "draft",
    ageRange: "",
    difficulty: "Easy",
    timeNeeded: "",
    supplies: [],
    printables: [],
    isPick: false,
    seo: {},
  };
}
