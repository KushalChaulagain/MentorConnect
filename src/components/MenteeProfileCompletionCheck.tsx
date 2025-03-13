import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenteeProfileCompletionCheckProps {
  children: React.ReactNode;
  requiredForContent?: boolean; // If true, children will only be shown if profile is complete
}

export default function MenteeProfileCompletionCheck({ 
  children, 
  requiredForContent = false 
}: MenteeProfileCompletionCheckProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Add fromOnboarding parameter to ensure we get an accurate completion status
        const response = await fetch("/api/profile?fromOnboarding=true");
        if (response.ok) {
          const data = await response.json();
          console.log("Mentee profile data for completion check:", data);
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

  // Only apply to mentees, not mentors
  if (!session?.user || session.user.role !== "MENTEE") {
    return <>{children}</>;
  }

  // Still loading
  if (loading) {
    return <>{children}</>;
  }

  // Check if the profile is truly complete based on additional criteria
  const isProfileComplete = 
    profileData?.completionStatus === 100 && 
    !!profileData?.learningGoals && 
    !!profileData?.skillLevel && 
    !!profileData?.areasOfInterest && 
    !!profileData?.learningStyle && 
    !!profileData?.careerGoals && 
    !!profileData?.currentChallenges && 
    !!profileData?.education &&
    !!profileData?.bio;

  // If profile is complete (100%), show content without banner
  if (isProfileComplete) {
    return <>{children}</>;
  }

  // If the content requires complete profile but profile is not complete
  if (requiredForContent) {
    return (
      <div className="w-full">
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 p-6 rounded-lg mb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-200 dark:bg-indigo-800 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-indigo-800 dark:text-indigo-200" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200">Complete your profile to access this feature</h3>
              <p className="mt-1 text-indigo-700 dark:text-indigo-300">
                Your mentee profile is incomplete. Please complete your profile to unlock full access to mentors and learning resources.
              </p>
              <div className="mt-4 space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-800">
                    Complete your mentee profile
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    You need to complete your profile to access all features.
                  </p>
                  <div className="mt-3">
                    <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                      <li>Detailed Bio (at least 25 characters)</li>
                      <li>Professional Title</li>
                      <li>Learning Goals</li>
                      <li>Skill Level</li>
                      <li>Areas of Interest</li>
                      <li>Learning Style</li>
                      <li>Career Goals</li>
                      <li>Current Challenges</li>
                      <li>Education</li>
                      <li>GitHub Profile</li>
                      {/* Note: Company is not required for mentees */}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/dashboard/profile/edit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Complete Your Profile
                    </Link>
                  </div>
                </div>
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
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 p-6 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">Complete your profile</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-400">
              Your mentee profile is incomplete. Complete it to better match with mentors and unlock advanced features.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/dashboard/profile/edit")}
            variant="outline" 
            className="border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
          >
            Complete Profile
          </Button>
        </div>
        {profileData?.completionStatus && (
          <div className="mt-4 w-full bg-indigo-200 dark:bg-indigo-900 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${profileData.completionStatus}%` }}
            ></div>
            <p className="text-xs mt-1 text-indigo-700 dark:text-indigo-400">
              {profileData.completionStatus}% complete
            </p>
          </div>
        )}
      </div>
      {children}
    </div>
  );
} 