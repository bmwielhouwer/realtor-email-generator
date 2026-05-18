import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Realtor Email Generator | Compass Line Ventures",
  description:
    "Generate 5 professional cold emails tailored for real estate agent outreach, powered by Claude.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
