import ProfileCompletionCheck from "@/components/ProfileCompletionCheck";
import React from "react";

interface MenteeFeatureGuardProps {
  children: React.ReactNode;
}

export default function MenteeFeatureGuard({
  children,
}: MenteeFeatureGuardProps) {
  return (
    <ProfileCompletionCheck type="MENTEE" requiredForContent={true}>
      {children}
    </ProfileCompletionCheck>
  );
} 