"use client"

import MentorProfileSetup from "@/components/MentorProfile/MentorProfileSetup"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export default function MentorOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.role === "MENTOR" && (session?.user as any)?.onboardingCompleted) {
      router.push("/dashboard/mentor")
    } else if (session?.user?.role === "MENTEE") {
      router.push("/role-selection")
    }
  }, [session, router, status])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return <MentorProfileSetup />
}

