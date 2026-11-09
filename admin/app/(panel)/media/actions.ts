"use server";

import { attempt, type ActionResult } from "@/lib/action-result";
import { ALL_ROLES, EDITORS, assertRole } from "@/lib/auth";
import { MEDIA_ROOT, cld } from "@/lib/cloudinary";

export type MediaItem = {
  public_id: string;
  url: string;
  resource_type: "image" | "raw";
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
  alt?: string;
  folder: string;
};

type CldResource = {
  public_id: string;
  secure_url: string;
  resource_type: "image" | "raw";
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
  folder?: string;
  asset_folder?: string;
  context?: { custom?: { alt?: string } };
};

/** Lists images or PDFs (raw) under the site's Cloudinary folder, newest first. */
export async function listMedia(opts: {
  type: "image" | "raw";
  q?: string;
  cursor?: string;
}): Promise<ActionResult<{ items: MediaItem[]; next?: string }>> {
  return attempt(async () => {
    await assertRole(ALL_ROLES);
    const c = cld();
    const q = (opts.q ?? "").replace(/["\\]/g, "").trim();
    let expr = `resource_type:${opts.type} AND public_id:${MEDIA_ROOT}/*`;
    if (q) expr += ` AND (filename:*${q}* OR context.alt:*${q}*)`;
    let search = c.search.expression(expr).sort_by("created_at", "desc").with_field("context").max_results(48);
    if (opts.cursor) search = search.next_cursor(opts.cursor);
    const res = (await search.execute()) as { resources: CldResource[]; next_cursor?: string };
    return {
      items: res.resources.map((r) => ({
        public_id: r.public_id,
        url: r.secure_url,
        resource_type: r.resource_type,
        format: r.format,
        bytes: r.bytes,
        width: r.width,
        height: r.height,
        created_at: r.created_at,
        alt: r.context?.custom?.alt,
        folder: r.asset_folder ?? r.folder ?? r.public_id.split("/").slice(0, -1).join("/"),
      })),
      next: res.next_cursor,
    };
  });
}

export async function updateAlt(publicId: string, alt: string): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(ALL_ROLES);
    const clean = alt.replace(/[|=]/g, " ").trim().slice(0, 300);
    await cld().uploader.add_context(`alt=${clean}`, [publicId]);
    return {};
  });
}

export async function deleteMedia(publicId: string, type: "image" | "raw"): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(EDITORS);
    if (!publicId.startsWith(`${MEDIA_ROOT}/`)) throw new Error("Can only delete this site's files.");
    await cld().uploader.destroy(publicId, { resource_type: type, invalidate: true });
    return {};
  });
}
