import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

const TagSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

export type TagDoc = InferSchemaType<typeof TagSchema>;
export const Tag: Model<TagDoc> = (models.Tag as Model<TagDoc>) || model<TagDoc>("Tag", TagSchema);
