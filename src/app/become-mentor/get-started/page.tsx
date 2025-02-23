"use client"

import MentorProfileSetup from "@/components/MentorProfile/MentorProfileSetup"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MentorOnboardingPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    const initializeMentorRole = async () => {
      if (session?.user && session.user.role === "MENTEE") {
        // Update user role to MENTOR
        try {
          const response = await fetch("/api/user/role", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: "MENTOR" }),
          });

          if (response.ok) {
            // Update session with new role
            await update({
              ...session,
              user: {
                ...session.user,
                role: "MENTOR",
              },
            });
          }
        } catch (error) {
          console.error("Failed to update role:", error);
          router.push("/dashboard/mentee");
        }
      }
    };

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role === "MENTOR" && session?.user?.onboardingCompleted) {
      router.push("/dashboard/mentor");
    } else if (status === "authenticated") {
      initializeMentorRole();
    }
  }, [session, router, status, update]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <MentorProfileSetup />;
}

