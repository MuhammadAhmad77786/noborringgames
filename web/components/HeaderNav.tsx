"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CloseIcon, MenuIcon, SearchIcon } from "./Icons";

export type NavItem = { href: string; label: string; season?: boolean; emoji?: string };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ items, more }: { items: NavItem[]; more: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  // Shadow under the sticky header once the page scrolls.
  useEffect(() => {
    const header = document.getElementById("site-header");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMoreOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [moreOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
    document.body.style.overflow = searchOpen || mobileOpen ? "hidden" : "";
  }, [searchOpen, mobileOpen]);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <nav className="main-nav" aria-label="Main">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`nav-x ${it.season ? "nav-season" : ""} ${isActive(pathname, it.href) ? "is-active" : ""}`}
            aria-current={isActive(pathname, it.href) ? "page" : undefined}
          >
            {it.label}
          </Link>
        ))}
        {more.length > 0 && (
          <div className="dropdown-x" ref={moreRef}>
            <button
              type="button"
              className="nav-x"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              More <ChevronDown />
            </button>
            {moreOpen && (
              <ul className="dropdown-menu-x">
                {more.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href}>
                      {it.emoji && <span aria-hidden="true">{it.emoji}</span>}
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button type="button" className="icon-btn ms-2" aria-label="Search crafts" onClick={() => setSearchOpen(true)}>
          <SearchIcon />
        </button>
      </nav>

      <div className="d-flex gap-2 d-lg-none">
        <button type="button" className="icon-btn" aria-label="Search crafts" onClick={() => setSearchOpen(true)}>
          <SearchIcon />
        </button>
        <button
          type="button"
          className="icon-btn burger"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </button>
      </div>

      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <div
        id="mobile-menu"
        className={`mobile-menu ${mobileOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!mobileOpen}
      >
        <div className="d-flex justify-content-end mb-2">
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        {[...items, ...more].map((it) => (
          <Link key={`m-${it.href}`} href={it.href} className={isActive(pathname, it.href) ? "is-active" : ""}>
            {it.emoji && <span aria-hidden="true">{it.emoji} </span>}
            {it.label}
          </Link>
        ))}
      </div>

      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
          <form onSubmit={onSearch} role="search">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="eyebrow mb-0">Search the craft room</span>
              <button type="button" className="icon-btn" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="searchbar" style={{ maxWidth: "none" }}>
              <label htmlFor="overlay-q" className="visually-hidden-x">
                Search crafts
              </label>
              <input
                ref={searchInput}
                id="overlay-q"
                name="q"
                type="search"
                placeholder="Try 'pumpkin', 'coloring', 'snowman'…"
                autoComplete="off"
              />
              <button type="submit">Search</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
