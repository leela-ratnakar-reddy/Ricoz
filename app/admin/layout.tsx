import React from "react";
import { Metadata } from "next";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export const metadata: Metadata = {
  title: "RICOZ Admin — Operations Management Suite",
  description: "Internal operations and platform control for authorized team members.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
