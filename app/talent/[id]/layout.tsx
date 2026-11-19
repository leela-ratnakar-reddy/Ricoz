import type { Metadata } from "next";
import React from "react";
import { getTalentById } from "@/data/talentProfiles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const talent = getTalentById(id);

  if (!talent) {
    return {
      title: "Specialist Dossier Not Found",
      description: "The requested creative specialist profile was not found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ricoz-six.vercel.app";
  const bioSummary = talent.bio?.slice(0, 160) || `Verified case studies and portfolio for ${talent.name}.`;

  return {
    title: `${talent.name} — ${talent.role}`,
    description: bioSummary,
    openGraph: {
      title: `${talent.name} — ${talent.role} | RICOZ`,
      description: bioSummary,
      url: `${siteUrl}/talent/${talent.id}`,
      type: "profile",
      images: [
        {
          url: talent.profileImage || "/images/og-cover.jpg",
          alt: `${talent.name} - ${talent.role}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${talent.name} — ${talent.role}`,
      description: bioSummary,
      images: [talent.profileImage || "/images/og-cover.jpg"],
    },
  };
}

export default function TalentProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
