"use client";

import { TabsNav } from "@/components/tabs-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Award,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  GraduationCap,
  LineChart,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  UserCheck,
  Zap
} from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import { EnhancedNotifications } from "./enhanced-notifications";
import { PendingConnectionRequests } from "./pending-connection-requests";

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

// Achievement system for gamification
type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  unlocked: boolean;
  level?: number;
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
  
  // Mentor Level calculation (gamification element)
  const mentorLevel = Math.max(1, Math.floor(stats.sessionsCompleted / 5) + 1);
  const nextLevelProgress = (stats.sessionsCompleted % 5) * 20;
  
  // Achievements for gamification
  const [achievements] = useState<Achievement[]>([
    {
      id: "first-session",
      name: "First Steps",
      description: "Complete your first mentoring session",
      icon: <Zap className="h-5 w-5 text-cyan-400" />,
      progress: stats.sessionsCompleted > 0 ? 100 : 0,
      unlocked: stats.sessionsCompleted > 0
    },
    {
      id: "five-sessions",
      name: "Gaining Momentum",
      description: "Complete 5 mentoring sessions",
      icon: <TrendingUp className="h-5 w-5 text-cyan-400" />,
      progress: Math.min(100, (stats.sessionsCompleted / 5) * 100),
      unlocked: stats.sessionsCompleted >= 5
    },
    {
      id: "five-star",
      name: "Excellence Award", 
      description: "Receive a 5-star rating",
      icon: <Star className="h-5 w-5 text-amber-400 fill-amber-400" />,
      progress: stats.averageRating >= 5 ? 100 : Math.min(100, (stats.averageRating / 5) * 100),
      unlocked: stats.averageRating >= 5
    },
    {
      id: "ten-mentees",
      name: "Community Builder",
      description: "Connect with 10 mentees",
      icon: <UserCheck className="h-5 w-5 text-indigo-400" />,
      progress: Math.min(100, (stats.totalStudents / 10) * 100),
      unlocked: stats.totalStudents >= 10
    }
  ]);
  
  return (
    <div className="space-y-8">
      {/* Modern glassmorphic welcome banner with mentor level */}
      <div className="relative overflow-hidden rounded-xl bg-[#101418]">
        {/* Abstract background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-900"></div>
        <div className="absolute -top-40 right-20 w-64 h-64 rounded-full bg-slate-800/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-slate-800/20 blur-3xl"></div>
        
        {/* Main content */}
        <div className="relative px-8 py-12 flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-white px-3 py-1 text-xs rounded-full flex items-center">
                <span className="font-medium mr-1.5">Level {mentorLevel}</span>
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                    style={{ width: `${nextLevelProgress}%` }}
                  ></div>
                </div>
              </div>
              
              {stats.averageRating > 4.5 && (
                <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-amber-400 px-3 py-1 text-xs rounded-full flex items-center">
                  <Star className="h-3 w-3 fill-amber-400 mr-1" />
                  <span className="font-medium">Top Rated</span>
                </div>
              )}
            </div>
            
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-200 text-transparent bg-clip-text">{session?.user?.name?.split(' ')[0] || 'Mentor'}</span>
            </h1>
            
            <div className="space-y-3">
              <p className="text-xl text-slate-300">
                You've completed <span className="text-cyan-400 font-bold">{stats.sessionsCompleted}</span> mentoring sessions so far. Keep up the great work helping the next generation of developers!
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <Button className="bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700/50 backdrop-blur-sm shadow-sm">
                  <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
                  Set Availability
                </Button>
                <Button variant="outline" className="border-slate-700/50 text-cyan-400 bg-slate-900/40 hover:text-cyan-300 hover:bg-slate-800/40">
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  View Sessions
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mentor status card with glassmorphism */}
          <div className="flex-shrink-0">
            <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/40 p-4 rounded-xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                    <CheckCircle2 className="h-6 w-6 text-cyan-400" />
                  </div>
                  {stats.profileCompleteness >= 80 && (
                    <div className="absolute -top-1 -right-1 bg-slate-800 rounded-full p-0.5 border border-slate-700/50">
                      <Trophy className="h-3 w-3 text-amber-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Mentor Status</p>
                  <p className="text-lg font-bold text-white flex items-center gap-1">
                    Verified Mentor
                    <Sparkles className="h-4 w-4 text-amber-400 ml-1" />
                  </p>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Profile completion</span>
                      <span className="text-cyan-400">{stats.profileCompleteness}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${stats.profileCompleteness}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard header with statistics */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Your Dashboard</h2>
          <p className="text-slate-400">Monitor your mentoring performance and achievements</p>
        </div>
        <EnhancedNotifications />
      </div>

      {/* Achievements row (Gamification) */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-400" />
            Your Achievements
          </h3>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8 px-2">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={cn(
                "bg-slate-800/40 backdrop-blur-sm border rounded-lg p-3",
                achievement.unlocked 
                  ? "border-slate-700/50" 
                  : "border-slate-800/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  achievement.unlocked 
                    ? "bg-slate-800/80 text-cyan-400" 
                    : "bg-slate-800/40 text-slate-500"
                )}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={cn(
                      "text-sm font-medium",
                      achievement.unlocked ? "text-white" : "text-slate-400"
                    )}>
                      {achievement.name}
                    </p>
                    {achievement.unlocked && (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-950/30 text-amber-400 text-[10px] px-1.5 h-4 rounded-sm">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-0.5 mb-2">{achievement.description}</p>
                  
                  <div className="h-1 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        achievement.unlocked 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500" 
                          : "bg-slate-600"
                      )}
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Monochrome Stat Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Upcoming Sessions Card */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-slate-900/20 hover:border-slate-700/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-800/30">
            <CardTitle className="text-sm font-medium text-white">Upcoming Sessions</CardTitle>
            <div className="rounded-lg bg-slate-800/80 p-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">{stats.upcomingSessions}</div>
            <p className="text-xs text-slate-400 mt-1.5">
              {stats.upcomingSessions === 0 
                ? "No upcoming sessions scheduled" 
                : stats.upcomingSessions === 1 
                  ? "1 session scheduled for this week"
                  : `${stats.upcomingSessions} sessions scheduled for this week`}
            </p>
            <div className="mt-4">
              <Link 
                href="/dashboard/sessions" 
                className="text-xs inline-flex items-center font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200 group"
              >
                View calendar
                <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Total Students Card */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-slate-900/20 hover:border-slate-700/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-800/30">
            <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
            <div className="rounded-lg bg-slate-800/80 p-2">
              <UserCheck className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
            <p className="text-xs text-slate-400 mt-1.5">
              {stats.totalStudents > 0 
                ? `${stats.totalStudents > 1 ? "Mentees" : "Mentee"} looking to you for guidance` 
                : "No mentees connected yet"}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/30">
              <div className="text-xs text-slate-400 flex justify-between">
                <span>Network growth</span>
                <span className="text-green-400">+{Math.floor(stats.totalStudents / 2)} this month</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings Card */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-slate-900/20 hover:border-slate-700/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-800/30">
            <CardTitle className="text-sm font-medium text-white">Total Earnings</CardTitle>
            <div className="rounded-lg bg-slate-800/80 p-2">
              <DollarSign className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">Rs. {stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1.5">
              From {stats.sessionsCompleted} completed sessions
            </p>
            <div className="mt-4 space-y-1">
              <div className="w-full h-8 rounded-md bg-slate-800/50 flex items-center px-3 overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500/20 to-transparent" style={{ width: '25%' }}></div>
                <span className="text-xs text-slate-300 relative z-10">This month: Rs. {Math.floor(stats.totalEarnings * 0.3).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating Card */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-slate-900/20 hover:border-slate-700/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-800/30">
            <CardTitle className="text-sm font-medium text-white">Average Rating</CardTitle>
            <div className="rounded-lg bg-slate-800/80 p-2">
              <Star className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1.5">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-4 w-4", 
                    i < Math.floor(stats.averageRating) 
                      ? "text-amber-400 fill-amber-400" 
                      : i < stats.averageRating 
                        ? "text-amber-400 fill-amber-400/50" 
                        : "text-slate-700"
                  )} 
                />
              ))}
              <span className="text-xs ml-2 text-slate-400">
                {stats.sessionsCompleted} reviews
              </span>
            </div>
            <div className="mt-4 p-2 rounded-md bg-slate-800/40">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>5★</div>
                <div className="w-full mx-2 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div>70%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions and Reviews with Glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="border-b border-slate-800/30 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">Upcoming Sessions</CardTitle>
              <Button size="sm" variant="outline" className="text-cyan-400 border-slate-700/50 hover:bg-slate-800/50 rounded-lg h-8">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="rounded-full bg-slate-800/50 p-4 mb-4">
                  <Calendar className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No upcoming sessions</h3>
                <p className="text-slate-400 max-w-md">
                  You don't have any scheduled sessions. Set your availability to allow mentees to book time with you.
                </p>
                <Button className="mt-5 bg-slate-800 text-white border border-slate-700/50 hover:bg-slate-700 rounded-lg">
                  Set Availability
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/30">
                {recentSessions.map((session) => (
                  <div key={session.id} className="p-4 hover:bg-slate-800/20 transition-colors duration-150">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-slate-700/50 shadow-sm">
                        <AvatarImage src={session.mentee.image} alt={session.mentee.name} />
                        <AvatarFallback className="bg-slate-800 text-slate-200">
                          {session.mentee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {session.title}
                          </p>
                          <div className="flex items-center mt-1 sm:mt-0">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "rounded-full text-xs h-6 px-2.5",
                                session.status === 'confirmed' 
                                  ? "border-green-500/20 text-green-400 bg-green-950/20" 
                                  : "border-amber-500/20 text-amber-400 bg-amber-950/20"
                              )}
                            >
                              {session.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-x-2 mt-1 text-xs text-slate-400">
                          <span>{session.date}</span>
                          <span>•</span>
                          <span>{session.time}</span>
                          <span>•</span>
                          <span>{session.duration} min</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="hidden sm:flex text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="border-b border-slate-800/30 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">Latest Reviews</CardTitle>
              <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-slate-800/50 rounded-lg h-8">
                <Star className="h-4 w-4 mr-1 fill-amber-400" />
                {stats.averageRating.toFixed(1)}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="rounded-full bg-slate-800/50 p-4 mb-4">
                  <Star className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No reviews yet</h3>
                <p className="text-slate-400 max-w-md">
                  Once you complete sessions with mentees, they'll have the opportunity to leave reviews.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/30">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-4 hover:bg-slate-800/20 transition-colors duration-150">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 mt-1 border border-slate-700/50">
                        <AvatarImage src={review.mentee.image} alt={review.mentee.name} />
                        <AvatarFallback className="bg-slate-800 text-slate-200">
                          {review.mentee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-white">{review.mentee.name}</p>
                          <p className="text-xs text-slate-500">{review.date}</p>
                        </div>
                        <div className="flex mt-0.5 mb-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-3 w-3", 
                                i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"
                              )} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-300">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Requests Section */}
      <div className="space-y-5">
        <PendingConnectionRequests />
      </div>

      {/* Learning Resources with Monochrome Design */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-cyan-400" />
            Mentoring Resources
          </h2>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
              <GraduationCap className="h-8 w-8 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Effective Teaching</h3>
            </div>
            <CardContent className="p-5">
              <p className="text-sm text-slate-300 mb-3">Learn how to structure your mentoring sessions for maximum impact and student engagement.</p>
              <Button variant="link" className="p-0 h-auto text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform duration-300">
                Read guide
                <ChevronRight className="h-3 w-3 ml-1 group-hover:ml-2 transition-all" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-10"></div>
              <LineChart className="h-8 w-8 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Growth Strategies</h3>
            </div>
            <CardContent className="p-5">
              <p className="text-sm text-slate-300 mb-3">Strategies to build your reputation and attract more mentees to your profile.</p>
              <Button variant="link" className="p-0 h-auto text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform duration-300">
                Read guide
                <ChevronRight className="h-3 w-3 ml-1 group-hover:ml-2 transition-all" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/pattern-waves.svg')] opacity-10"></div>
              <MessageSquare className="h-8 w-8 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Communication Tips</h3>
            </div>
            <CardContent className="p-5">
              <p className="text-sm text-slate-300 mb-3">Master the art of asking questions and providing constructive feedback to mentees.</p>
              <Button variant="link" className="p-0 h-auto text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform duration-300">
                Read guide
                <ChevronRight className="h-3 w-3 ml-1 group-hover:ml-2 transition-all" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabsNav 
        tabs={[
          { name: "Overview", href: "/dashboard/mentor" },
          { name: "Sessions", href: "/dashboard/sessions" },
          { name: "Availability", href: "/dashboard/availability" },
          { name: "Mentees", href: "/dashboard/mentor/mentees" },
          { name: "Messages", href: "/dashboard/mentor/messages" }
        ]}
      />
    </div>
  );
} 