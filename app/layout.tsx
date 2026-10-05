import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RICOZ — Find The Right Creative Talent",
  description:
    "RICOZ helps businesses discover, evaluate and connect with creative talent for their next project.",
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
    <html lang="en" className="h-full">
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
