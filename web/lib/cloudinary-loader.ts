/**
 * Global next/image loader. Cloudinary URLs get f_auto,q_auto and a responsive
 * width; anything else (local /seed placeholders, SVGs) is returned untouched.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return src;
  }
  const q = quality ? `q_${quality}` : "q_auto";
  const [head, tail] = src.split("/image/upload/");
  return `${head}/image/upload/f_auto,${q},w_${width},c_limit/${tail}`;
}
