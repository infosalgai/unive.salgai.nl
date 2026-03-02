"use client";

import Image from "next/image";
import Link from "next/link";

type UniveLogoProps = {
  /** Height of the logo in pixels (width scales to keep aspect ratio ~2:1) */
  height?: number;
  /** If set, wrap logo in a link to this href (e.g. /intro) */
  href?: string;
  /** Optional subtitle below the logo */
  subtitle?: string;
  className?: string;
};

export function UniveLogo({ height = 40, href, subtitle, className = "" }: UniveLogoProps) {
  const img = (
    <Image
      src="/logo-unive.png"
      alt="Univé"
      width={height * 2}
      height={height}
      className={`object-contain object-left ${className}`}
      priority
    />
  );

  const content = (
    <div className="flex flex-col gap-0.5">
      {href ? (
        <Link href={href} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
          {img}
        </Link>
      ) : (
        img
      )}
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );

  return content;
}
