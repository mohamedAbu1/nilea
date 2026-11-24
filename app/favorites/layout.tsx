import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your AlpNile favorites",
  robots: { index: false, follow: false },
};

export default function FavoritesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
