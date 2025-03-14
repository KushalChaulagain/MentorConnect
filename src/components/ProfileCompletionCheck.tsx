import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProfileCompletionCheckProps {
  children: React.ReactNode;
  requiredForContent?: boolean; // If true, children will only be shown if profile is complete
  type?: "MENTOR" | "MENTEE"; // Optional: specify which type to check, defaults to current user's role
}

export default function ProfileCompletionCheck({ 
  children, 
  requiredForContent = false,
  type 
}: ProfileCompletionCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [componentReady, setComponentReady] = useState(false);
  
  // Determine user role to check - but don't assume it yet until we know for sure
  const userRole = type || session?.user?.role;
  const isMentor = userRole === "MENTOR";

  useEffect(() => {
    // Skip if session is still loading or if we're missing user data
    if (status === "loading" || !session?.user?.id) {
      return;
    }

    // Set a timeout to ensure we show content even if the profile API is slow
    const timeoutId = setTimeout(() => {
      if (loading) {
        setComponentReady(true);
        console.log("Setting componentReady=true due to timeout, continuing with children render");
      }
    }, 1000); // Wait 1 second then show content even if profile is still loading

    const fetchProfileData = async () => {
      try {
        // Add fromOnboarding parameter to ensure we get an accurate completion status
        console.log(`Fetching profile data for ${userRole}...`);
        const response = await fetch("/api/profile?fromOnboarding=true");
        
        if (response.ok) {
          const data = await response.json();
          
          // Log all the raw data so we can see exactly what the server is sending
          console.log(`${userRole} PROFILE RAW DATA:`, JSON.stringify(data, null, 2));
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
        setComponentReady(true);
        clearTimeout(timeoutId); // Clear timeout since we have finished loading
      }
    };

    fetchProfileData();

    return () => clearTimeout(timeoutId);
  }, [session, userRole, status, loading]);

  // If we don't have a session yet or the component is not ready, show a minimal loading state
  if (!componentReady) {
    return (
      <div className="min-h-[50px] opacity-0 transition-opacity duration-150">
        {/* This creates space but is invisible during loading */}
        {children}
      </div>
    );
  }

  // Only apply if the user's role matches the expected type
  if (!session?.user || (type && session.user.role !== type)) {
    return <>{children}</>;
  }
  
  // If the server explicitly says profile is 100% complete, immediately render children without warnings
  if (profileData?.completionStatus === 100 || profileData?.completionStatus === "100%") {
    console.log("Server reports 100% profile completion, skipping client-side checks");
    return <>{children}</>;
  }

  // Type-specific missing fields check
  const missingFields = getMissingFields(profileData, isMentor);
  
  // Check if the user has a 100% completion status from the server (most accurate)
  const serverCompletionStatus = profileData?.completionStatus;
  
  const isCompleteAccordingToServer = serverCompletionStatus === 100 || serverCompletionStatus === "100%";
  
  // Fallback to our own calculation if server doesn't provide completion status
  const isProfileComplete = isCompleteAccordingToServer || missingFields.length === 0;
  
  // Check if the user is verified
  const isVerified = (isMentor 
    ? profileData?.mentorProfile?.isVerified 
    : profileData?.menteeProfile?.isVerified) || isProfileComplete;
  
  console.log("Profile completion check:", {
    serverCompletionStatus: profileData?.completionStatus,
    isCompleteAccordingToServer,
    missingFieldsCount: missingFields.length,
    isProfileComplete,
    isVerified
  });
    
  // Always show children without warnings for verified users or complete profiles
  if (isVerified) {
    return <>{children}</>;
  }
  
  // If we're not requiring completion for content, show warning above children
  if (!requiredForContent) {
    return (
      <>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your {isMentor ? "mentor" : "mentee"} profile is incomplete.
                Complete your profile to get the most out of MentorConnect!
              </p>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/profile`)}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Profile is incomplete and we're requiring completion for content
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-center mb-6">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mr-4" />
        <h2 className="text-2xl font-bold text-center">Complete Your Profile</h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        To access this feature, you need to complete your {isMentor ? "mentor" : "mentee"} profile. 
        The following information is missing:
      </p>
      
      <ul className="list-disc pl-6 mb-6 space-y-1 text-gray-600 dark:text-gray-300">
        {missingFields.map((field) => (
          <li key={field}>{formatFieldName(field)}</li>
        ))}
      </ul>
      
      <div className="flex justify-center">
        <Button
          onClick={() => router.push(`/dashboard/profile`)}
          className="w-full"
        >
          Complete Profile Now
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function getMissingFields(profileData: any, isMentor: boolean): string[] {
  if (!profileData) return [];
  
  // If user has a verified flag, immediately return empty array (no missing fields)
  if ((isMentor && profileData.mentorProfile?.isVerified) || 
      (!isMentor && profileData.menteeProfile?.isVerified)) {
    return [];
  }
  
  const missingFields = [];

  // Common fields for both mentors and mentees
  if (!profileData.name) missingFields.push("name");
  if (!profileData.bio) missingFields.push("bio");
  
  // Mentor-specific required fields
  if (isMentor) {
    // Check if mentorProfile exists first to avoid null/undefined errors
    if (!profileData.mentorProfile) {
      return ["mentorProfile"]; // Missing entire profile
    }
    
    if (!profileData.expertise) missingFields.push("expertise");
    if (!profileData.mentorProfile.title) missingFields.push("title");
    if (!profileData.mentorProfile.hourlyRate) missingFields.push("hourlyRate");
    if (!profileData.mentorProfile.yearsOfExperience) missingFields.push("yearsOfExperience");
    
    // Make sure skills exists and has at least one entry that's not empty
    const hasSkills = profileData.mentorProfile.skills && 
                     Array.isArray(profileData.mentorProfile.skills) && 
                     profileData.mentorProfile.skills.length >= 3; // Require minimum 3 skills for verification
    
    if (!hasSkills) {
      missingFields.push("skills");
    }
  } 
  // Mentee-specific required fields
  else {
    // Check if menteeProfile exists first to avoid null/undefined errors
    if (!profileData.menteeProfile) {
      return ["menteeProfile"]; // Missing entire profile
    }
    
    if (!profileData.menteeProfile.goals) missingFields.push("goals");
    
    // Make sure interests exists and has at least one entry that's not empty
    const hasInterests = profileData.menteeProfile.interests && 
                        Array.isArray(profileData.menteeProfile.interests) && 
                        profileData.menteeProfile.interests.length > 0;
    
    if (!hasInterests) {
      missingFields.push("interests");
    }
  }
  
  return missingFields;
}

function formatFieldName(field: string): string {
  // Convert camelCase to space-separated words and capitalize first letter
  const formatted = field.replace(/([A-Z])/g, ' $1').trim();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
} 