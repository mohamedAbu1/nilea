import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to AlpNile",
  robots: { index: false, follow: false },
};

export default function WelcomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
