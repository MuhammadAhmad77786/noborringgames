import { HtmlSnippet } from "../HtmlSnippet";

/**
 * Renders nothing unless the admin configured a snippet for this placement.
 * When configured, the slot reserves its height up front so the ad loading
 * in later doesn't shift the content (no CLS).
 */
export function AdSlot({ html, placement }: { html?: string; placement: "after-p2" | "mid" | "in-content" | "sticky" }) {
  if (!html?.trim()) return null;
  return (
    <aside
      className={`ad-slot ${placement === "sticky" ? "ad-sticky" : ""}`}
      aria-label="Advertisement"
      data-placement={placement}
    >
      <HtmlSnippet html={html} />
    </aside>
  );
}
