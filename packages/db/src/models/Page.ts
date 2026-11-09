import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { SeoSchema } from "./shared";

const PageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, default: "" },
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);

export type PageDoc = InferSchemaType<typeof PageSchema>;
export const Page: Model<PageDoc> = (models.Page as Model<PageDoc>) || model<PageDoc>("Page", PageSchema);
