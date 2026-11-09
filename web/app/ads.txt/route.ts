import { getSettings } from "@/lib/data";

export const revalidate = 3600;

/** ads.txt content is edited in admin → Settings. */
export async function GET() {
  const s = await getSettings();
  return new Response((s.adsTxt ?? "").trim() + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
