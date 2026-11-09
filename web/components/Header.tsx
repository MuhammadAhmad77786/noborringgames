import type { CategoryDTO, SiteSettingsDTO } from "@craft/shared";
import { Brand } from "./Logo";
import { HeaderNav, type NavItem } from "./HeaderNav";

export function Header({ settings, categories }: { settings: SiteSettingsDTO; categories: CategoryDTO[] }) {
  const author = settings.authorName?.split(" ")[0] || "Me";
  const seasonCat = categories.find((c) => c._id === settings.home.navInSeasonCategoryId);

  const items: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: `About ${author}` },
    { href: "/contact", label: "Contact" },
  ];
  if (seasonCat) {
    items.push({
      href: `/category/${seasonCat.slug}`,
      label: settings.home.navInSeasonLabel || `${seasonCat.name} Crafts`,
      season: true,
    });
  }
  const more = categories
    .filter((c) => c.showInNavbar && c._id !== seasonCat?._id)
    .map((c) => ({ href: `/category/${c.slug}`, label: c.name, emoji: c.emoji }));
  more.unshift({ href: "/crafts", label: "All crafts", emoji: "✂️" });

  return (
    <header className="site-header" id="site-header">
      <div className="stripe stripe-top" />
      <div className="container-x header-inner">
        <Brand settings={settings} />
        <HeaderNav items={items} more={more} />
      </div>
    </header>
  );
}
