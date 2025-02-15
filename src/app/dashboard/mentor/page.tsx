'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Star, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function MentorDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative p-8 rounded-lg bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#0ea5e9)] opacity-20 rounded-lg"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="mt-2 text-indigo-100">
                Here's an overview of your mentorship activities.
              </p>
            </div>
            <div className="hidden md:block w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/mentor/sessions" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                View all sessions
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/mentor/students" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                View all students
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. 0</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/mentor/earnings" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                View earnings details
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/mentor/reviews" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                View all reviews
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No recent sessions found.
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Latest Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No reviews yet.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 