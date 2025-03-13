import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MentorProfileCompletionCheckProps {
  children: React.ReactNode;
  requiredForContent?: boolean; // If true, children will only be shown if profile is complete
}

export default function MentorProfileCompletionCheck({ 
  children, 
  requiredForContent = false 
}: MentorProfileCompletionCheckProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/profile?fromOnboarding=true");
        if (response.ok) {
          const data = await response.json();
          console.log("Mentor profile data for completion check:", data);
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfileData();
    }
  }, [session]);

  // Only apply to mentors, not mentees
  if (!session?.user || session.user.role !== "MENTOR") {
    return <>{children}</>;
  }

  // Still loading
  if (loading) {
    return <>{children}</>;
  }

  // If profile is complete (100%), show content without banner
  if (profileData?.completionStatus === 100) {
    return <>{children}</>;
  }

  // If the content requires complete profile but profile is not complete
  if (requiredForContent) {
    return (
      <div className="w-full">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-6 rounded-lg mb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-200 dark:bg-amber-800 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-800 dark:text-amber-200" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200">Complete your profile to access this feature</h3>
              <p className="mt-1 text-amber-700 dark:text-amber-300">
                Your mentor profile is incomplete. Please complete your profile to access all features.
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => router.push("/dashboard/profile/edit")}
                  variant="outline" 
                  className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile is incomplete but content doesn't require complete profile
  // Show banner and content
  return (
    <div className="w-full">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-6 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">Complete your mentor profile</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Your mentor profile is incomplete. Complete it to access all features and become visible to potential mentees.
            </p>
            
            <div className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              <p className="font-medium">Required for a complete profile:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                {!profileData?.bio || profileData.bio.length < 50 ? (
                  <li>Add a detailed bio (at least 50 characters)</li>
                ) : null}
                {!profileData?.title ? (
                  <li>Add your professional title</li>
                ) : null}
                {!profileData?.location ? (
                  <li>Add your location</li>
                ) : null}
                {!profileData?.company ? (
                  <li>Add your company/organization</li>
                ) : null}
                {(!profileData?.githubUrl && !profileData?.mentorProfile?.github) ? (
                  <li>Add your GitHub profile</li>
                ) : null}
                {(!profileData?.linkedinUrl && !profileData?.mentorProfile?.linkedin) ? (
                  <li>Add your LinkedIn profile</li>
                ) : null}
                {!profileData?.mentorProfile?.skills || profileData.mentorProfile.skills.length < 3 ? (
                  <li>Add at least 3 skills</li>
                ) : null}
                {!profileData?.mentorProfile?.hourlyRate || profileData.mentorProfile.hourlyRate < 10 ? (
                  <li>Set your hourly rate (minimum Rs. 10)</li>
                ) : null}
              </ul>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/dashboard/profile/edit")}
            variant="outline" 
            className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            Complete Profile
          </Button>
        </div>
        {profileData?.completionStatus && (
          <div className="mt-4 w-full bg-amber-200 dark:bg-amber-900 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${profileData.completionStatus}%` }}
            ></div>
            <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
              {profileData.completionStatus}% complete
            </p>
          </div>
        )}
      </div>
      {children}
    </div>
  );
} 