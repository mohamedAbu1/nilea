import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
};

export function BrandLogo({ href = "/", className = "" }: BrandLogoProps) {
  return (
    <Link href={href} className={`brand-logo-link ${className}`.trim()} aria-label="AlpNile home">
      <img
        src="/alpnile-logo.webp"
        alt="AlpNile"
        className="brand-logo"
        width={2175}
        height={723}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />
    </Link>
  );
}
