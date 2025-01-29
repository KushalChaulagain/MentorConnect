"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Briefcase, ChevronRight, Code, MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function MenteeDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login")
    },
  })

  // Redirect if user is a mentor
  if (session?.user?.role === "MENTOR") {
    redirect("/dashboard/mentor")
  }

  // Redirect if user is not a mentee
  if (session?.user?.role !== "MENTEE") {
    redirect("/dashboard/mentor")
  }

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0B1121] text-white p-8 space-y-5">
        {/* Header Section */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Get Started</h1>
          <p className="mt-2 text-gray-400">Welcome back, {session.user.name}</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Get live help */}
          <Link href="/dashboard/find-mentors" className="group">
            <Card className="bg-[#151D2D] border-none h-full transition-all duration-200 hover:bg-[#1A2333]">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle>Get live help</CardTitle>
                    <p className="text-sm text-gray-400">1:1 mentorship session</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                  Find a mentor
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Get freelance help */}
          <Link href="/dashboard/freelance" className="group">
            <Card className="bg-[#151D2D] border-none h-full transition-all duration-200 hover:bg-[#1A2333]">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle>Get freelance help</CardTitle>
                    <p className="text-sm text-gray-400">Pay with escrow</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                  Post a job
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Get code reviewed */}
          <Link href="/dashboard/code-review" className="group">
            <Card className="bg-[#151D2D] border-none h-full transition-all duration-200 hover:bg-[#1A2333]">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Code className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle>Get code reviewed</CardTitle>
                    <p className="text-sm text-gray-400">Pay with escrow</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                  Request review
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Find Mentors Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Find Mentors</h2>
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10" asChild>
              <Link href="/dashboard/find-mentors" className="flex items-center">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/mentors/john-doe" className="group">
              <Card className="bg-[#151D2D] border-none transition-all duration-200 hover:bg-[#1A2333]">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-white/10">
                      <AvatarImage src="https://ui-avatars.com/api/?name=John+Doe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">John Doe</h3>
                      <p className="text-sm text-gray-400">Senior Software Engineer</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">Full-stack development, React, Node.js</p>
                  <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                    View profile
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

