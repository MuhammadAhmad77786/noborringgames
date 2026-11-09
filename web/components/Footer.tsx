import Link from "next/link";
import type { CategoryDTO, SiteSettingsDTO } from "@craft/shared";
import { FacebookIcon, InstagramIcon, PinterestIcon } from "./Icons";

export function Footer({ settings, categories }: { settings: SiteSettingsDTO; categories: CategoryDTO[] }) {
  const footerCats = categories.filter((c) => c.showInFooter);
  const seasons = footerCats.filter((c) => c.facet === "season");
  const crowds = footerCats.filter((c) => c.facet === "audience");
  const { facebook, instagram, pinterest } = settings.socialLinks;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container-x">
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-3">
            <h2 className="footer-title">Get in touch</h2>
            {settings.footerBlurb && <p className="mb-3">{settings.footerBlurb}</p>}
            <div className="social-btns">
              {facebook && (
                <a href={facebook} className="social-btn" aria-label="Facebook" rel="noopener" target="_blank">
                  <FacebookIcon />
                </a>
              )}
              {instagram && (
                <a href={instagram} className="social-btn" aria-label="Instagram" rel="noopener" target="_blank">
                  <InstagramIcon />
                </a>
              )}
              {pinterest && (
                <a href={pinterest} className="social-btn" aria-label="Pinterest" rel="noopener" target="_blank">
                  <PinterestIcon />
                </a>
              )}
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <h2 className="footer-title">Browse by season</h2>
            <ul className="footer-links">
              {seasons.map((c) => (
                <li key={c._id}>
                  <Link href={`/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h2 className="footer-title">Browse by crowd</h2>
            <ul className="footer-links">
              {crowds.map((c) => (
                <li key={c._id}>
                  <Link href={`/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h2 className="footer-title">Explore</h2>
            <ul className="footer-links">
              <li>
                <Link href="/crafts">All crafts</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {year} {settings.siteTitle}. All rights reserved.
          </span>
          <nav aria-label="Legal">
            <Link href="/privacy-policy">Privacy</Link> · <Link href="/cookies-policy">Cookies</Link> ·{" "}
            <Link href="/terms">Terms</Link> · <Link href="/accessibility">Accessibility</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
