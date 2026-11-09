"use server";

import { Types } from "mongoose";
import { SiteSettings, SETTINGS_KEY, connectDB } from "@craft/db";
import type { AdSettings, HeroStat, ImageAsset, Permalink, PinterestPin } from "@craft/shared";
import { attempt, type ActionResult } from "@/lib/action-result";
import { ADMINS, assertRole } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";

const img = (i?: ImageAsset | null) => (i?.url ? { url: i.url, public_id: i.public_id, alt: i.alt ?? "", width: i.width, height: i.height } : undefined);
const s = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type HomepageInput = {
  heroBadge: string;
  heroHeadline: string;
  heroHighlight: string;
  heroParagraph: string;
  heroImage: ImageAsset | null;
  stats: HeroStat[];
  currentSeasonCategoryIds: string[];
  seasonRowEyebrow: string;
  seasonRowTitle: string;
  seasonRowSubtitle: string;
  seasonRowLinkText: string;
  navInSeasonLabel: string;
  navInSeasonCategoryId: string;
  authorPhoto: ImageAsset | null;
  authorEyebrow: string;
  authorHeading: string;
  authorBio: string;
  authorButtonText: string;
  pins: PinterestPin[];
  usePostPinsFallback: boolean;
  newsletterEyebrow: string;
  newsletterHeading: string;
  newsletterText: string;
  newsletterButton: string;
};

export async function saveHomepage(input: HomepageInput): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    for (const [label, i] of [["Hero image", input.heroImage], ["Author photo", input.authorPhoto]] as const) {
      if (i?.url && !i.alt?.trim()) throw new Error(`${label} needs alt text.`);
    }
    const home = {
      heroBadge: s(input.heroBadge, 120),
      heroHeadline: s(input.heroHeadline, 160),
      heroHighlight: s(input.heroHighlight, 80),
      heroParagraph: s(input.heroParagraph, 600),
      heroImage: img(input.heroImage),
      stats: input.stats.slice(0, 4).map((x) => ({ value: s(x.value, 20), label: s(x.label, 40) })).filter((x) => x.value || x.label),
      currentSeasonCategoryIds: input.currentSeasonCategoryIds.filter(Types.ObjectId.isValid),
      seasonRowEyebrow: s(input.seasonRowEyebrow, 60),
      seasonRowTitle: s(input.seasonRowTitle, 120),
      seasonRowSubtitle: s(input.seasonRowSubtitle, 200),
      seasonRowLinkText: s(input.seasonRowLinkText, 60),
      navInSeasonLabel: s(input.navInSeasonLabel, 40),
      navInSeasonCategoryId: Types.ObjectId.isValid(input.navInSeasonCategoryId) ? input.navInSeasonCategoryId : null,
      authorPhoto: img(input.authorPhoto),
      authorEyebrow: s(input.authorEyebrow, 60),
      authorHeading: s(input.authorHeading, 120),
      authorBio: s(input.authorBio, 1200),
      authorButtonText: s(input.authorButtonText, 60),
      pins: input.pins.slice(0, 5).map((p) => ({ image: img(p.image), link: s(p.link, 500) })),
      usePostPinsFallback: !!input.usePostPinsFallback,
      newsletterEyebrow: s(input.newsletterEyebrow, 60),
      newsletterHeading: s(input.newsletterHeading, 120),
      newsletterText: s(input.newsletterText, 400),
      newsletterButton: s(input.newsletterButton, 40),
    };
    await SiteSettings.updateOne({ key: SETTINGS_KEY }, { $set: { home } }, { upsert: true });
    await revalidateSite({ all: true });
    return {};
  });
}

export type SettingsInput = {
  siteTitle: string;
  tagline: string;
  authorName: string;
  logo: ImageAsset | null;
  favicon: ImageAsset | null;
  defaultOgImage: ImageAsset | null;
  socialLinks: { facebook?: string; instagram?: string; pinterest?: string };
  pinterestHandle: string;
  footerBlurb: string;
  permalink: Permalink;
  titleTemplate: string;
  defaultMetaDescription: string;
  ga4Id: string;
  searchConsoleVerification: string;
  pinterestVerification: string;
  ads: AdSettings;
  adsTxt: string;
  emailProvider: { provider: "none" | "mailerlite" | "convertkit"; apiKey: string; listId: string };
};

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  return attempt(async () => {
    await assertRole(ADMINS);
    await connectDB();
    if (!input.siteTitle.trim()) throw new Error("Site title is required.");
    const url = (v?: string) => (v && /^https?:\/\//.test(v.trim()) ? v.trim() : "");
    const current = await SiteSettings.findOne({ key: SETTINGS_KEY }).select("emailProvider").lean();
    const update = {
      siteTitle: s(input.siteTitle, 80),
      tagline: s(input.tagline, 160),
      authorName: s(input.authorName, 80),
      logo: img(input.logo),
      favicon: img(input.favicon),
      defaultOgImage: img(input.defaultOgImage),
      socialLinks: { facebook: url(input.socialLinks.facebook), instagram: url(input.socialLinks.instagram), pinterest: url(input.socialLinks.pinterest) },
      pinterestHandle: s(input.pinterestHandle, 60).replace(/^@/, ""),
      footerBlurb: s(input.footerBlurb, 400),
      permalink: input.permalink === "category-post" ? "category-post" : "post",
      titleTemplate: s(input.titleTemplate, 100) || "%title% | %site%",
      defaultMetaDescription: s(input.defaultMetaDescription, 300),
      ga4Id: s(input.ga4Id, 30),
      searchConsoleVerification: s(input.searchConsoleVerification, 200),
      pinterestVerification: s(input.pinterestVerification, 200),
      ads: {
        headScript: s(input.ads.headScript, 20000),
        afterSecondParagraph: s(input.ads.afterSecondParagraph, 20000),
        midContent: s(input.ads.midContent, 20000),
        inContent: s(input.ads.inContent, 20000),
        stickyMobile: s(input.ads.stickyMobile, 20000),
      },
      adsTxt: s(input.adsTxt, 50000),
      emailProvider: {
        provider: input.emailProvider.provider,
        // Blank = keep the stored key (the form never receives the real key).
        apiKey: input.emailProvider.apiKey.trim() || current?.emailProvider?.apiKey || "",
        listId: s(input.emailProvider.listId, 120),
      },
    };
    await SiteSettings.updateOne({ key: SETTINGS_KEY }, { $set: update }, { upsert: true });
    await revalidateSite({ all: true });
    return {};
  });
}
