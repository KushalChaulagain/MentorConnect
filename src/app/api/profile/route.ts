import { authOptions } from "@/lib/auth-config";
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Create a new PrismaClient instance if it doesn't exist in global scope
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Define the schema for profile updates
const profileSchema = z.object({
  name: z.string().optional().default(""),
  title: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  location: z.string().optional().default(""),
  company: z.string().optional().default(""),
  website: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  timezone: z.string().optional().default(""),
  yearsOfExperience: z.number().optional().default(0),
  hourlyRate: z.number().optional().default(0),
  skills: z.array(z.string()).optional().default([]),
  image: z.string().optional(),
  learningGoals: z.string().optional().default(""),
  skillLevel: z.string().optional().default(""),
  areasOfInterest: z.string().optional().default(""),
  learningStyle: z.string().optional().default(""),
  careerGoals: z.string().optional().default(""),
  currentChallenges: z.string().optional().default(""),
  education: z.string().optional().default(""),
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
    
    // Calculate completion status for the frontend
    let completionStatus = 80; // Base status (user exists with name, email, etc.)
    
    // For mentees, check specific profile fields
    if (user.role === "MENTEE" && userProfile) {
      console.log("Calculating completion status for MENTEE");
      
      // Define critical fields that should be filled for mentees - company is not required for mentees
      const criticalFields = [
        { name: "title", value: userProfile.title, minLength: 1 },
        { name: "bio", value: userProfile.bio, minLength: 25 },
        { name: "learningGoals", value: userProfile.learningGoals, minLength: 1 },
        { name: "skillLevel", value: userProfile.skillLevel, minLength: 1 },  
        { name: "areasOfInterest", value: userProfile.areasOfInterest, minLength: 1 },
        { name: "learningStyle", value: userProfile.learningStyle, minLength: 1 },
        { name: "careerGoals", value: userProfile.careerGoals, minLength: 1 },
        { name: "currentChallenges", value: userProfile.currentChallenges, minLength: 1 },
        { name: "education", value: userProfile.education, minLength: 1 },
        { name: "githubUrl", value: userProfile.githubUrl, minLength: 1 }
      ];
      
      // Calculate how many critical fields are properly filled
      const filledFieldsCount = criticalFields.filter(
        field => !!field.value && field.value.length >= field.minLength
      ).length;
      
      // Calculate percentage based on critical fields
      const percentage = Math.min(
        80 + (filledFieldsCount / criticalFields.length) * 20,
        100
      );
      
      completionStatus = Math.round(percentage);
      console.log(`MENTEE completion status: ${completionStatus}% (${filledFieldsCount}/${criticalFields.length} fields filled)`);
    }
    // For mentors, check mentor-specific fields
    else if (user.role === "MENTOR") {
      console.log("Calculating completion status for MENTOR");
      
      // Define critical fields that should be filled for mentors
      const mentorCriticalFields = [
        { name: "title", value: userProfile?.title, minLength: 1 },
        { name: "bio", value: userProfile?.bio, minLength: 50 }, // Require more substantial bio for mentors
        { name: "location", value: userProfile?.location, minLength: 1 },
        { name: "company", value: userProfile?.company, minLength: 1 },
        { name: "githubUrl", value: userProfile?.githubUrl || mentorProfile?.github, minLength: 5 },
        { name: "linkedinUrl", value: userProfile?.linkedinUrl || mentorProfile?.linkedin, minLength: 5 },
        { name: "skills", value: mentorProfile?.skills?.length ? "has-skills" : "", minLength: 1, 
          customCheck: () => (mentorProfile?.skills?.length || 0) >= 3 }, // At least 3 skills required
        { name: "hourlyRate", customCheck: () => (mentorProfile?.hourlyRate || 0) >= 10 } // Require minimum hourly rate
      ];
      
      // Log all fields for debugging
      mentorCriticalFields.forEach(field => {
        if (field.customCheck) {
          console.log(`Field ${field.name}: ${field.customCheck() ? "PASS" : "FAIL"} (custom check)`);
        } else {
          const value = typeof field.value === 'string' ? field.value : JSON.stringify(field.value);
          console.log(`Field ${field.name}: ${value ? `"${value}"` : "undefined or null"}, meets criteria: ${!!field.value && field.value.length >= (field.minLength || 1)}`);
        }
      });
      
      // Calculate how many critical fields are properly filled
      const filledFieldsCount = mentorCriticalFields.filter(field => {
        if (field.customCheck) return field.customCheck();
        return !!field.value && field.value.length >= (field.minLength || 1);
      }).length;
      
      // Calculate percentage based on critical fields (80% base + 20% for fields)
      const percentage = Math.min(
        80 + (filledFieldsCount / mentorCriticalFields.length) * 20,
        100
      );
      
      completionStatus = Math.round(percentage);
      console.log(`MENTOR completion status: ${completionStatus}% (${filledFieldsCount}/${mentorCriticalFields.length} fields filled)`);
    }
    
    // Set final completion status
    profileResponse.completionStatus = completionStatus;
    
    console.log(`Final profile status: ${completionStatus}%`);
    
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
  console.log("Profile API PUT request received");
  
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
      console.error("User ID not found in session or database");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Verify user exists and get role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });
    
    if (!user) {
      console.error("User not found in database, userId:", userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const isUserMentor = user.role === "MENTOR";
    
    // Parse the request body - handle JSON carefully
    let body: any = {};
    try {
      const requestText = await request.text();
      
      try {
        body = JSON.parse(requestText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }
    } catch (bodyError) {
      console.error("Error reading request body:", bodyError);
      return NextResponse.json(
        { error: "Could not read request body" },
        { status: 400 }
      );
    }
    
    // Validate the body against our schema
    try {
      const validatedData = profileSchema.parse(body);
      body = validatedData;
    } catch (validationError) {
      console.error("Validation error:", validationError);
      // Continue anyway with the original body to ensure backward compatibility
    }
    
    // 1. Update user basic info - DO NOT set onboardingCompleted yet
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        ...(body.image && { image: body.image }),
        // For mentees, we'll set this after evaluating profile completeness
        // Don't automatically set onboardingCompleted here
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
    
    // 3. Update or create the regular profile
    let profile;
    try {
      // First check if profile exists
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: userId },
      });
      
      if (existingProfile) {
        // Update existing profile
        profile = await prisma.profile.update({
          where: { userId: userId },
          data: profileData,
        });
      } else {
        // Create new profile
        try {
          profile = await prisma.profile.create({
            data: {
              userId: userId,
              ...profileData,
            },
          });
        } catch (createError) {
          console.error("Error creating profile:", createError);
          // Try a more direct approach to create the profile with type-safe values
          const menteeData = profileData as any; // Cast to any to access potential mentee fields
          
          const createAttempt = await prisma.$executeRaw`
            INSERT INTO "Profile" ("id", "userId", "title", "bio", "location", "company", "website", 
                                "githubUrl", "linkedinUrl", "timezone", "learningGoals", "skillLevel",
                                "areasOfInterest", "learningStyle", "careerGoals", "currentChallenges",
                                "education", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${userId}, ${menteeData.title || ''}, ${menteeData.bio || ''}, 
                    ${menteeData.location || ''}, ${menteeData.company || ''}, ${menteeData.website || ''},
                    ${menteeData.githubUrl || ''}, ${menteeData.linkedinUrl || ''}, ${menteeData.timezone || ''},
                    ${menteeData.learningGoals || ''}, ${menteeData.skillLevel || ''}, ${menteeData.areasOfInterest || ''},
                    ${menteeData.learningStyle || ''}, ${menteeData.careerGoals || ''}, ${menteeData.currentChallenges || ''},
                    ${menteeData.education || ''}, NOW(), NOW());
          `;
          
          // Fetch the newly created profile
          profile = await prisma.profile.findUnique({
            where: { userId: userId },
          });
        }
      }
      
      if (!profile) {
        console.error("Failed to save profile - profile is null after operations");
      }
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
          bio: body.bio || "Bio information pending...",
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
        }
      } catch (mentorError) {
        console.error("Error updating mentor profile:", mentorError);
      }
    }
    
    // After profile creation/update, check if mentee profile is complete 
    let isProfileComplete = false;
    
    // Now check if the profile is complete for mentee users
    if (user.role === "MENTEE" && profile) {
      // Define critical fields that should be filled for mentees
      // Company is not required for mentees - only for mentors
      const criticalFields = [
        { name: "title", value: profile.title, minLength: 1 },
        { name: "bio", value: profile.bio, minLength: 25 },
        { name: "learningGoals", value: profile.learningGoals, minLength: 1 },
        { name: "skillLevel", value: profile.skillLevel, minLength: 1 },  
        { name: "areasOfInterest", value: profile.areasOfInterest, minLength: 1 },
        { name: "learningStyle", value: profile.learningStyle, minLength: 1 },
        { name: "careerGoals", value: profile.careerGoals, minLength: 1 },
        { name: "currentChallenges", value: profile.currentChallenges, minLength: 1 },
        { name: "education", value: profile.education, minLength: 1 },
        { name: "githubUrl", value: profile.githubUrl, minLength: 1 }
      ];
      
      // Calculate how many critical fields are properly filled
      const filledFieldsCount = criticalFields.filter(
        field => !!field.value && field.value.length >= field.minLength
      ).length;
      
      // Calculate percentage based on critical fields
      const percentComplete = filledFieldsCount / criticalFields.length * 100;
      
      // Consider profile complete if at least 90% of fields are filled
      isProfileComplete = percentComplete >= 90;
      
      // Update onboardingCompleted status based on profile completeness
      if (isProfileComplete) {
        await prisma.user.update({
          where: { id: userId },
          data: { onboardingCompleted: true },
        });
      }
    }
    // For mentors, check mentor-specific criteria
    else if (user.role === "MENTOR" && profile) {
      // Define critical fields that should be filled for mentors
      const mentorCriticalFields = [
        { name: "title", value: profile.title, minLength: 1 },
        { name: "bio", value: profile.bio, minLength: 50 }, // Require more substantial bio for mentors
        { name: "location", value: profile.location, minLength: 1 },
        { name: "company", value: profile.company, minLength: 1 },
        { name: "githubUrl", value: profile.githubUrl || mentorProfile?.github, minLength: 5 },
        { name: "linkedinUrl", value: profile.linkedinUrl || mentorProfile?.linkedin, minLength: 5 },
        { name: "skills", customCheck: () => (mentorProfile?.skills?.length || 0) >= 3 }, // At least 3 skills
        { name: "hourlyRate", customCheck: () => (mentorProfile?.hourlyRate || 0) >= 10 } // Minimum rate
      ];
      
      // Calculate how many critical fields are properly filled
      const filledFieldsCount = mentorCriticalFields.filter(field => {
        if (field.customCheck) return field.customCheck();
        return !!field.value && field.value.length >= (field.minLength || 1);
      }).length;
      
      // Calculate percentage based on critical fields
      const percentComplete = filledFieldsCount / mentorCriticalFields.length * 100;
      
      // Consider profile complete if at least 90% of fields are filled
      isProfileComplete = percentComplete >= 90;
      
      console.log(`MENTOR profile completion during update: ${Math.round(percentComplete)}% (${filledFieldsCount}/${mentorCriticalFields.length} fields filled)`);
      
      // Update onboardingCompleted status based on profile completeness
      if (isProfileComplete) {
        await prisma.user.update({
          where: { id: userId },
          data: { onboardingCompleted: true },
        });
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
      profile: profile ? {
        ...profile,
        // Ensure these fields are always included in the response
        learningGoals: profile.learningGoals || "",
        skillLevel: profile.skillLevel || "",
        areasOfInterest: profile.areasOfInterest || "",
        learningStyle: profile.learningStyle || "",
        careerGoals: profile.careerGoals || "",
        currentChallenges: profile.currentChallenges || "",
        education: profile.education || "",
      } : null,
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