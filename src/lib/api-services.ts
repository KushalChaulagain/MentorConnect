import { prisma } from "@/lib/prisma";
import { auth } from "./auth";

// Fetch connections for the current user
export async function getConnections() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }
    
    // For mentee dashboard, we fetch connections where the user is the mentee
    const connections = await prisma.connection.findMany({
      where: {
        menteeId: session.user.id,
      },
      include: {
        mentor: {
          include: {
            mentorProfile: {
              select: {
                title: true,
                expertise: true,
                rating: true,
              },
            },
          },
        },
      },
    });
    
    return connections;
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
}

// Fetch top mentors
export async function getTopMentors() {
  try {
    // Get top rated mentors
    const topMentors = await prisma.mentorProfile.findMany({
      where: {
        // Remove isVerified as it doesn't exist in MentorProfile
      },
      orderBy: {
        rating: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return topMentors.map(mentor => ({
      id: mentor.id,
      userId: mentor.userId,
      title: mentor.title || "",
      expertise: mentor.expertise || [],
      rating: mentor.rating || 0,
      user: {
        name: mentor.user?.name || "",
        image: mentor.user?.image || "",
      },
    }));
  } catch (error) {
    console.error("Error fetching top mentors:", error);
    return [];
  }
}

// Fetch mentor stats
export async function getMentorStats() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        upcomingSessions: 0,
        totalStudents: 0,
        totalEarnings: 0,
        averageRating: 0,
        sessionsCompleted: 0,
        profileCompleteness: 0,
      };
    }
    
    // Profile completeness - fetch from profile API
    let profileCompleteness = 0;
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      });
      
      const mentorProfile = await prisma.mentorProfile.findUnique({
        where: { userId: session.user.id },
      });
      
      // Calculate completeness based on filled fields
      if (profile && mentorProfile) {
        const requiredFields = [
          !!profile.bio,
          !!mentorProfile.title,
          !!mentorProfile.expertise && mentorProfile.expertise.length > 0,
          !!mentorProfile.hourlyRate,
          !!mentorProfile.experience,
        ];
        
        profileCompleteness = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);
      }
    } catch (error) {
      console.error("Error fetching profile completeness:", error);
    }
    
    // Get mentor profile for associated queries
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!mentorProfile) {
      return {
        upcomingSessions: 0,
        totalStudents: 0,
        totalEarnings: 0,
        averageRating: 0,
        sessionsCompleted: 0,
        profileCompleteness,
      };
    }
    
    // Count upcoming sessions
    const upcomingSessions = await prisma.booking.count({
      where: {
        mentorProfileId: mentorProfile.id,
        status: "PENDING",
        startTime: {
          gte: new Date(),
        },
      },
    });
    
    // Count total students (mentees connected)
    const totalStudents = await prisma.connection.count({
      where: {
        mentorId: session.user.id,
        status: "ACCEPTED",
      },
    });
    
    // Count completed sessions
    const sessionsCompleted = await prisma.booking.count({
      where: {
        mentorProfileId: mentorProfile.id,
        status: "COMPLETED",
      },
    });
    
    // Calculate total earnings from completed sessions
    const totalEarnings = 0; // Replace with actual calculation once we know the correct field or calculation method
    
    // Get average rating
    const ratings = await prisma.mentorReview.aggregate({
      where: {
        mentorProfileId: mentorProfile.id,
      },
      _avg: {
        rating: true,
      },
    });
    
    const averageRating = ratings._avg?.rating || 0;
    
    return {
      upcomingSessions,
      totalStudents,
      totalEarnings,
      averageRating,
      sessionsCompleted,
      profileCompleteness,
    };
  } catch (error) {
    console.error("Error fetching mentor stats:", error);
    return {
      upcomingSessions: 0,
      totalStudents: 0,
      totalEarnings: 0,
      averageRating: 0,
      sessionsCompleted: 0,
      profileCompleteness: 0,
    };
  }
}

// Fetch recent sessions for a mentor
export async function getRecentSessions() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }
    
    // First get the mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!mentorProfile) {
      return [];
    }
    
    // Then get recent bookings for this mentor profile
    const recentBookings = await prisma.booking.findMany({
      where: {
        mentorProfileId: mentorProfile.id,
      },
      orderBy: {
        startTime: "desc",
      },
      take: 3,
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return recentBookings.map(booking => ({
      id: booking.id,
      title: "Mentoring Session", // Default title since Booking might not have a title field
      mentee: {
        name: booking.mentee?.name || "Mentee",
        image: booking.mentee?.image || "",
      },
      date: booking.startTime.toISOString().split("T")[0],
      time: booking.startTime.toTimeString().slice(0, 5),
      duration: Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60)),
      status: booking.status,
    }));
  } catch (error) {
    console.error("Error fetching recent sessions:", error);
    return [];
  }
}

// Fetch recent reviews for a mentor
export async function getRecentReviews() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }
    
    // First get the mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!mentorProfile) {
      return [];
    }
    
    const recentReviews = await prisma.mentorReview.findMany({
      where: {
        mentorProfileId: mentorProfile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return recentReviews.map(review => ({
      id: review.id,
      mentee: {
        name: review.author?.name || "Mentee",
        image: review.author?.image || "",
      },
      rating: review.rating,
      comment: review.comment || "",
      date: `${Math.floor((Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
    }));
  } catch (error) {
    console.error("Error fetching recent reviews:", error);
    return [];
  }
} 