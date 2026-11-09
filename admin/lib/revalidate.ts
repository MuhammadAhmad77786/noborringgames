import "server-only";

/**
 * Tells the public site to refresh its ISR cache. Content edits revalidate
 * the whole site layout (pages regenerate lazily on their next visit), which
 * keeps header/footer/related posts consistent everywhere.
 */
export async function revalidateSite(opts: { paths?: string[]; all?: boolean } = { all: true }): Promise<boolean> {
  const site = process.env.SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!site || !secret) {
    console.warn("[revalidate] SITE_URL or REVALIDATE_SECRET missing; skipping");
    return false;
  }
  try {
    const res = await fetch(`${site.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify(opts),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[revalidate] ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error("[revalidate] failed", err);
    return false;
  }
}
