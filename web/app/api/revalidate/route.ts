import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { json } from "@/lib/api";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Called by the admin app after content changes.
 * Body: { paths?: string[], all?: boolean }   Header: x-revalidate-secret
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !safeEqual(given, secret)) return json({ error: "Unauthorized" }, 401);

  const body = (await req.json().catch(() => ({}))) as { paths?: unknown; all?: unknown };
  if (body.all === true) {
    // Layout-level: every page (header/footer/settings/category changes).
    revalidatePath("/", "layout");
    return json({ revalidated: ["/ (layout)"] });
  }

  const paths = Array.isArray(body.paths)
    ? body.paths.filter((p): p is string => typeof p === "string" && p.startsWith("/")).slice(0, 50)
    : [];
  for (const p of paths) revalidatePath(p);
  return json({ revalidated: paths });
}
