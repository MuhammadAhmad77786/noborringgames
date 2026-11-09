import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_FOLDERS, MEDIA_ROOT, cld } from "@/lib/cloudinary";

/**
 * Returns a signature so the browser can upload straight to Cloudinary
 * (files never pass through our server). Requires a logged-in user.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { folder?: string };
  const sub = ALLOWED_FOLDERS.includes(body.folder as (typeof ALLOWED_FOLDERS)[number]) ? body.folder : "posts";
  const folder = `${MEDIA_ROOT}/${sub}`;
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };

  try {
    const c = cld();
    const signature = c.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
