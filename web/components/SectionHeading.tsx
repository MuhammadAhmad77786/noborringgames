import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Renders a heading where `highlight` (if found in `title`) gets the yellow
 * marker stroke. Without a match, the whole title is highlighted.
 */
export function Highlighted({ title, highlight }: { title: string; highlight?: string }) {
  const word = highlight?.trim();
  if (word) {
    const i = title.toLowerCase().indexOf(word.toLowerCase());
    if (i >= 0) {
      return (
        <>
          {title.slice(0, i)}
          <span className="hl">{title.slice(i, i + word.length)}</span>
          {title.slice(i + word.length)}
        </>
      );
    }
  }
  return <span className="hl hl-wrap">{title}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  link,
  as = "h2",
  id,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  highlight?: string;
  subtitle?: ReactNode;
  link?: { href: string; label: string };
  as?: "h1" | "h2";
  id?: string;
  children?: ReactNode;
}) {
  const H = as;
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <H className="section-title" id={id}>
          <Highlighted title={title} highlight={highlight} />
        </H>
        {subtitle && <p className="section-sub">{subtitle}</p>}
        {children}
      </div>
      {link && (
        <Link href={link.href} className="see-all">
          {link.label}
        </Link>
      )}
    </div>
  );
}
