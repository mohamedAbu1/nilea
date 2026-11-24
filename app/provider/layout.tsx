import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile provider workspace",
  robots: { index: false, follow: false },
};

export default function ProviderLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
