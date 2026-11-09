import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;
export function cld() {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary env vars are not set");
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export const MEDIA_ROOT = "craft-site";
export const ALLOWED_FOLDERS = ["posts", "pins", "printables", "pages", "site", "authors", "categories"] as const;
