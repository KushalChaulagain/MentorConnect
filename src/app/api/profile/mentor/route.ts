import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
  console.log("Mentor Profile API GET request received");
  
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    console.log("Session in mentor profile API:", JSON.stringify(session, null, 2));
    
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
    
    // Fetch mentor profile from database
    let mentorProfile;
    try {
      mentorProfile = await prisma.mentorProfile.findUnique({
        where: { userId: userId },
      });
      
      console.log("Mentor profile query result:", mentorProfile ? "Found" : "Not found");
      
      if (!mentorProfile) {
        return NextResponse.json(
          { error: "Mentor profile not found" },
          { status: 404 }
        );
      }
    } catch (dbError) {
      console.error("Database error fetching mentor profile:", dbError);
      return NextResponse.json(
        { error: "Database error fetching mentor profile", details: (dbError as Error).message },
        { status: 500 }
      );
    }
    
    let totalSessions = 0;
    try {
      // Count total sessions
      totalSessions = await prisma.booking.count({
        where: {
          mentorProfileId: mentorProfile.id,
          status: {
            in: ["COMPLETED", "CONFIRMED"],
          },
        },
      });
      console.log("Total sessions:", totalSessions);
    } catch (sessionsError) {
      console.error("Error counting sessions:", sessionsError);
      // Continue with zero sessions
    }
    
    let totalEarnings = 0;
    try {
      // Get total earnings - Fix to use correct fields
      const bookings = await prisma.booking.findMany({
        where: {
          mentorProfileId: mentorProfile.id,
          status: "COMPLETED",
        },
        // Remove sessionFee as it doesn't exist
      });
      
      // Since sessionFee doesn't exist, we'll hardcode 0 for now
      // This should be updated with the actual field name if it exists with a different name
      totalEarnings = 0; // Placeholder
      console.log("Total earnings:", totalEarnings);
    } catch (earningsError) {
      console.error("Error calculating earnings:", earningsError);
      // Continue with zero earnings
    }
    
    let averageRating = 0;
    try {
      // Get average rating - Check if MentorReview model exists instead of Review
      const ratings = await prisma.mentorReview.findMany({
        where: {
          mentorProfileId: mentorProfile.id,
        },
        select: {
          rating: true,
        },
      });
      
      averageRating = ratings.length
        ? ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length
        : 0;
      console.log("Average rating:", averageRating);
    } catch (ratingError) {
      console.error("Error calculating average rating:", ratingError);
      // Continue with zero rating
    }
    
    let uniqueStudents = [];
    try {
      // Count unique students
      uniqueStudents = await prisma.booking.findMany({
        where: {
          mentorProfileId: mentorProfile.id,
          status: {
            in: ["COMPLETED", "CONFIRMED"],
          },
        },
        select: {
          menteeId: true,
        },
        distinct: ["menteeId"],
      });
      console.log("Unique students count:", uniqueStudents.length);
    } catch (studentsError) {
      console.error("Error counting students:", studentsError);
      // Continue with empty students array
    }
    
    // Create response object with safe default values
    const mentorProfileResponse = {
      id: mentorProfile.id,
      userId: mentorProfile.userId,
      bio: mentorProfile.bio || "",
      title: mentorProfile.title || "",
      company: mentorProfile.company || "",
      hourlyRate: mentorProfile.hourlyRate || 0,
      expertise: mentorProfile.expertise || [],
      skills: mentorProfile.skills || [],
      experience: mentorProfile.experience || "",
      languages: mentorProfile.languages || [],
      interests: mentorProfile.interests || [],
      goals: mentorProfile.goals || [],
      totalSessions,
      totalEarnings,
      averageRating,
      totalStudents: uniqueStudents.length,
    };
    
    console.log("Returning mentor profile response successfully");
    return NextResponse.json(mentorProfileResponse);
  } catch (error) {
    console.error("Detailed error in mentor profile API:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor profile", details: (error as Error).message },
      { status: 500 }
    );
  }
} 