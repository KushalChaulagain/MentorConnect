import MentorProfileCompletionCheck from "@/components/MentorProfileCompletionCheck";

interface MentorFeatureGuardProps {
  children: React.ReactNode;
  feature: string; // Name of the feature being guarded for better messaging
}

export default function MentorFeatureGuard({ children, feature }: MentorFeatureGuardProps) {
  return (
    <MentorProfileCompletionCheck requiredForContent={true}>
      {children}
    </MentorProfileCompletionCheck>
  );
} 