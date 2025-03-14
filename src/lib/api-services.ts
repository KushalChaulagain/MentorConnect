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
        isVerified: true,
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
        name: mentor.user.name || "",
        image: mentor.user.image || "",
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
    
    // Count upcoming sessions
    const upcomingSessions = await prisma.session.count({
      where: {
        mentorId: session.user.id,
        status: "SCHEDULED",
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
    const sessionsCompleted = await prisma.session.count({
      where: {
        mentorId: session.user.id,
        status: "COMPLETED",
      },
    });
    
    // Calculate total earnings from completed sessions
    const earnings = await prisma.session.aggregate({
      where: {
        mentorId: session.user.id,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });
    
    const totalEarnings = earnings._sum.amount || 0;
    
    // Get average rating
    const ratings = await prisma.review.aggregate({
      where: {
        mentorId: session.user.id,
      },
      _avg: {
        rating: true,
      },
    });
    
    const averageRating = ratings._avg.rating || 0;
    
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
    
    const recentSessions = await prisma.session.findMany({
      where: {
        mentorId: session.user.id,
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
    
    return recentSessions.map(session => ({
      id: session.id,
      title: session.title || "Mentoring Session",
      mentee: {
        name: session.mentee.name || "Mentee",
        image: session.mentee.image || "",
      },
      date: session.startTime.toISOString().split("T")[0],
      time: session.startTime.toTimeString().slice(0, 5),
      duration: session.duration || 60,
      status: session.status || "SCHEDULED",
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
    
    const recentReviews = await prisma.review.findMany({
      where: {
        mentorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
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
    
    return recentReviews.map(review => ({
      id: review.id,
      mentee: {
        name: review.mentee.name || "Mentee",
        image: review.mentee.image || "",
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