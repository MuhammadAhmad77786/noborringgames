import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PostView } from "@/components/post/PostView";
import { StaticPage } from "@/components/StaticPage";
import { getApprovedComments, getPageBySlug, getPostBySlug, getRelatedPosts, getSettings } from "@/lib/data";
import { pageMetadata, postMetadata } from "@/lib/post-meta";
import { postHref } from "@/lib/site";

export const revalidate = 3600;
// Rendered on first request, then cached until revalidated by the admin.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSettings();
  const post = await getPostBySlug(slug);
  if (post) return postMetadata(post, s);
  const page = await getPageBySlug(slug);
  if (page) return pageMetadata(page, s, `/${page.slug}`);
  return {};
}

/** Serves `/post-slug` posts and admin-managed Pages (privacy, terms, …). */
export default async function SlugPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const settings = await getSettings();
  const post = await getPostBySlug(slug);

  if (post) {
    const canonical = postHref(post, settings.permalink);
    if (canonical !== `/${slug}`) permanentRedirect(canonical);
    const [related, comments] = await Promise.all([getRelatedPosts(post), getApprovedComments(post._id)]);
    return <PostView post={post} settings={settings} related={related} comments={comments} />;
  }

  const page = await getPageBySlug(slug);
  if (page) return <StaticPage page={page} />;

  notFound();
}
