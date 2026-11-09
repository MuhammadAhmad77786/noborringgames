import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { COMMENT_STATUSES } from "@craft/shared";

const CommentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 4000 },
    status: { type: String, enum: COMMENT_STATUSES, default: "pending", index: true },
    ip: { type: String, select: false },
  },
  { timestamps: true },
);

export type CommentDoc = InferSchemaType<typeof CommentSchema>;
export const Comment: Model<CommentDoc> =
  (models.Comment as Model<CommentDoc>) || model<CommentDoc>("Comment", CommentSchema);
