import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { FACETS } from "@craft/shared";
import { ImageSchema } from "./shared";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    facet: { type: String, enum: FACETS, required: true, index: true },
    description: String,
    emoji: String,
    cardColor: { type: String, default: "#FDE3D3" },
    image: ImageSchema,
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    showInNavbar: { type: Boolean, default: false },
    showInFooter: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    seo: { title: String, metaDescription: String },
  },
  { timestamps: true },
);

CategorySchema.index({ facet: 1, sortOrder: 1 });

export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>("Category", CategorySchema);
