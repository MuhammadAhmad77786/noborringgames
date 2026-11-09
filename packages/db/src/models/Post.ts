import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { POST_STATUSES } from "@craft/shared";
import { ImageSchema, SeoSchema } from "./shared";

const SupplySchema = new Schema(
  { name: { type: String, required: true }, affiliateUrl: String },
  { _id: false },
);

const PrintableSchema = new Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  public_id: String,
  previewImage: ImageSchema,
  pages: { type: Number, default: 1 },
  fileSize: Number,
  downloads: { type: Number, default: 0 },
  requireEmail: { type: Boolean, default: false },
});

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: String,
    content: { type: String, default: "" },
    featuredImage: ImageSchema,
    pinterestImage: ImageSchema,
    pinterestTitle: String,
    pinterestDescription: String,
    gallery: { type: [ImageSchema], default: [] },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    author: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: POST_STATUSES, default: "draft", index: true },
    publishedAt: { type: Date, index: true },
    ageRange: String,
    difficulty: { type: String, default: "Easy" },
    timeNeeded: String,
    supplies: { type: [SupplySchema], default: [] },
    printables: { type: [PrintableSchema], default: [] },
    isPick: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);

PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index(
  { title: "text", excerpt: "text", pinterestDescription: "text", "seo.focusKeyword": "text" },
  { weights: { title: 10, "seo.focusKeyword": 6, excerpt: 3, pinterestDescription: 1 }, name: "post_text" },
);

export type PostDoc = InferSchemaType<typeof PostSchema>;
export const Post: Model<PostDoc> = (models.Post as Model<PostDoc>) || model<PostDoc>("Post", PostSchema);
