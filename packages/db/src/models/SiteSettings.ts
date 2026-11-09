import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { PERMALINKS } from "@craft/shared";
import { ImageSchema } from "./shared";

export const SETTINGS_KEY = "site";

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: SETTINGS_KEY, unique: true },
    siteTitle: { type: String, default: "My Craft Blog" },
    tagline: String,
    logo: ImageSchema,
    favicon: ImageSchema,
    defaultOgImage: ImageSchema,
    socialLinks: { facebook: String, instagram: String, pinterest: String },
    pinterestHandle: String,
    footerBlurb: String,
    authorName: String,
    permalink: { type: String, enum: PERMALINKS, default: "post" },
    titleTemplate: { type: String, default: "%title% | %site%" },
    defaultMetaDescription: String,
    ga4Id: String,
    searchConsoleVerification: String,
    pinterestVerification: String,
    ads: {
      headScript: String,
      afterSecondParagraph: String,
      midContent: String,
      inContent: String,
      stickyMobile: String,
    },
    adsTxt: { type: String, default: "" },
    emailProvider: {
      provider: { type: String, enum: ["none", "mailerlite", "convertkit"], default: "none" },
      apiKey: String,
      listId: String,
    },
    home: {
      heroBadge: String,
      heroHeadline: String,
      heroHighlight: String,
      heroParagraph: String,
      heroImage: ImageSchema,
      stats: { type: [new Schema({ value: String, label: String }, { _id: false })], default: [] },
      currentSeasonCategoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      seasonRowEyebrow: String,
      seasonRowTitle: String,
      seasonRowSubtitle: String,
      seasonRowLinkText: String,
      navInSeasonLabel: String,
      navInSeasonCategoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
      authorPhoto: ImageSchema,
      authorEyebrow: String,
      authorHeading: String,
      authorBio: String,
      authorButtonText: String,
      pins: { type: [new Schema({ image: ImageSchema, link: String }, { _id: false })], default: [] },
      usePostPinsFallback: { type: Boolean, default: true },
      newsletterEyebrow: String,
      newsletterHeading: String,
      newsletterText: String,
      newsletterButton: String,
    },
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema>;
export const SiteSettings: Model<SiteSettingsDoc> =
  (models.SiteSettings as Model<SiteSettingsDoc>) || model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);

/** Returns the singleton settings document (lean), creating it if missing. */
export async function getSiteSettingsDoc() {
  await SiteSettings.updateOne({ key: SETTINGS_KEY }, { $setOnInsert: { key: SETTINGS_KEY } }, { upsert: true });
  return SiteSettings.findOne({ key: SETTINGS_KEY }).lean();
}
