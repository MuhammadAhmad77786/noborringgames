import type { Metadata } from "next";
import { getSiteSettingsDoc, toPlain } from "@craft/db";
import type { SiteSettingsDTO } from "@craft/shared";
import { ADMINS, requireUser } from "@/lib/auth";
import type { SettingsInput } from "./actions";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser(ADMINS);
  const s = toPlain<Partial<SiteSettingsDTO>>((await getSiteSettingsDoc()) ?? {});
  const initial: SettingsInput = {
    siteTitle: s.siteTitle ?? "",
    tagline: s.tagline ?? "",
    authorName: s.authorName ?? "",
    logo: s.logo ?? null,
    favicon: s.favicon ?? null,
    defaultOgImage: s.defaultOgImage ?? null,
    socialLinks: s.socialLinks ?? {},
    pinterestHandle: s.pinterestHandle ?? "",
    footerBlurb: s.footerBlurb ?? "",
    permalink: s.permalink ?? "post",
    titleTemplate: s.titleTemplate ?? "%title% | %site%",
    defaultMetaDescription: s.defaultMetaDescription ?? "",
    ga4Id: s.ga4Id ?? "",
    searchConsoleVerification: s.searchConsoleVerification ?? "",
    pinterestVerification: s.pinterestVerification ?? "",
    ads: s.ads ?? {},
    adsTxt: s.adsTxt ?? "",
    // The stored API key is never sent to the browser.
    emailProvider: { provider: s.emailProvider?.provider ?? "none", apiKey: "", listId: s.emailProvider?.listId ?? "" },
  };
  return <SettingsForm initial={initial} hasApiKey={!!s.emailProvider?.apiKey} siteUrl={process.env.SITE_URL ?? ""} />;
}
