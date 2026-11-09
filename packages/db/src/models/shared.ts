import mongoose from "mongoose";
const { Schema } = mongoose;

export const ImageSchema = new Schema(
  {
    url: { type: String, default: "" },
    public_id: String,
    alt: { type: String, default: "" },
    width: Number,
    height: Number,
  },
  { _id: false },
);

export const SeoSchema = new Schema(
  {
    title: String,
    metaDescription: String,
    focusKeyword: String,
    canonicalUrl: String,
    ogImage: String,
    noindex: { type: Boolean, default: false },
  },
  { _id: false },
);
