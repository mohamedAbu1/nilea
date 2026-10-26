import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nilea — A Thousand Stories",
  description: "A cinematic journey through Egypt's extraordinary story.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
