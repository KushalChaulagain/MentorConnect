"use client";

import { TabsNav } from "@/components/tabs-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <Button variant="outline" size="icon" className="rounded-full">
      <Bell className="h-4 w-4" />
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your mentoring
          </p>
        </div>
        <ConnectionNotifications />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingSessions === 0 
                ? "No upcoming sessions" 
                : stats.upcomingSessions === 1 
                  ? "1 session scheduled" 
                  : `${stats.upcomingSessions} sessions scheduled`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalStudents === 0 
                ? "No students yet" 
                : stats.totalStudents === 1 
                  ? "1 connected mentee" 
                  : `${stats.totalStudents} connected mentees`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.sessionsCompleted === 0 
                ? "No completed sessions" 
                : stats.sessionsCompleted === 1 
                  ? "From 1 completed session" 
                  : `From ${stats.sessionsCompleted} completed sessions`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(stats.averageRating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                ({stats.averageRating.toFixed(1)})
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="space-y-4">
          {recentSessions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Recent Sessions</CardTitle>
                <CardDescription>
                  You haven't had any sessions yet. Schedule with your mentees to get started.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/dashboard/mentor/schedule">
                    View Schedule
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        {session.date} • {session.time} • {session.duration} min
                      </CardDescription>
                    </div>
                    <Badge variant={session.status === "COMPLETED" ? "secondary" : "default"}>
                      {session.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.mentee.image} alt={session.mentee.name} />
                        <AvatarFallback>{session.mentee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{session.mentee.name}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
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
                      className="text-xs"
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
        
        <TabsContent value="reviews" className="space-y-4">
          {recentReviews.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Reviews Yet</CardTitle>
                <CardDescription>
                  You haven't received any reviews yet. Complete sessions with your mentees to get reviews.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.mentee.image} alt={review.mentee.name} />
                        <AvatarFallback>{review.mentee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm font-medium">{review.mentee.name}</CardTitle>
                        <CardDescription className="text-xs">{review.date}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm">"{review.comment}"</p>
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
          { name: "Profile", href: "/dashboard/mentor/profile" },
        ]}
      />
    </div>
  );
} 