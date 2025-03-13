import MenteeProfileCompletionCheck from "@/components/MenteeProfileCompletionCheck";
import React from "react";

interface MenteeFeatureGuardProps {
  children: React.ReactNode;
}

export default function MenteeFeatureGuard({
  children,
}: MenteeFeatureGuardProps) {
  return (
    <MenteeProfileCompletionCheck requiredForContent={true}>
      {children}
    </MenteeProfileCompletionCheck>
  );
} 