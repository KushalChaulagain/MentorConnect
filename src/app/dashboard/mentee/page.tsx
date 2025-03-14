import MenteeDashboardClient from "@/components/mentee-dashboard-client";
import { getConnections, getTopMentors } from "@/lib/api-services";
import { auth } from "@/lib/auth";
import { Connection } from "@prisma/client";
import { Metadata } from "next";
import { Session as AuthSession } from "next-auth";

export const metadata: Metadata = {
  title: "Mentee Dashboard | MentorConnect",
  description: "Connect with professional mentors and manage your learning journey.",
};

export default async function MenteeDashboardPage() {
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
  const [connections, topMentors] = await Promise.all([
    getConnections(),
    getTopMentors(),
  ]);
  
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <MenteeDashboardClient 
        initialConnections={connections as Connection[]}
        initialTopMentors={topMentors}
        session={session as AuthSession}
      />
    </div>
  );
}

