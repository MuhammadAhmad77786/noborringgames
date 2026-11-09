"use client";

import { useRef, useState } from "react";
import type { ImageAsset } from "@craft/shared";
import { thumb, uploadToCloudinary, type UploadFolder } from "@/lib/upload-client";

/**
 * Image upload + alt text field. `ratio` (e.g. "2/3") shows a crop guide so
 * editors can see how the Pinterest image will frame.
 */
export function ImageField({
  label,
  value,
  onChange,
  folder = "posts",
  ratio,
  help,
  requireAlt = true,
}: {
  label: string;
  value?: ImageAsset | null;
  onChange: (v: ImageAsset | null) => void;
  folder?: UploadFolder;
  ratio?: string;
  help?: string;
  requireAlt?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const id = `img-${label.replace(/\W+/g, "-").toLowerCase()}`;

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    setError("");
    setProgress(0);
    try {
      const r = await uploadToCloudinary(file, folder, setProgress);
      onChange({ url: r.url, public_id: r.public_id, width: r.width, height: r.height, alt: value?.alt ?? "" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const ratioCheck = (() => {
    if (!ratio || !value?.width || !value?.height) return null;
    const [w, h] = ratio.split("/").map(Number);
    const actual = value.width / value.height;
    const target = w / h;
    return Math.abs(actual - target) < 0.03 ? null : `This image is ${value.width}×${value.height}; ${ratio.replace("/", ":")} works best (e.g. 1000×1500).`;
  })();

  return (
    <div className="mb-3">
      <label className="form-label fw-bold" htmlFor={id}>
        {label}
      </label>
      <div
        className={`upload-box ${value?.url ? "has-image" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
      >
        {value?.url ? (
          ratio ? (
            <div className="ratio-guide" style={{ aspectRatio: ratio, maxWidth: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(value.url)} alt={value.alt || ""} />
              <span className="ratio-label">{ratio.replace("/", ":")}</span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb(value.url)} alt={value.alt || ""} />
          )
        ) : ratio ? (
          <div className="ratio-guide d-flex align-items-center justify-content-center text-secondary small" style={{ aspectRatio: ratio, maxWidth: 160 }}>
            {ratio.replace("/", ":")} guide
            <span className="ratio-label">1000×1500</span>
          </div>
        ) : (
          <div className="text-secondary small py-3">Drop an image here</div>
        )}
        <div className="d-flex gap-2 justify-content-center mt-2">
          <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => input.current?.click()} disabled={progress !== null}>
            {progress !== null ? `Uploading ${progress}%` : value?.url ? "Replace" : "Upload"}
          </button>
          {value?.url && (
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onChange(null)}>
              Remove
            </button>
          )}
        </div>
        <input ref={input} id={id} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {value?.url && (
        <input
          className={`form-control form-control-sm mt-2 ${requireAlt && !value.alt?.trim() ? "is-invalid" : ""}`}
          placeholder="Alt text (describe the image)"
          aria-label={`${label} alt text`}
          value={value.alt ?? ""}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
      )}
      {requireAlt && value?.url && !value.alt?.trim() && <div className="invalid-feedback d-block">Alt text is required.</div>}
      {ratioCheck && <div className="form-text text-warning-emphasis">{ratioCheck}</div>}
      {help && <div className="form-text">{help}</div>}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
