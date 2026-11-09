"use client";

export type UploadResult = {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
  pages?: number;
  resource_type: string;
  format?: string;
};

export type UploadFolder = "posts" | "pins" | "printables" | "pages" | "site" | "authors" | "categories";

/** Signed direct upload to Cloudinary. PDFs go up as `raw` so they're always deliverable. */
export async function uploadToCloudinary(file: File, folder: UploadFolder, onProgress?: (pct: number) => void): Promise<UploadResult> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const sign = await signRes.json();
  if (!signRes.ok) throw new Error(sign.error || "Could not sign upload");

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const resourceType = isPdf ? "raw" : "image";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("signature", sign.signature);
  fd.append("folder", sign.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText || "{}");
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          url: res.secure_url,
          public_id: res.public_id,
          width: res.width,
          height: res.height,
          bytes: res.bytes,
          pages: res.pages,
          resource_type: res.resource_type,
          format: res.format,
        });
      } else reject(new Error(res.error?.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  });
}

/** Small Cloudinary thumbnail for admin previews. */
export function thumb(url: string | undefined, w = 400): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${w},c_limit/`);
}
