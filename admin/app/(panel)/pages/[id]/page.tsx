import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { Page, getSiteSettingsDoc, toPlain } from "@craft/db";
import type { SeoFields } from "@craft/shared";
import { ADMINS, requireUser } from "@/lib/auth";
import type { PageInput } from "../actions";
import { PageForm } from "../PageForm";

export const metadata: Metadata = { title: "Edit page" };
export const dynamic = "force-dynamic";

export default async function PageEdit({ params }: PageProps<"/pages/[id]">) {
  await requireUser(ADMINS);
  const { id } = await params;
  const settings = await getSiteSettingsDoc();
  let initial: PageInput = { title: "", slug: "", content: "", seo: {} };
  if (id !== "new") {
    if (!Types.ObjectId.isValid(id)) notFound();
    const p = await Page.findById(id).lean();
    if (!p) notFound();
    const x = toPlain<{ title: string; slug: string; content: string; seo?: SeoFields }>(p);
    initial = { id, title: x.title, slug: x.slug, content: x.content, seo: x.seo ?? {} };
  }
  return (
    <PageForm
      initial={initial}
      siteUrl={(process.env.SITE_URL ?? "").replace(/\/$/, "")}
      siteTitle={settings?.siteTitle ?? ""}
      titleTemplate={settings?.titleTemplate ?? "%title% | %site%"}
    />
  );
}
