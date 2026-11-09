import Image from "next/image";
import Link from "next/link";
import type { SiteSettingsDTO } from "@craft/shared";

/** Default logo mark: a folded paper pinwheel in the brand colours. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg className="brand-logo" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="8" fill="#FDF6EC" stroke="#1F2A44" strokeWidth="1.5" />
      <path d="M20 20 20 6 30 12Z" fill="#F26B1D" stroke="#1F2A44" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 20 34 20 28 30Z" fill="#14998A" stroke="#1F2A44" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 20 20 34 10 28Z" fill="#FFD84D" stroke="#1F2A44" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 20 6 20 12 10Z" fill="#FBD9E5" stroke="#1F2A44" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="2.2" fill="#1F2A44" />
    </svg>
  );
}

export function Brand({ settings }: { settings: SiteSettingsDTO }) {
  return (
    <Link href="/" className="brand" aria-label={`${settings.siteTitle} home`}>
      {settings.logo?.url ? (
        <Image src={settings.logo.url} alt="" width={40} height={40} className="brand-logo" priority />
      ) : (
        <LogoMark />
      )}
      <span className="brand-name">{settings.siteTitle}</span>
    </Link>
  );
}
