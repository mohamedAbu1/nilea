import Link from "next/link";
import Image from "next/image";

type BrandLogoProps = {
  href?: string;
  className?: string;
};

export function BrandLogo({ href = "/", className = "" }: BrandLogoProps) {
  return (
    <Link href={href} className={`brand-logo-link ${className}`.trim()} aria-label="AlpNile home">
      <Image
        src="/alpnile-logo-optimized.webp"
        alt="AlpNile"
        className="brand-logo"
        width={640}
        height={213}
        sizes="(max-width: 640px) 142px, 190px"
        preload
        fetchPriority="high"
        draggable={false}
      />
    </Link>
  );
}
