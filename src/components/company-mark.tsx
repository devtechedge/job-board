import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { companyInitials, companyLogoSrc } from "@/lib/logo";
import { cn } from "@/lib/utils";

export function CompanyMark({
  name,
  website,
  logoUrl,
  size = 20,
}: {
  name: string;
  website?: string | null;
  logoUrl?: string | null;
  size?: number;
}) {
  const src = companyLogoSrc({ logoUrl, website });
  const [failed, setFailed] = useState(!src);
  if (failed || !src) {
    return (
      <span
        aria-hidden
        className="inline-flex shrink-0 items-center justify-center rounded-sm bg-inset font-serif font-semibold text-pine"
        style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.42)) }}
      >
        {companyInitials(name).slice(0, 2)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="inline-block shrink-0 rounded-sm bg-paper object-contain"
      style={{ width: size, height: size }}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function CompanyNameLink({
  name,
  slug,
  website,
  logoUrl,
  size = 20,
  className,
}: {
  name: string;
  slug: string;
  website?: string | null;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <Link
      to="/companies/$slug"
      params={{ slug }}
      className={cn("inline-flex min-w-0 max-w-full items-center gap-2 hover:text-pine", className)}
    >
      <CompanyMark name={name} website={website} logoUrl={logoUrl} size={size} />
      <span className="truncate">{name}</span>
    </Link>
  );
}
