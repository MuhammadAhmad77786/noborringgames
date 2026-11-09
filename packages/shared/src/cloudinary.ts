/**
 * Cloudinary URL helpers. Works on any `res.cloudinary.com/.../upload/...` URL
 * and leaves other URLs (e.g. local /seed/*.svg placeholders) untouched.
 */
const UPLOAD_SEGMENT = "/upload/";

export function isCloudinaryUrl(url: string | undefined | null): boolean {
  return !!url && url.includes("res.cloudinary.com") && url.includes(UPLOAD_SEGMENT);
}

export function cldTransform(url: string, transform: string): string {
  if (!isCloudinaryUrl(url)) return url;
  // Raw files (PDFs) can't be transformed.
  if (url.includes("/raw/upload/")) return url;
  const [head, tail] = url.split(UPLOAD_SEGMENT);
  return `${head}${UPLOAD_SEGMENT}${transform}/${tail}`;
}

export function cldOptimized(url: string, width?: number, extra?: string): string {
  const parts = ["f_auto", "q_auto"];
  if (width) parts.push(`w_${width}`, "c_limit");
  if (extra) parts.push(extra);
  return cldTransform(url, parts.join(","));
}

/** A cropped OG image (1200x630) from any Cloudinary image. */
export function cldOg(url: string): string {
  return cldTransform(url, "f_jpg,q_auto,w_1200,h_630,c_fill,g_auto");
}

/** Force a download (attachment) for image-type Cloudinary assets. */
export function cldAttachment(url: string, filename?: string): string {
  if (!isCloudinaryUrl(url) || url.includes("/raw/upload/")) return url;
  return cldTransform(url, filename ? `fl_attachment:${filename.replace(/[^a-z0-9-_]/gi, "_")}` : "fl_attachment");
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
