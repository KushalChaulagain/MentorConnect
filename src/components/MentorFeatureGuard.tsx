import ProfileCompletionCheck from "@/components/ProfileCompletionCheck";

interface MentorFeatureGuardProps {
  children: React.ReactNode;
  feature: string; // Name of the feature being guarded for better messaging
}

export default function MentorFeatureGuard({ children, feature }: MentorFeatureGuardProps) {
  return (
    <ProfileCompletionCheck type="MENTOR" requiredForContent={true}>
      {children}
    </ProfileCompletionCheck>
  );
} 