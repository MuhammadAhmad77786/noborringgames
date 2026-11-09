import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getPageBySlug, getSettings } from "@/lib/data";
import { JsonLd, breadcrumbLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/post-meta";
import { buildMetadata } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [s, page] = await Promise.all([getSettings(), getPageBySlug("contact")]);
  if (page) return pageMetadata(page, s, "/contact");
  return buildMetadata(s, { title: "Contact", path: "/contact" });
}

export default async function ContactPage() {
  const page = await getPageBySlug("contact");
  return (
    <div className="container-x">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <div className="page-content">
        <span className="eyebrow">Say hello</span>
        <h1 className="post-title">
          <span className="hl">{page?.title || "Get in touch"}</span>
        </h1>
        {page?.content && <div className="prose mb-4" dangerouslySetInnerHTML={{ __html: page.content }} />}
        <div className="box">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
