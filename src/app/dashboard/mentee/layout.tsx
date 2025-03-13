'use client';

import MenteeProfileCompletionCheck from "@/components/MenteeProfileCompletionCheck";
import React from "react";

interface MenteeDashboardLayoutProps {
  children: React.ReactNode;
}

export default function MenteeDashboardLayout({
  children,
}: MenteeDashboardLayoutProps) {
  return (
    <MenteeProfileCompletionCheck>
      {children}
    </MenteeProfileCompletionCheck>
  );
} 