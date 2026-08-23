import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  applicationName: "GTM Lab",
  title: { default: "GTM Lab — From market strategy to revenue action", template: "%s · GTM Lab" },
  description: "An interactive go-to-market strategy and revenue planning workspace.",
  keywords: ["go-to-market strategy", "revenue planning", "account prioritization", "sales strategy", "portfolio project"],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "GTM Lab",
    description: "From market strategy to revenue action",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "GTM Lab — From market strategy to revenue action" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GTM Lab",
    description: "From market strategy to revenue action",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
