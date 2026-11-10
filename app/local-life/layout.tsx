import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlpNile — Local Life",
  description: "Taste, meet and experience the everyday Egypt beyond the landmarks.",
};

export default function LocalLifeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
