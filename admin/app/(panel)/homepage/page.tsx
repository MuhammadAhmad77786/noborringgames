import type { Metadata } from "next";
import { Category, getSiteSettingsDoc, toPlain } from "@craft/db";
import type { Facet, SiteSettingsDTO } from "@craft/shared";
import { ADMINS, requireUser } from "@/lib/auth";
import type { HomepageInput } from "../settings/actions";
import { HomepageForm } from "./HomepageForm";

export const metadata: Metadata = { title: "Homepage" };
export const dynamic = "force-dynamic";

export default async function HomepageSettingsPage() {
  await requireUser(ADMINS);
  const [doc, cats] = await Promise.all([getSiteSettingsDoc(), Category.find().sort({ facet: 1, sortOrder: 1 }).select("name facet emoji").lean()]);
  const home = toPlain<Partial<SiteSettingsDTO["home"]>>(doc?.home ?? {});
  const pins = [...(home.pins ?? [])];
  while (pins.length < 5) pins.push({ image: undefined, link: "" });
  const stats = [...(home.stats ?? [])];
  while (stats.length < 4) stats.push({ value: "", label: "" });

  const initial: HomepageInput = {
    heroBadge: home.heroBadge ?? "",
    heroHeadline: home.heroHeadline ?? "",
    heroHighlight: home.heroHighlight ?? "",
    heroParagraph: home.heroParagraph ?? "",
    heroImage: home.heroImage ?? null,
    stats,
    currentSeasonCategoryIds: home.currentSeasonCategoryIds ?? [],
    seasonRowEyebrow: home.seasonRowEyebrow ?? "",
    seasonRowTitle: home.seasonRowTitle ?? "",
    seasonRowSubtitle: home.seasonRowSubtitle ?? "",
    seasonRowLinkText: home.seasonRowLinkText ?? "",
    navInSeasonLabel: home.navInSeasonLabel ?? "",
    navInSeasonCategoryId: home.navInSeasonCategoryId ?? "",
    authorPhoto: home.authorPhoto ?? null,
    authorEyebrow: home.authorEyebrow ?? "",
    authorHeading: home.authorHeading ?? "",
    authorBio: home.authorBio ?? "",
    authorButtonText: home.authorButtonText ?? "",
    pins,
    usePostPinsFallback: home.usePostPinsFallback ?? true,
    newsletterEyebrow: home.newsletterEyebrow ?? "",
    newsletterHeading: home.newsletterHeading ?? "",
    newsletterText: home.newsletterText ?? "",
    newsletterButton: home.newsletterButton ?? "",
  };
  const categories = cats.map((c) => ({ id: String(c._id), name: c.name, facet: c.facet as Facet, emoji: c.emoji ?? "" }));
  return <HomepageForm initial={initial} categories={categories} />;
}
