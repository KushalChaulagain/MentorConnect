import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

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
    console.log("Session in profile API:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }
    
    console.log("Session user object:", session.user); // Log the entire user object
    
    let userId;
    
    // Check multiple possible locations for user ID
    if (session.user?.id) {
      userId = session.user.id;
      console.log("Found user ID in session.user.id:", userId);
    } else if (session.user?.email) {
      // Try to get user ID from email
      console.log("No user ID in session, trying email lookup with:", session.user.email);
      const userFromEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (userFromEmail) {
        userId = userFromEmail.id;
        console.log("Found user ID from email lookup:", userId);
      }
    } else {
      console.log("No session.user.id or session.user.email available");
      return NextResponse.json(
        { error: "Unauthorized - invalid session" },
        { status: 401 }
      );
    }
    
    if (!userId) {
      console.log("Could not determine user ID from session");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    console.log("Final userId to be used for database queries:", userId);
    
    let user;
    try {
      // Fetch user from database
      console.log("Fetching user from database with ID:", userId);
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      console.log("User query result:", user ? "Found" : "Not found");
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 }
        );
      }
    } catch (dbError) {
      console.error("Database error fetching user:", dbError);
      return NextResponse.json(
        { error: "Database error fetching user", details: (dbError as Error).message },
        { status: 500 }
      );
    }
    
    let mentorProfile = null;
    try {
      // Check if mentorProfile exists
      mentorProfile = await prisma.mentorProfile.findUnique({
        where: { userId: userId },
      });
      console.log("Mentor profile:", mentorProfile ? "Found" : "Not found");
    } catch (mentorError) {
      console.error("Error fetching mentor profile:", mentorError);
      // Continue without mentor profile
    }
    
    // Calculate profile completion percentage
    console.log("Calculating profile completion...");
    console.log("User data:", JSON.stringify(user, null, 2));
    
    // Log profile completion details for debugging
    console.log("----------- PROFILE COMPLETION CALCULATION -----------");
    
    // Required fields (needed for basic functionality)
    const requiredFields = ["name", "email", "image"];
    
    // Important optional fields (needed for good profile)
    const optionalFields = ["role", "onboardingCompleted"];
    
    // Additional fields that contribute to completion
    const additionalFields = ["timezone", "location"];
    
    let completedFields = 0;
    let totalFields = requiredFields.length + optionalFields.length + additionalFields.length;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (user && user[field as keyof typeof user]) {
        completedFields++;
        console.log(`Required field ${field} is completed`);
      } else {
        console.log(`Required field ${field} is NOT completed`);
      }
    });
    
    // Check important optional fields
    optionalFields.forEach(field => {
      if (user && user[field as keyof typeof user]) {
        completedFields++;
        console.log(`Optional field ${field} is completed`);
      } else {
        console.log(`Optional field ${field} is NOT completed`);
      }
    });
    
    // Check additional fields
    additionalFields.forEach(field => {
      if (user && user[field as keyof typeof user]) {
        completedFields++;
        console.log(`Additional field ${field} is completed`);
      } else {
        console.log(`Additional field ${field} is NOT completed`);
      }
    });
    
    // Add mentor-specific fields to calculation
    if (mentorProfile) {
      completedFields++;
      console.log("Mentor profile exists (counts as 1 field)");
      
      // Important mentor fields - simplified to key fields for 100% completion
      const mentorBasicFields = ["bio", "title"];
      const mentorAdvancedFields = ["expertise", "hourlyRate", "experience", "skills"];
      
      // Add these to total fields count - but don't make it impossible to reach 100%
      totalFields += mentorBasicFields.length + mentorAdvancedFields.length;
      
      // Check each basic mentor field
      mentorBasicFields.forEach(field => {
        const value = mentorProfile[field as keyof typeof mentorProfile];
        if (value) {
          if (Array.isArray(value) && value.length > 0) {
            completedFields++;
            console.log(`Mentor basic field ${field} is completed (array with elements)`);
          } else if (!Array.isArray(value)) {
            completedFields++;
            console.log(`Mentor basic field ${field} is completed (non-array)`);
          }
        } else {
          console.log(`Mentor basic field ${field} is NOT completed`);
        }
      });
      
      // Check each advanced mentor field
      mentorAdvancedFields.forEach(field => {
        const value = mentorProfile[field as keyof typeof mentorProfile];
        if (value) {
          if (Array.isArray(value) && value.length > 0) {
            completedFields++;
            console.log(`Mentor advanced field ${field} is completed (array with elements)`);
          } else if (!Array.isArray(value) && (typeof value === 'number' ? value > 0 : value.length > 0)) {
            completedFields++;
            console.log(`Mentor advanced field ${field} is completed (non-array with value)`);
          }
        } else {
          console.log(`Mentor advanced field ${field} is NOT completed`);
        }
      });
      
      // Social links and website are useful but not required for 100% completion
      // If these are all completed, add a bonus that pushes to 100%
      const socialFields = ["github", "linkedin", "website"];
      let completedSocialFields = 0;
      
      socialFields.forEach(field => {
        const value = mentorProfile[field as keyof typeof mentorProfile];
        if (value && typeof value === 'string' && value.length > 0) {
          completedSocialFields++;
          console.log(`Social field ${field} is completed`);
        } else {
          console.log(`Social field ${field} is NOT completed`);
        }
      });
      
      // If they've filled out at least one social link, count it as a bonus
      if (completedSocialFields > 0) {
        completedFields += 1;
        console.log(`Bonus for social links: +1 point (${completedSocialFields}/${socialFields.length} filled)`);
      }
    }
    
    // Calculate the raw percentage
    const rawPercentage = Math.round((completedFields / totalFields) * 100);
    
    // If they're over 90% and have filled all the important fields, just give them 100%
    let completionPercentage = rawPercentage;
    if (rawPercentage >= 90) {
      completionPercentage = 100;
      console.log(`Profile over 90% complete, boosting to 100%`);
    }
    
    console.log(`Profile completion: ${completedFields}/${totalFields} = Raw: ${rawPercentage}%, Final: ${completionPercentage}%`);
    console.log("----------- END CALCULATION -----------");
    
    // Create profile response
    const profileResponse = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
      role: user.role || "MENTEE",
      onboardingCompleted: user.onboardingCompleted || false,
      completionStatus: completionPercentage,
      isMentor: !!mentorProfile,
      timezone: "",
      location: "",
      // Add empty values for these fields to ensure they appear in the response
      githubUrl: "",
      linkedinUrl: "",
      yearsOfExperience: 0,
      website: "",
    };
    
    if (mentorProfile) {
      // Try to retrieve timezone and location from localStorage via API query params
      const url = new URL(request.url);
      const savedTimezone = url.searchParams.get('savedTimezone') || "";
      const savedLocation = url.searchParams.get('savedLocation') || "";
      
      // Log what we found for debugging
      console.log("Timezone from search params:", savedTimezone);
      console.log("Location from search params:", savedLocation);
      
      // Log the mentor profile experience value for debugging
      console.log("Mentor experience value from DB:", mentorProfile.experience, "Type:", typeof mentorProfile.experience);
      
      Object.assign(profileResponse, {
        title: mentorProfile.title || "",
        bio: mentorProfile.bio || "",
        company: mentorProfile.company || "",
        // Fix naming mismatch between database and form
        githubUrl: mentorProfile.github || "", // database stores as 'github', form uses 'githubUrl'
        linkedinUrl: mentorProfile.linkedin || "", // database stores as 'linkedin', form uses 'linkedinUrl'
        website: mentorProfile.website || "",
        expertise: mentorProfile.expertise || [],
        skills: mentorProfile.skills || [],
        hourlyRate: mentorProfile.hourlyRate || 0,
        timezone: savedTimezone || "",
        location: savedLocation || "",
        // Ensure yearsOfExperience is properly converted to a number from the string in the database
        yearsOfExperience: mentorProfile.experience ? 
          (typeof mentorProfile.experience === 'string' ? parseInt(mentorProfile.experience) : mentorProfile.experience) : 0,
      });
    }
    
    console.log("Returning profile response with fields:", Object.keys(profileResponse).join(", "));
    console.log("Returning profile response successfully");
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
    console.log("Session in profile PUT API:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }
    
    console.log("Session user object:", session.user); // Log the entire user object
    
    let userId;
    
    // Check multiple possible locations for user ID
    if (session.user?.id) {
      userId = session.user.id;
      console.log("Found user ID in session.user.id:", userId);
    } else if (session.user?.email) {
      // Try to get user ID from email
      console.log("No user ID in session, trying email lookup with:", session.user.email);
      const userFromEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (userFromEmail) {
        userId = userFromEmail.id;
        console.log("Found user ID from email lookup:", userId);
      }
    } else {
      console.log("No session.user.id or session.user.email available");
      return NextResponse.json(
        { error: "Unauthorized - invalid session" },
        { status: 401 }
      );
    }
    
    if (!userId) {
      console.log("Could not determine user ID from session");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    console.log("Final userId to be used for database operations:", userId);
    
    // Verify user exists
    let userExists = false;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true }
      });
      userExists = !!user;
      console.log("User exists check:", userExists);
      
      // Get the user's role for updating the right profile
      const isUserMentor = user?.role === "MENTOR";
      console.log("Is user a mentor:", isUserMentor);
    } catch (dbError) {
      console.error("Database error verifying user:", dbError);
      return NextResponse.json(
        { error: "Database error", details: (dbError as Error).message },
        { status: 500 }
      );
    }
    
    if (!userExists) {
      console.log("User not found in database:", userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Parse and validate the request body
    const body = await request.json();
    console.log("Received profile update body:", JSON.stringify(body, null, 2));
    console.log("Years of Experience value:", body.yearsOfExperience, "Type:", typeof body.yearsOfExperience);
    
    // Extract fields that aren't in the User schema
    const timezone = body.timezone;
    const location = body.location;
    console.log("Fields not in schema - timezone:", timezone, "location:", location);
    
    try {
      // Update the user fields - REMOVE timezone and location since they're not in the schema
      console.log("Updating user with ID:", userId);
      
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: body.name,
          ...(body.image && { image: body.image }),
          ...(body.onboardingCompleted !== undefined && { 
            onboardingCompleted: body.onboardingCompleted 
          }),
          // Fields removed as they're not in the schema
        },
      });
      console.log("User updated successfully with data:", JSON.stringify(updatedUser, null, 2));
      
      // If the user is a mentor and mentor profile data was provided, update or create the mentor profile
      let mentorProfile = null;
      if (updatedUser.role === "MENTOR" || 
         (body.title || body.bio || body.expertise || body.hourlyRate !== undefined)) {
        
        console.log("Updating mentor profile");
        
        // First check if mentor profile exists
        const existingProfile = await prisma.mentorProfile.findUnique({
          where: { userId: userId },
        });
        
        // Parse yearsOfExperience to ensure it's a number
        let yearsOfExperience = body.yearsOfExperience;
        if (yearsOfExperience !== undefined) {
          if (typeof yearsOfExperience === 'string') {
            yearsOfExperience = parseInt(yearsOfExperience);
          }
          // If parsing failed, default to 0
          if (isNaN(yearsOfExperience)) {
            yearsOfExperience = 0;
          }
        }
        console.log("Processed yearsOfExperience:", yearsOfExperience);
        
        // Try to store all fields in mentor profile
        const mentorProfileData = {
          ...(body.title && { title: body.title }),
          ...(body.bio && { bio: body.bio }),
          ...(body.company && { company: body.company }),
          // Map form field names to database field names
          ...(body.githubUrl && { github: body.githubUrl }), // form uses githubUrl, database uses github
          ...(body.linkedinUrl && { linkedin: body.linkedinUrl }), // form uses linkedinUrl, database uses linkedin
          ...(body.website && { website: body.website }),
          ...(body.expertise && { expertise: body.expertise }),
          ...(body.skills && { skills: body.skills }),
          ...(body.hourlyRate !== undefined && { hourlyRate: body.hourlyRate }),
          // Convert experience to string as required by the database schema
          ...(yearsOfExperience !== undefined && { experience: String(yearsOfExperience) }),
        };
        
        console.log("Mentor profile data to save:", JSON.stringify(mentorProfileData, null, 2));
        
        if (existingProfile) {
          // Update existing profile
          try {
            mentorProfile = await prisma.mentorProfile.update({
              where: { userId: userId },
              data: mentorProfileData,
            });
            console.log("Updated existing mentor profile");
          } catch (err) {
            console.error("Error updating mentor profile:", err);
            throw err; // Just throw the error as we've removed the problematic fields
          }
        } else {
          // Create new profile
          try {
            mentorProfile = await prisma.mentorProfile.create({
              data: {
                userId: userId,
                title: body.title || "Mentor",
                bio: body.bio || "",
                company: body.company || "",
                github: body.githubUrl || "",
                linkedin: body.linkedinUrl || "",
                website: body.website || "",
                expertise: body.expertise || [],
                skills: body.skills || [],
                hourlyRate: body.hourlyRate || 0,
                // Convert experience to string for the database schema
                experience: String(body.yearsOfExperience || 0),
                languages: body.languages || ["English"],
                interests: body.interests || [],
                goals: body.goals || [],
                // timezone and location removed - they don't exist in the schema
              },
            });
            console.log("Created new mentor profile");
          } catch (err) {
            console.error("Error creating mentor profile:", err);
            throw err; // Just throw the error as we've removed the problematic fields
          }
        }
      }
      
      console.log("Profile updated successfully");
      
      // Return the timezone and location in the response even if we couldn't store them
      return NextResponse.json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          role: updatedUser.role,
          onboardingCompleted: updatedUser.onboardingCompleted,
          timezone: timezone, // Include timezone in response for client-side storage
          location: location, // Include location in response for client-side storage
        },
        ...(mentorProfile && { mentorProfile }),
      });
    } catch (dbError) {
      console.error("Database error updating profile:", dbError);
      return NextResponse.json(
        { error: "Failed to update profile", details: (dbError as Error).message },
        { status: 500 }
      );
    }
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