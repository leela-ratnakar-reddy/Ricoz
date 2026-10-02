import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RICOZ — Creative Directors for Rebranding Projects",
  description:
    "Connect enterprise rebranding projects with experienced Creative Directors, Brand Identity Designers and specialist creative talent.",
  keywords: [
    "ricoz",
    "creative directors",
    "rebranding",
    "brand identity",
    "typography specialists",
    "enterprise design",
    "brand strategy",
  ],
  authors: [{ name: "Ricoz" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" style={{ backgroundColor: "#07080C", color: "#F5F5F0" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#07080C" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-brand antialiased selection:bg-accent selection:text-background">
        {children}
      </body>
    </html>
  );
}
