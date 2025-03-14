"use client";

import { TabsNav } from "@/components/tabs-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  CalendarCheck,
  DollarSign,
  MessageSquare,
  Star,
  UserCheck
} from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { useState } from "react";

// Temporary component until we build the actual one
function ConnectionNotifications() {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="rounded-full hover:scale-105 transition-transform duration-300 bg-opacity-20 bg-gradient-to-r from-indigo-500 to-indigo-600"
    >
      <Bell className="h-4 w-4 text-indigo-200" />
    </Button>
  );
}

type MentorStats = {
  upcomingSessions: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
  sessionsCompleted: number;
  profileCompleteness: number;
};

type MentorSession = {
  id: string;
  title: string;
  mentee: {
    name: string;
    image: string;
  };
  date: string;
  time: string;
  duration: number;
  status: string;
};

type Review = {
  id: string;
  mentee: {
    name: string;
    image: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export default function MentorDashboardClient({ 
  initialStats, 
  initialSessions, 
  initialReviews,
  session 
}: { 
  initialStats: MentorStats; 
  initialSessions: MentorSession[];
  initialReviews: Review[];
  session: Session | null;
}) {
  const [stats] = useState<MentorStats>(initialStats);
  const [recentSessions] = useState<MentorSession[]>(initialSessions);
  const [recentReviews] = useState<Review[]>(initialReviews);
  
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white">
            Welcome back, <span className="font-semibold text-[#00C6FF]">{session?.user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-[16px] leading-relaxed">
            Here's what's happening with your mentoring
          </p>
        </div>
        <ConnectionNotifications />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#111218] border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-md">
          <div className="absolute h-1 w-full bg-gradient-to-r from-indigo-600 to-blue-400 top-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Upcoming Sessions</CardTitle>
            <div className="rounded-full bg-[#3949AB]/10 p-2">
              <Calendar className="h-4 w-4 text-[#00C6FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.upcomingSessions}</div>
            <p className="text-xs text-[#E0E0E0] mt-1">
              {stats.upcomingSessions === 0 
                ? "No upcoming sessions" 
                : stats.upcomingSessions === 1 
                  ? "1 session scheduled" 
                  : `${stats.upcomingSessions} sessions scheduled`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111218] border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-md">
          <div className="absolute h-1 w-full bg-gradient-to-r from-blue-400 to-cyan-400 top-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
            <div className="rounded-full bg-[#3949AB]/10 p-2">
              <UserCheck className="h-4 w-4 text-[#00C6FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
            <p className="text-xs text-[#E0E0E0] mt-1">
              {stats.totalStudents === 0 
                ? "No students yet" 
                : stats.totalStudents === 1 
                  ? "1 connected mentee" 
                  : `${stats.totalStudents} connected mentees`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111218] border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-md">
          <div className="absolute h-1 w-full bg-gradient-to-r from-cyan-400 to-teal-400 top-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Earnings</CardTitle>
            <div className="rounded-full bg-[#3949AB]/10 p-2">
              <DollarSign className="h-4 w-4 text-[#00C6FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ${stats.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-[#E0E0E0] mt-1">
              {stats.sessionsCompleted === 0 
                ? "No completed sessions" 
                : stats.sessionsCompleted === 1 
                  ? "From 1 completed session" 
                  : `From ${stats.sessionsCompleted} completed sessions`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111218] border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-md">
          <div className="absolute h-1 w-full bg-gradient-to-r from-teal-400 to-green-400 top-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Average Rating</CardTitle>
            <div className="rounded-full bg-[#3949AB]/10 p-2">
              <Star className="h-4 w-4 text-[#00C6FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(stats.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-[#E0E0E0]">
                ({stats.averageRating.toFixed(1)})
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="bg-[#111218] p-1 rounded-xl border border-gray-800">
          <TabsTrigger 
            value="sessions" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3949AB] data-[state=active]:to-[#4A5BC7] data-[state=active]:text-white transition-all duration-300"
          >
            Recent Sessions
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3949AB] data-[state=active]:to-[#4A5BC7] data-[state=active]:text-white transition-all duration-300"
          >
            Recent Reviews
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="space-y-5">
          {recentSessions.length === 0 ? (
            <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6 text-center">
              <div className="py-8 flex flex-col items-center">
                <div className="rounded-full bg-[#3949AB]/10 p-6 mb-4">
                  <Calendar className="h-10 w-10 text-[#00C6FF] opacity-70" />
                </div>
                <CardTitle className="text-xl text-white mb-2">No Recent Sessions</CardTitle>
                <CardDescription className="max-w-md mb-6 text-[#E0E0E0] text-[15px] leading-relaxed">
                  You haven't had any sessions yet. Schedule with your mentees to get started.
                </CardDescription>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-[#3949AB] to-[#4A5BC7] hover:brightness-110 transition-all border-0 text-white px-6 py-2 rounded-lg"
                >
                  <Link href="/dashboard/mentor/schedule">
                    View Schedule
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {recentSessions.map((session) => (
                <Card key={session.id} className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg text-white">{session.title}</CardTitle>
                      <CardDescription className="text-[#E0E0E0]">
                        {session.date} • {session.time} • {session.duration} min
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={session.status === "COMPLETED" ? "secondary" : "default"}
                      className={cn(
                        "rounded-full px-3",
                        session.status === "COMPLETED" 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      )}
                    >
                      {session.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={session.mentee.image} alt={session.mentee.name} />
                        <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                          {session.mentee.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-white">{session.mentee.name}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 border-t border-gray-800 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs border-gray-700 bg-transparent hover:bg-[#3949AB]/10 hover:text-[#00C6FF] transition-colors"
                      asChild
                    >
                      <Link href={`/dashboard/mentor/messages?connectionId=${session.id}`}>
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Message
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs border-gray-700 bg-transparent hover:bg-[#3949AB]/10 hover:text-[#00C6FF] transition-colors"
                      asChild
                    >
                      <Link href={`/dashboard/mentor/sessions/${session.id}`}>
                        <CalendarCheck className="mr-1 h-3 w-3" />
                        Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-5">
          {recentReviews.length === 0 ? (
            <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6 text-center">
              <div className="py-8 flex flex-col items-center">
                <div className="rounded-full bg-[#3949AB]/10 p-6 mb-4">
                  <Star className="h-10 w-10 text-[#00C6FF] opacity-70" />
                </div>
                <CardTitle className="text-xl text-white mb-2">No Reviews Yet</CardTitle>
                <CardDescription className="max-w-md text-[#E0E0E0] text-[15px] leading-relaxed">
                  You haven't received any reviews yet. Complete sessions with your mentees to get reviews.
                </CardDescription>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {recentReviews.map((review) => (
                <Card key={review.id} className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={review.mentee.image} alt={review.mentee.name} />
                        <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                          {review.mentee.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-medium text-white">{review.mentee.name}</CardTitle>
                        <CardDescription className="text-xs text-[#E0E0E0]">{review.date}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[15px] leading-relaxed text-[#E0E0E0] italic">"{review.comment}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TabsNav
        tabs={[
          { name: "Overview", href: "/dashboard/mentor" },
          { name: "Schedule", href: "/dashboard/mentor/schedule" },
          { name: "Messages", href: "/dashboard/mentor/messages" },
        ]}
      />
    </div>
  );
} 