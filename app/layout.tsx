import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ricoz-six.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RICOZ — Curated Creative Direction & Design Mandates",
    template: "%s | RICOZ",
  },
  description:
    "RICOZ connects visionary enterprises with premier Creative Directors, Brand Architects, and Specialized Design Teams for high-impact rebrands and product mandates.",
  keywords: [
    "ricoz",
    "creative directors",
    "brand architects",
    "design systems",
    "curated creative talent",
    "bespoke typography",
    "enterprise rebrand",
    "ui ux design pod",
  ],
  authors: [{ name: "Ricoz Collective" }],
  creator: "RICOZ Collective Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "RICOZ",
    title: "RICOZ — Curated Creative Direction & Design Mandates",
    description:
      "RICOZ connects visionary enterprises with premier Creative Directors, Brand Architects, and Specialized Design Teams.",
    images: [
      {
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "RICOZ Curated Creative Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RICOZ — Curated Creative Direction & Design Mandates",
    description:
      "RICOZ connects visionary enterprises with premier Creative Directors, Brand Architects, and Specialized Design Teams.",
    images: ["/images/og-cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-background">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FBF6F0" />
      </head>
      <body
        className={`${dmSans.variable} ${playfair.variable} ${inter.variable} min-h-full flex flex-col font-sans bg-background text-brand antialiased selection:bg-accent selection:text-cream`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}