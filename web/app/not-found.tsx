import Link from "next/link";
import { PostGrid } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { getPopularPosts, getSettings } from "@/lib/data";

export default async function NotFound() {
  const [settings, popular] = await Promise.all([getSettings(), getPopularPosts(4).catch(() => [])]);
  return (
    <div className="container-x section">
      <div className="text-center mx-auto" style={{ maxWidth: 640 }}>
        <div style={{ fontSize: "3.5rem" }} aria-hidden="true">
          ✂️📄
        </div>
        <span className="eyebrow">Error 404</span>
        <h1 className="post-title">
          This page got <span className="hl">snipped</span>
        </h1>
        <p className="section-sub mb-4">
          The craft you&apos;re looking for may have moved, or the link has a typo. Try a search — or start with a
          reader favourite below.
        </p>
        <div className="d-flex justify-content-center">
          <SearchBar id="nf-q" />
        </div>
        <div className="mt-4">
          <Link href="/" className="btn-x btn-outline me-2">
            Go home
          </Link>
          <Link href="/crafts" className="btn-x btn-orange">
            Browse all crafts
          </Link>
        </div>
      </div>
      {popular.length > 0 && (
        <div className="mt-5 pt-4">
          <h2 className="h3 mb-3">Popular crafts</h2>
          <PostGrid posts={popular} permalink={settings.permalink} />
        </div>
      )}
    </div>
  );
}
