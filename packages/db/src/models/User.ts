import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { ROLES } from "@craft/shared";
import { ImageSchema } from "./shared";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "author" },
    bio: String,
    avatar: ImageSchema,
    socialLinks: {
      website: String,
      pinterest: String,
      instagram: String,
      facebook: String,
    },
    active: { type: Boolean, default: true },
    lastLoginAt: Date,
    /** Bumped on password reset / deactivation to invalidate existing sessions. */
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;
export const User: Model<UserDoc> = (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
