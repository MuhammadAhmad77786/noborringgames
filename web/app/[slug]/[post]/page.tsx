import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PostView } from "@/components/post/PostView";
import { getApprovedComments, getPostBySlug, getRelatedPosts, getSettings } from "@/lib/data";
import { postMetadata } from "@/lib/post-meta";
import { postHref } from "@/lib/site";

export const revalidate = 3600;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[slug]/[post]">): Promise<Metadata> {
  const { post: slug } = await params;
  const [s, post] = await Promise.all([getSettings(), getPostBySlug(slug)]);
  return post ? postMetadata(post, s) : {};
}

/** Serves posts under the `/category-slug/post-slug` permalink structure. */
export default async function CategoryPostPage({ params }: PageProps<"/[slug]/[post]">) {
  const { slug: category, post: slug } = await params;
  const [settings, post] = await Promise.all([getSettings(), getPostBySlug(slug)]);
  if (!post) notFound();
  const canonical = postHref(post, settings.permalink);
  // Old/alternate URLs 301 to the canonical one (e.g. after switching permalink style).
  if (canonical !== `/${category}/${slug}`) permanentRedirect(canonical);
  const [related, comments] = await Promise.all([getRelatedPosts(post), getApprovedComments(post._id)]);
  return <PostView post={post} settings={settings} related={related} comments={comments} />;
}
