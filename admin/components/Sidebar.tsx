"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@craft/shared";

type Item = { href: string; label: string; roles?: Role[]; badge?: number };

export function Sidebar({ role, siteTitle, pendingComments, unreadMessages }: { role: Role; siteTitle: string; pendingComments: number; unreadMessages: number }) {
  const pathname = usePathname();
  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Content",
      items: [
        { href: "/", label: "Dashboard" },
        { href: "/posts", label: "Posts" },
        { href: "/categories", label: "Categories", roles: ["admin", "editor"] },
        { href: "/tags", label: "Tags", roles: ["admin", "editor"] },
        { href: "/pages", label: "Pages", roles: ["admin"] },
        { href: "/media", label: "Media" },
      ],
    },
    {
      title: "Audience",
      items: [
        { href: "/comments", label: "Comments", roles: ["admin", "editor"], badge: pendingComments },
        { href: "/subscribers", label: "Subscribers", roles: ["admin"] },
        { href: "/messages", label: "Messages", roles: ["admin"], badge: unreadMessages },
      ],
    },
    {
      title: "Site",
      items: [
        { href: "/homepage", label: "Homepage", roles: ["admin"] },
        { href: "/users", label: "Users", roles: ["admin"] },
        { href: "/settings", label: "Settings", roles: ["admin"] },
      ],
    },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="admin-sidebar">
      <Link href="/" className="brand">
        <span aria-hidden="true">✂️</span> {siteTitle}
      </Link>
      <nav aria-label="Admin">
        {sections.map((s) => {
          const items = s.items.filter((i) => !i.roles || i.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={s.title}>
              <div className="nav-section">{s.title}</div>
              {items.map((i) => (
                <Link key={i.href} href={i.href} className={`nav-item-x ${isActive(i.href) ? "active" : ""}`}>
                  {i.label}
                  {!!i.badge && <span className="badge rounded-pill text-bg-warning">{i.badge}</span>}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
