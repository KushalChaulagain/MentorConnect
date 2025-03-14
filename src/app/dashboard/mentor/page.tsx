import MentorDashboardClient from "@/components/mentor-dashboard-client";
import { getMentorStats, getRecentReviews, getRecentSessions } from "@/lib/api-services";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { Session as AuthSession } from "next-auth";

export const metadata: Metadata = {
  title: "Mentor Dashboard | MentorConnect",
  description: "Manage your mentoring activities, sessions, and mentees.",
};

export default async function MentorDashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not Authenticated</h1>
          <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }
  
  // Fetch all data in parallel
  const [stats, recentSessions, recentReviews] = await Promise.all([
    getMentorStats(),
    getRecentSessions(),
    getRecentReviews(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <MentorDashboardClient 
        initialStats={stats}
        initialSessions={recentSessions}
        initialReviews={recentReviews}
        session={session as AuthSession}
      />
    </div>
  );
} 