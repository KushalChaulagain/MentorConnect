"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
  
  // If we're not requiring completion for content, show styled warning above children
  if (!requiredForContent) {
    // Calculate completion percentage
    const completionPercentage = typeof serverCompletionStatus === 'number' 
      ? serverCompletionStatus 
      : missingFields.length === 0 ? 100 : 0;
      
    return (
      <>
        {/* Modern styled banner according to cursor UI rules */}
        <div className="mb-6 ml-10 mr-4 overflow-hidden rounded-xl bg-gradient-to-r from-[#1A1C26] to-[#181A24] border border-[#3949AB]/30 shadow-lg">
          <div className="relative px-4 py-4 sm:px-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-[#3949AB]/10 p-2">
                  <AlertTriangle className="h-5 w-5 text-[#00C6FF]" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-white">
                  Complete your {isMentor ? "mentor" : "mentee"} profile
                </h3>
                <div className="mt-1 text-sm text-[#E0E0E0] leading-relaxed">
                  Your profile is only {completionPercentage}% complete. 
                  {isMentor 
                    ? " Enhance your visibility and attract more students by completing your profile."
                    : " Complete your profile to improve mentor matching and find the right mentors for your learning journey."
                  }
                </div>
                <div className="mt-3">
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#3949AB] to-[#4A5BC7] px-4 py-2 text-sm font-medium text-white shadow-md hover:brightness-110 transition duration-300"
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 h-16 w-16 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00C6FF" className="h-full w-full">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-[#3949AB] to-[#00C6FF]"></div>
        </div>
        {children}
      </>
    );
  }

  // Profile is incomplete and we're requiring completion for content - use styled version here too
  return (
    <div className="bg-gradient-to-r from-[#1A1C26] to-[#181A24] shadow-lg rounded-xl p-6 max-w-xl mx-auto border border-[#3949AB]/30">
      <div className="flex items-center justify-center mb-6">
        <div className="rounded-full bg-[#3949AB]/10 p-4 mr-4">
          <AlertTriangle className="h-8 w-8 text-[#00C6FF]" />
        </div>
        <h2 className="text-2xl font-light text-white">Complete Your Profile</h2>
      </div>
      
      <p className="text-[#E0E0E0] mb-6 leading-relaxed text-[15px]">
        {isMentor
          ? "To attract students and increase your visibility, you need to complete your mentor profile."
          : "To find the right mentors for your learning journey, you need to complete your mentee profile."
        }
        The following information is missing:
      </p>
      
      <ul className="list-disc pl-6 mb-6 space-y-1 text-[#E0E0E0]">
        {missingFields.map((field) => (
          <li key={field}>{formatFieldName(field)}</li>
        ))}
      </ul>
      
      <div className="flex justify-center">
        <Button
          onClick={() => router.push(`/dashboard/profile`)}
          className="w-full bg-gradient-to-r from-[#3949AB] to-[#4A5BC7] hover:brightness-110 transition-all border-0 text-white px-6 py-2 rounded-lg"
        >
          Complete Profile Now
        </Button>
      </div>
      
      <div className="h-1 w-full bg-gradient-to-r from-[#3949AB] to-[#00C6FF] mt-6"></div>
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