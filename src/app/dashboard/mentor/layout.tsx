'use client';

import MentorProfileCompletionCheck from "@/components/MentorProfileCompletionCheck";
import { ReactNode } from "react";

export default function MentorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MentorProfileCompletionCheck>
      {children}
    </MentorProfileCompletionCheck>
  );
} 