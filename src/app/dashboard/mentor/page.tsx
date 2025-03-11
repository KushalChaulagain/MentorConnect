'use client';

import { ConnectionNotifications } from "@/components/connection-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    DollarSign,
    MessageSquare,
    MoreHorizontal,
    Star,
    Timer,
    User,
    Users
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types for data modeling
interface MentorStats {
  upcomingSessions: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
  sessionsCompleted: number;
  profileCompleteness: number;
}

interface MentorSession {
  id: string;
  title: string;
  mentee: {
    name: string;
    image: string;
  };
  date: string;
  time: string;
  duration: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
}

interface MentorReview {
  id: string;
  mentee: {
    name: string;
    image: string;
  };
  rating: number;
  comment: string;
  date: string;
}

export default function MentorDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Mock data - would normally be fetched from API
  const [stats, setStats] = useState<MentorStats>({
    upcomingSessions: 0,
    totalStudents: 0,
    totalEarnings: 0,
    averageRating: 0,
    sessionsCompleted: 0,
    profileCompleteness: 65,
  });
  
  const [recentSessions, setRecentSessions] = useState<MentorSession[]>([]);
  const [latestReviews, setLatestReviews] = useState<MentorReview[]>([]);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // You'd normally fetch all this data from your API
        setLoading(true);
        
        // Fetch profile data to get the accurate completion percentage
        let profileCompleteness = 85; // Default value
        try {
          const profileResponse = await fetch('/api/profile');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // Use the actual completion status from the profile API
            if (profileData.completionStatus !== undefined) {
              profileCompleteness = profileData.completionStatus;
              console.log("Using actual profile completion percentage:", profileCompleteness);
            }
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
          // Continue with default value
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set mock data for now - replace with actual API calls
        setStats({
          upcomingSessions: 2,
          totalStudents: 6,
          totalEarnings: 16000,
          averageRating: 4.7,
          sessionsCompleted: 12,
          profileCompleteness: profileCompleteness, // Use the fetched value
        });
        
        setRecentSessions([
          {
            id: '1',
            title: 'React Fundamentals',
            mentee: {
              name: 'Anil Sharma',
              image: 'https://randomuser.me/api/portraits/men/32.jpg',
            },
            date: 'Today',
            time: '4:00 PM',
            duration: 60,
            status: 'UPCOMING',
          },
          {
            id: '2',
            title: 'JavaScript Debugging',
            mentee: {
              name: 'Maya Patel',
              image: 'https://randomuser.me/api/portraits/women/44.jpg',
            },
            date: 'Tomorrow',
            time: '10:30 AM',
            duration: 45,
            status: 'UPCOMING',
          },
          {
            id: '3',
            title: 'Node.js Best Practices',
            mentee: {
              name: 'Rajan Thapa',
              image: 'https://randomuser.me/api/portraits/men/67.jpg',
            },
            date: '21 Mar 2024',
            time: '2:00 PM',
            duration: 60,
            status: 'COMPLETED',
          },
        ]);
        
        setLatestReviews([
          {
            id: '1',
            mentee: {
              name: 'Pritika Thapa',
              image: 'https://randomuser.me/api/portraits/women/67.jpg',
            },
            rating: 5,
            comment: 'Amazing mentor! Helped me understand complex concepts in a simple way.',
            date: '2 days ago',
          },
          {
            id: '2',
            mentee: {
              name: 'Rohan Kumar',
              image: 'https://randomuser.me/api/portraits/men/54.jpg',
            },
            rating: 4,
            comment: 'Very knowledgeable and patient. Would recommend!',
            date: '1 week ago',
          },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mentor data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load dashboard data. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConnectionNotifications />
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern"></div>
        <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="space-y-4 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Welcome back, {session?.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-indigo-100 max-w-2xl">
              You've completed <span className="font-semibold">{stats.sessionsCompleted} mentoring sessions</span> so far. 
              Keep up the great work helping the next generation of developers in Nepal!
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/dashboard/availability">
                <Button className="bg-white/90 hover:bg-white text-indigo-600 font-medium">
                  Set Availability
                  <Clock className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard/sessions">
                <Button variant="outline" className="bg-indigo-600/10 text-white border-white/20 hover:bg-indigo-600/20">
                  View Sessions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-white text-xl font-semibold mb-2">Profile Completion</div>
              <div className="w-32 h-32 relative flex items-center justify-center mb-2">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth="10" 
                  />
                  {/* Progress circle */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="10" 
                    strokeDasharray={`${2 * Math.PI * 45 * stats.profileCompleteness / 100} ${2 * Math.PI * 45 * (1 - stats.profileCompleteness / 100)}`}
                    strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-white text-2xl font-bold">
                  {stats.profileCompleteness}%
                </div>
              </div>
              <Link href="/dashboard/profile">
                <Button variant="link" className="text-white hover:text-indigo-100 p-0">
                  Complete Your Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <div className="mt-1 flex items-center text-xs">
              <span className={cn(
                stats.upcomingSessions > 0 
                  ? "text-emerald-500 dark:text-emerald-400" 
                  : "text-muted-foreground"
              )}>
                {stats.upcomingSessions > 0 
                  ? "Sessions scheduled" 
                  : "No upcoming sessions"}
              </span>
            </div>
          </CardContent>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Link href="/dashboard/sessions" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
              View calendar
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="mt-1 flex items-center text-xs">
              {stats.totalStudents > 0 && (
                <span className="text-emerald-500 dark:text-emerald-400 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Growing your network
                </span>
              )}
            </div>
          </CardContent>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Link href="/dashboard/mentor/students" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
              View all students
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.totalEarnings.toLocaleString()}</div>
            <div className="mt-1 flex items-center text-xs">
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                From {stats.sessionsCompleted} completed sessions
              </span>
            </div>
          </CardContent>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Link href="/dashboard/mentor/earnings" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
              View earnings details
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="mt-1 flex items-center text-xs">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3 w-3",
                      star <= Math.round(stats.averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Link href="/dashboard/mentor/reviews" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
              View all reviews
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-6">
            {/* Upcoming Sessions */}
            <Card className="lg:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                  <CardDescription>Your next scheduled mentoring sessions</CardDescription>
                </div>
                <Link href="/dashboard/sessions">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentSessions.filter(s => s.status === 'UPCOMING').length > 0 ? (
                  <div className="space-y-4">
                    {recentSessions
                      .filter(s => s.status === 'UPCOMING')
                      .slice(0, 3)
                      .map(session => (
                        <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <div className="flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={session.mentee.image} alt={session.mentee.name} />
                              <AvatarFallback>{session.mentee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {session.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              with {session.mentee.name}
                            </p>
                          </div>
                          <div className="flex flex-col items-end text-xs text-right">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{session.date}</span>
                            <span className="text-gray-500 dark:text-gray-400">{session.time} • {session.duration} min</span>
                          </div>
                          <Link href={`/dashboard/sessions/${session.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">No upcoming sessions</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      Set your availability to start receiving session requests
                    </p>
                    <Link href="/dashboard/availability">
                      <Button size="sm">Set Availability</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Latest Reviews */}
            <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Latest Reviews</CardTitle>
                <CardDescription>What your mentees are saying</CardDescription>
              </CardHeader>
              <CardContent>
                {latestReviews.length > 0 ? (
                  <div className="space-y-4">
                    {latestReviews.map(review => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.mentee.image} alt={review.mentee.name} />
                            <AvatarFallback>{review.mentee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{review.mentee.name}</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-3 w-3",
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-auto">{review.date}</span>
                        </div>
                        <blockquote className="text-sm text-gray-600 dark:text-gray-300 italic">
                          "{review.comment}"
                        </blockquote>
                        <div className="border-b border-gray-100 dark:border-gray-700 pt-1"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No reviews yet
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <Link href="/dashboard/mentor/reviews" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    See All Reviews
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Links */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Get to what matters most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/profile">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                    <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </div>
                </Link>
                <Link href="/dashboard/availability">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                    <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <span className="text-sm font-medium">Set Availability</span>
                  </div>
                </Link>
                <Link href="/dashboard/mentor/pricing">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                    <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <span className="text-sm font-medium">Manage Pricing</span>
                  </div>
                </Link>
                <Link href="/dashboard/mentor/messages">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                    <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <span className="text-sm font-medium">Messages</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your latest mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-6">
                  {recentSessions.map(session => (
                    <div key={session.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.mentee.image} alt={session.mentee.name} />
                          <AvatarFallback>{session.mentee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {session.title}
                          </p>
                          <Badge variant={session.status === 'UPCOMING' ? 'outline' : session.status === 'COMPLETED' ? 'secondary' : 'destructive'}>
                            {session.status === 'UPCOMING' 
                              ? <><Clock className="h-3 w-3 mr-1" /> Upcoming</> 
                              : session.status === 'COMPLETED' 
                                ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</> 
                                : 'Cancelled'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          with {session.mentee.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {session.date}
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {session.time}
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Timer className="h-3 w-3 mr-1" />
                            {session.duration} min
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">No sessions yet</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    Your sessions will appear here once you start mentoring
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <Link href="/dashboard/sessions" className="w-full">
                <Button variant="outline" className="w-full">
                  View All Sessions
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Your Students</CardTitle>
              <CardDescription>People you're currently mentoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">No active students</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Your mentees will appear here once you start mentoring
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 