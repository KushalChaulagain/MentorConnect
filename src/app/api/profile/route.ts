import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Create a new PrismaClient instance if it doesn't exist in global scope
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Define the schema for profile updates
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  image: z.string().optional(),
  learningGoals: z.string().optional(),
  skillLevel: z.string().optional(),
  areasOfInterest: z.string().optional(),
  learningStyle: z.string().optional(),
  careerGoals: z.string().optional(),
  currentChallenges: z.string().optional(),
  education: z.string().optional(),
});

// Direct database function to get the user ID from the email in the session
async function getUserIdFromEmail(email: string | null | undefined) {
  if (!email) return null;
  
  try {
    // Simple database query to find the user by email
    const user = await prisma.user.findUnique({
      where: { 
        email: email 
      },
      select: { 
        id: true 
      }
    });
    
    // Just return the ID if user is found
    return user ? user.id : null;
  } catch (error) {
    console.error("Error getting user ID from email:", error);
    return null;
  }
}

export async function GET(request: Request) {
  console.log("Profile API GET request received");
  
  try {
    // Get the session 
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }
    
    let userId = session.user?.id;
    if (!userId && session.user?.email) {
      const userFromEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (userFromEmail) {
        userId = userFromEmail.id;
      }
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Fetch user from database with specific fields only to avoid missing column errors
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        onboardingCompleted: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }
    
    // Check for MentorProfile
    let mentorProfile = null;
    try {
      mentorProfile = await prisma.mentorProfile.findUnique({
        where: { userId: userId },
      });
      console.log("Mentor profile found:", mentorProfile ? "Yes" : "No");
    } catch (mentorError) {
      console.error("Error fetching mentor profile:", mentorError);
      // Continue without mentor profile
    }
    
    // Check for regular profile using raw Prisma query to avoid TS errors
    let userProfile = null;
    try {
      // Use the proper Prisma API instead of type assertion
      userProfile = await prisma.profile.findUnique({
        where: { userId: userId },
      });
      console.log("User profile found:", userProfile ? "Yes" : "No");
      if (userProfile) {
        console.log("Profile data:", JSON.stringify(userProfile, null, 2));
      }
    } catch (profileError) {
      console.error("Error fetching user profile:", profileError);
      console.error("This may mean the Profile model hasn't been created yet. Run 'npx prisma db push'");
    }
    
    // Try to retrieve timezone and location from localStorage via API query params
    const url = new URL(request.url);
    const savedTimezone = url.searchParams.get('savedTimezone') || "";
    const savedLocation = url.searchParams.get('savedLocation') || "";
    console.log("URL params - timezone:", savedTimezone, "location:", savedLocation);
    
    // Create profile response with default empty values
    const profileResponse = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
      role: user.role || "MENTEE",
      onboardingCompleted: user.onboardingCompleted || false,
      completionStatus: 0, // Will be calculated below
      isMentor: !!mentorProfile,
      timezone: userProfile?.timezone || savedTimezone || "",
      location: userProfile?.location || savedLocation || "",
      // Add empty values for all fields to ensure they appear in the response
      title: userProfile?.title || "",
      bio: userProfile?.bio || "",
      company: userProfile?.company || "",
      website: userProfile?.website || "",
      // Get githubUrl and linkedinUrl from regular profile if available
      githubUrl: userProfile?.githubUrl || "",
      linkedinUrl: userProfile?.linkedinUrl || "",
      yearsOfExperience: 0,
      // Mentee fields with better logging
      learningGoals: userProfile?.learningGoals || "",
      skillLevel: userProfile?.skillLevel || "",
      areasOfInterest: userProfile?.areasOfInterest || "",
      learningStyle: userProfile?.learningStyle || "",
      careerGoals: userProfile?.careerGoals || "",
      currentChallenges: userProfile?.currentChallenges || "",
      education: userProfile?.education || "",
    };
    
    console.log("User profile data being used:", {
      githubUrl: userProfile?.githubUrl,
      linkedinUrl: userProfile?.linkedinUrl,
      learningGoals: userProfile?.learningGoals,
      skillLevel: userProfile?.skillLevel,
      areasOfInterest: userProfile?.areasOfInterest,
      learningStyle: userProfile?.learningStyle,
      careerGoals: userProfile?.careerGoals,
      currentChallenges: userProfile?.currentChallenges,
      education: userProfile?.education
    });
    
    // Add mentor-specific data if this user is a mentor
    if (mentorProfile) {
      console.log("Adding mentor profile data to response:", {
        github: mentorProfile.github,
        linkedin: mentorProfile.linkedin
      });
      
      Object.assign(profileResponse, {
        // Fix naming mismatch between database and form
        githubUrl: mentorProfile.github || "", // database stores as 'github', form uses 'githubUrl'
        linkedinUrl: mentorProfile.linkedin || "", // database stores as 'linkedin', form uses 'linkedinUrl'
        expertise: mentorProfile.expertise || [],
        skills: mentorProfile.skills || [],
        hourlyRate: mentorProfile.hourlyRate || 0,
        // Ensure yearsOfExperience is properly converted to a number from the string in the database
        yearsOfExperience: mentorProfile.experience ? 
          (typeof mentorProfile.experience === 'string' ? parseInt(mentorProfile.experience) : mentorProfile.experience) : 0,
      });
    }
    
    // Calculate profile completion (simplified version)
    let completedFields = 0;
    let totalFields = 5; // Base fields: name, email, image, role, onboarding
    
    // Check basic fields
    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.image) completedFields++;
    if (user.role) completedFields++;
    if (user.onboardingCompleted) completedFields++;
    
    // Add more fields if profile exists
    if (userProfile) {
      totalFields += 5; // Add more fields for a complete profile
      
      // Count filled fields
      if (userProfile.bio) completedFields++;
      if (userProfile.location) completedFields++;
      if (userProfile.title) completedFields++;
      if (userProfile.timezone) completedFields++;
      if (userProfile.company) completedFields++;
      
      // For mentees, check mentee-specific fields
      if (user.role === "MENTEE") {
        totalFields += 5; // Add mentee-specific fields
        
        if (userProfile.learningGoals) completedFields++;
        if (userProfile.skillLevel) completedFields++;
        if (userProfile.areasOfInterest) completedFields++;
        if (userProfile.careerGoals) completedFields++;
        if (userProfile.education) completedFields++;
      }
    }
    
    // Add mentor-specific fields to calculation
    if (mentorProfile) {
      totalFields += 3; // Add mentor fields
      completedFields += 3; // Assume mentor profile is complete for simplicity
    }
    
    // Calculate percentage
    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    profileResponse.completionStatus = completionPercentage >= 90 ? 100 : completionPercentage;
    
    console.log("Returning profile response with completion:", profileResponse.completionStatus + "%");
    return NextResponse.json(profileResponse);
  } catch (error) {
    console.error("Detailed error in profile API:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log("Profile API PUT request received");
    
    // Get the session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    let userId = session.user?.id as string; // Force type to string
    if (!userId && session.user?.email) {
      const userFromEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (userFromEmail) {
        userId = userFromEmail.id;
      } else {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }
    
    // Verify user exists and get role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const isUserMentor = user.role === "MENTOR";
    console.log("Is user a mentor:", isUserMentor);
    
    // Parse the request body
    const body = await request.json();
    console.log("Received profile update body:", JSON.stringify(body, null, 2));
    
    // Log mentee-specific fields for debugging
    console.log("Mentee fields received:", {
      learningGoals: body.learningGoals,
      skillLevel: body.skillLevel,
      areasOfInterest: body.areasOfInterest,
      learningStyle: body.learningStyle,
      careerGoals: body.careerGoals,
      currentChallenges: body.currentChallenges,
      education: body.education,
    });
    
    // 1. Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        ...(body.image && { image: body.image }),
        // When a profile is successfully updated, mark onboarding as completed
        onboardingCompleted: true
      },
    });
    
    // 2. Create profile data object - for BOTH mentors and mentees
    // IMPORTANT: Make sure all fields are included and correctly typed
    const profileData = {
      title: body.title || "",
      bio: body.bio || "",
      location: body.location || "",
      company: body.company || "",
      website: body.website || "",
      timezone: body.timezone || "",
      // Store social links in the regular profile for all users
      githubUrl: body.githubUrl || "",
      linkedinUrl: body.linkedinUrl || "",
    };
    
    // Always add mentee fields regardless of user role
    // This ensures the fields are saved and available if user switches roles
    Object.assign(profileData, {
      learningGoals: body.learningGoals || "",
      skillLevel: body.skillLevel || "",
      areasOfInterest: body.areasOfInterest || "",
      learningStyle: body.learningStyle || "",
      careerGoals: body.careerGoals || "",
      currentChallenges: body.currentChallenges || "",
      education: body.education || "",
    });
    
    console.log("Profile data to save:", JSON.stringify(profileData, null, 2));
    
    // 3. Update or create the regular profile
    let profile;
    try {
      // First check if profile exists - without type assertion since Profile is in our schema
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: userId },
      });
      
      console.log("Existing profile found?", existingProfile ? "Yes" : "No");
      
      if (existingProfile) {
        // Update existing profile - without type assertion
        profile = await prisma.profile.update({
          where: { userId: userId },
          data: profileData,
        });
        console.log("Profile updated successfully");
      } else {
        // Create new profile - without type assertion
        profile = await prisma.profile.create({
          data: {
            userId: userId,
            ...profileData,
          },
        });
        console.log("New profile created successfully");
      }
      
      // Log the saved profile to verify data
      console.log("Saved profile data:", JSON.stringify(profile, null, 2));
    } catch (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile", details: (profileError as Error).message },
        { status: 500 }
      );
    }
    
    // 4. If user is a mentor, handle mentor profile separately
    let mentorProfile = null;
    if (isUserMentor) {
      try {
        // First check if mentor profile exists
        const existingMentorProfile = await prisma.mentorProfile.findUnique({
          where: { userId: userId },
        });
        
        // Parse yearsOfExperience
        let yearsOfExperience = body.yearsOfExperience;
        if (yearsOfExperience !== undefined) {
          if (typeof yearsOfExperience === 'string') {
            yearsOfExperience = parseInt(yearsOfExperience);
          }
          if (isNaN(yearsOfExperience)) {
            yearsOfExperience = 0;
          }
        }
        
        // Mentor-specific fields only
        const mentorProfileData = {
          title: body.title || "Mentor",
          bio: body.bio || "",
          company: body.company || "",
          // Map form field names to database field names
          github: body.githubUrl || "",
          linkedin: body.linkedinUrl || "",
          website: body.website || "",
          expertise: body.skills || [],
          skills: body.skills || [],
          hourlyRate: body.hourlyRate || 0,
          // Convert experience to string as required by the database schema
          experience: String(yearsOfExperience || 0),
        };
        
        if (existingMentorProfile) {
          // Update existing profile
          mentorProfile = await prisma.mentorProfile.update({
            where: { userId: userId },
            data: mentorProfileData,
          });
          console.log("Mentor profile updated successfully");
        } else {
          // Create new profile
          mentorProfile = await prisma.mentorProfile.create({
            data: {
              userId: userId,
              ...mentorProfileData,
              languages: ["English"], // Default value
              interests: [],
              goals: [],
            },
          });
          console.log("New mentor profile created successfully");
        }
        
        // Log the saved mentor profile
        console.log("Saved mentor profile data:", JSON.stringify(mentorProfile, null, 2));
      } catch (mentorError) {
        console.error("Error updating mentor profile:", mentorError);
      }
    }
    
    // Return success response with the updated profile data
    // Include all mentee fields in the response so the client has them
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
      profile: {
        ...profile,
        // Ensure these fields are always included in the response
        learningGoals: profile.learningGoals,
        skillLevel: profile.skillLevel,
        areasOfInterest: profile.areasOfInterest,
        learningStyle: profile.learningStyle,
        careerGoals: profile.careerGoals,
        currentChallenges: profile.currentChallenges,
        education: profile.education,
      },
      ...(mentorProfile && { mentorProfile }),
    });
  } catch (error) {
    console.error("Detailed error in profile PUT API:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update profile", details: (error as Error).message },
      { status: 500 }
    );
  }
} 