import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

const SubscriberSchema = new Schema(
  {
    firstName: { type: String, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    source: { type: String, enum: ["newsletter", "printable"], default: "newsletter" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    /** Set once the subscriber has been pushed to the external email provider. */
    syncedAt: Date,
  },
  { timestamps: true },
);

export type SubscriberDoc = InferSchemaType<typeof SubscriberSchema>;
export const Subscriber: Model<SubscriberDoc> =
  (models.Subscriber as Model<SubscriberDoc>) || model<SubscriberDoc>("Subscriber", SubscriberSchema);
