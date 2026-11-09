import type { PageDTO } from "@craft/shared";
import { JsonLd, breadcrumbLd } from "@/lib/jsonld";
import { formatDate } from "@/lib/site";
import { Highlighted } from "./SectionHeading";

export function StaticPage({ page, children, eyebrow }: { page: PageDTO; children?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="container-x">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: page.title, path: `/${page.slug}` }])} />
      <div className="page-content">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="post-title">
          <Highlighted title={page.title} />
        </h1>
        {page.updatedAt && !eyebrow && (
          <p className="small text-secondary">Last updated {formatDate(page.updatedAt)}</p>
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: page.content }} />
        {children}
      </div>
    </div>
  );
}
