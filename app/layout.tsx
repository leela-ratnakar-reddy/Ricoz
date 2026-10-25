import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RICOZ — Curated Creative Direction & Design Mandates",
  description:
    "RICOZ connects visionary enterprises with premier Creative Directors, Brand Architects, and Specialized Design Teams.",
  keywords: [
    "ricoz",
    "creative talent",
    "creative directors",
    "brand identity",
    "ui ux designers",
    "motion designers",
    "design systems",
  ],
  authors: [{ name: "Ricoz" }],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-brand antialiased selection:bg-accent selection:text-cream">
        {children}
      </body>
    </html>
  );
}