'use client';

import { EnhancedNotifications } from "@/components/enhanced-notifications";
import { TabsNav } from "@/components/tabs-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Star,
  Target,
  UserCheck,
  Video
} from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { useState } from "react";

interface Connection {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  mentor: {
    id: string;
    name: string;
    image: string;
    mentorProfile: {
      title: string;
      expertise: string[];
      rating: number;
    };
  };
}

interface TopMentor {
  id: string;
  userId: string;
  title: string;
  expertise: string[];
  rating: number;
  user: {
    name: string;
    image: string;
  };
}

interface MenteeDashboardClientProps {
  initialConnections: Connection[];
  initialTopMentors: TopMentor[];
  session: Session | null;
}

export default function MenteeDashboardClient({
  initialConnections,
  initialTopMentors,
  session
}: MenteeDashboardClientProps) {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [topMentors, setTopMentors] = useState<TopMentor[]>(initialTopMentors);
  
  // Mock stats for mentee dashboard UI
  const menteeStats = {
    upcomingSessions: connections.filter(c => c.status === 'ACCEPTED').length > 0 ? 1 : 0,
    connectedMentors: connections.filter(c => c.status === 'ACCEPTED').length,
    pendingRequests: connections.filter(c => c.status === 'PENDING').length,
    learningGoals: 4,
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white">
            Welcome back, <span className="font-semibold text-[#00C6FF]">{session?.user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-[16px] leading-relaxed">
            Continue your learning journey with expert guidance
          </p>
        </div>
        <EnhancedNotifications />
      </div>

      {/* Stats Cards */}
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
            <div className="text-3xl font-bold text-white">{menteeStats.upcomingSessions}</div>
            <p className="text-xs text-[#E0E0E0] mt-1">
              {menteeStats.upcomingSessions === 0 
                ? "No upcoming sessions" 
                : menteeStats.upcomingSessions === 1 
                  ? "1 session scheduled" 
                  : `${menteeStats.upcomingSessions} sessions scheduled`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111218] border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-md">
          <div className="absolute h-1 w-full bg-gradient-to-r from-blue-400 to-cyan-400 top-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Connected Mentors</CardTitle>
            <div className="rounded-full bg-[#3949AB]/10 p-2">
              <UserCheck className="h-4 w-4 text-[#00C6FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{menteeStats.connectedMentors}</div>
            <p className="text-xs text-[#E0E0E0] mt-1">
              {menteeStats.connectedMentors === 0 
                ? "No connected mentors" 
                : menteeStats.connectedMentors === 1 
                  ? "1 active connection" 
                  : `${menteeStats.connectedMentors} active connections`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111218] border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-md">
          <div className="absolute h-1 w-full bg-gradient-to-r from-cyan-400 to-teal-400 top-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Requests</CardTitle>
            <div className="rounded-full bg-[#3949AB]/10 p-2">
              <MessageSquare className="h-4 w-4 text-[#00C6FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{menteeStats.pendingRequests}</div>
            <p className="text-xs text-[#E0E0E0] mt-1">
              {menteeStats.pendingRequests === 0 
                ? "No pending requests" 
                : menteeStats.pendingRequests === 1 
                  ? "1 request awaiting response" 
                  : `${menteeStats.pendingRequests} requests awaiting response`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111218] border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 shadow-md">
          <div className="absolute h-1 w-full bg-gradient-to-r from-teal-400 to-green-400 top-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Learning Goals</CardTitle>
            <div className="rounded-full bg-[#3949AB]/10 p-2">
              <Target className="h-4 w-4 text-[#00C6FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{menteeStats.learningGoals}</div>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="ml-2 text-xs text-[#E0E0E0]">75%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connected" className="space-y-6">
        <TabsList className="bg-[#111218] p-1 rounded-xl border border-gray-800">
          <TabsTrigger 
            value="connected" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3949AB] data-[state=active]:to-[#4A5BC7] data-[state=active]:text-white transition-all duration-300"
          >
            Connected Mentors
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3949AB] data-[state=active]:to-[#4A5BC7] data-[state=active]:text-white transition-all duration-300"
          >
            Pending Requests
          </TabsTrigger>
          <TabsTrigger 
            value="discover" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3949AB] data-[state=active]:to-[#4A5BC7] data-[state=active]:text-white transition-all duration-300"
          >
            Discover Mentors
          </TabsTrigger>
        </TabsList>
        
        {/* Connected Mentors Tab */}
        <TabsContent value="connected" className="space-y-5">
          {connections.filter(c => c.status === 'ACCEPTED').length === 0 ? (
            <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6 text-center">
              <div className="py-8 flex flex-col items-center">
                <div className="rounded-full bg-[#3949AB]/10 p-6 mb-4">
                  <UserCheck className="h-10 w-10 text-[#00C6FF] opacity-70" />
                </div>
                <CardTitle className="text-xl text-white mb-2">No Connected Mentors</CardTitle>
                <CardDescription className="max-w-md mb-6 text-[#E0E0E0] text-[15px] leading-relaxed">
                  Connect with expert mentors to accelerate your learning journey and get personalized guidance.
                </CardDescription>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-[#3949AB] to-[#4A5BC7] hover:brightness-110 transition-all border-0 text-white px-6 py-2 rounded-lg"
                >
                  <Link href="/dashboard/mentee/find-mentors">
                    Find Mentors
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {connections.filter(c => c.status === 'ACCEPTED').map((connection) => (
                <Card key={connection.id} className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={connection.mentor.image} alt={connection.mentor.name} />
                        <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                          {connection.mentor.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-white">{connection.mentor.name}</CardTitle>
                        <CardDescription className="text-[#E0E0E0]">
                          {connection.mentor.mentorProfile.title}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm text-[#E0E0E0]">
                        {connection.mentor.mentorProfile.rating.toFixed(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {connection.mentor.mentorProfile.expertise.slice(0, 3).map((skill) => (
                        <Badge 
                          key={skill} 
                          className="bg-[#1E293B] text-cyan-400 hover:bg-[#1E293B]/80 border-0"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {connection.mentor.mentorProfile.expertise.length > 3 && (
                        <Badge className="bg-[#1E293B] text-cyan-400 hover:bg-[#1E293B]/80 border-0">
                          +{connection.mentor.mentorProfile.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 border-t border-gray-800 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs border-gray-700 bg-transparent hover:bg-[#3949AB]/10 hover:text-[#00C6FF] transition-colors"
                      asChild
                    >
                      <Link href={`/dashboard/mentee/messages?connectionId=${connection.id}`}>
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
                      <Link href={`/dashboard/mentee/sessions/book?mentorId=${connection.mentor.id}`}>
                        <Video className="mr-1 h-3 w-3" />
                        Book Session
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-5">
          {connections.filter(c => c.status === 'PENDING').length === 0 ? (
            <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6 text-center">
              <div className="py-8 flex flex-col items-center">
                <div className="rounded-full bg-[#3949AB]/10 p-6 mb-4">
                  <MessageSquare className="h-10 w-10 text-[#00C6FF] opacity-70" />
                </div>
                <CardTitle className="text-xl text-white mb-2">No Pending Requests</CardTitle>
                <CardDescription className="max-w-md text-[#E0E0E0] text-[15px] leading-relaxed">
                  You don't have any pending connection requests. Browse our top mentors to find the perfect match for your learning goals.
                </CardDescription>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {connections.filter(c => c.status === 'PENDING').map((connection) => (
                <Card 
                  key={connection.id} 
                  className="bg-[#111218] border-dashed border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12 border border-gray-700">
                      <AvatarImage src={connection.mentor.image} alt={connection.mentor.name} />
                      <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                        {connection.mentor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-white">{connection.mentor.name}</CardTitle>
                      <CardDescription className="text-[#E0E0E0]">
                        {connection.mentor.mentorProfile.title}
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 ml-auto">
                      Pending
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-[#E0E0E0] italic">
                      Your request is being reviewed. We'll notify you when {connection.mentor.name} responds.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Discover Mentors Tab */}
        <TabsContent value="discover" className="space-y-5">
          {topMentors.length === 0 ? (
            <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6 text-center">
              <div className="py-8 flex flex-col items-center">
                <div className="rounded-full bg-[#3949AB]/10 p-6 mb-4">
                  <GraduationCap className="h-10 w-10 text-[#00C6FF] opacity-70" />
                </div>
                <CardTitle className="text-xl text-white mb-2">Finding Your Perfect Mentors</CardTitle>
                <CardDescription className="max-w-md text-[#E0E0E0] text-[15px] leading-relaxed">
                  We're personalizing mentor recommendations based on your profile and interests. Check back soon!
                </CardDescription>
                <Button 
                  asChild 
                  className="mt-6 bg-gradient-to-r from-[#3949AB] to-[#4A5BC7] hover:brightness-110 transition-all border-0 text-white px-6 py-2 rounded-lg"
                >
                  <Link href="/dashboard/mentee/find-mentors">
                    Browse All Mentors
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {topMentors.map((mentor) => (
                <Card key={mentor.id} className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={mentor.user.image} alt={mentor.user.name} />
                        <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                          {mentor.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-white">{mentor.user.name}</CardTitle>
                        <CardDescription className="text-[#E0E0E0]">
                          {mentor.title}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm text-[#E0E0E0]">
                        {mentor.rating.toFixed(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.expertise.slice(0, 3).map((skill) => (
                        <Badge 
                          key={skill} 
                          className="bg-[#1E293B] text-cyan-400 hover:bg-[#1E293B]/80 border-0"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <Badge className="bg-[#1E293B] text-cyan-400 hover:bg-[#1E293B]/80 border-0">
                          +{mentor.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-800 pt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-[#3949AB] to-[#4A5BC7] hover:brightness-110 transition-all border-0 text-white"
                      asChild
                    >
                      <Link href={`/dashboard/mentee/mentor/${mentor.userId}`}>
                        View Profile
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Featured Learning Resources */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Learning Resources</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-40 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white opacity-75" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-white">Getting Started with Mentorship</CardTitle>
              <CardDescription className="text-[#E0E0E0]">
                Learn how to make the most of your mentorship journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#E0E0E0]">
                Tips and strategies to establish effective mentor-mentee relationships and achieve your learning goals.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-gray-700 hover:bg-[#3949AB]/10 hover:text-[#00C6FF]">
                Read Guide
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-40 bg-gradient-to-br from-teal-900 to-emerald-900 flex items-center justify-center">
              <Target className="h-16 w-16 text-white opacity-75" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-white">Setting Learning Goals</CardTitle>
              <CardDescription className="text-[#E0E0E0]">
                Define clear objectives for your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#E0E0E0]">
                Framework for creating SMART goals and tracking your progress with the help of your mentors.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-gray-700 hover:bg-[#3949AB]/10 hover:text-[#00C6FF]">
                Read Guide
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-40 bg-gradient-to-br from-indigo-900 to-violet-900 flex items-center justify-center">
              <Video className="h-16 w-16 text-white opacity-75" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-white">Preparing for Sessions</CardTitle>
              <CardDescription className="text-[#E0E0E0]">
                Maximize the value of each mentoring session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#E0E0E0]">
                Best practices for preparing questions, setting agendas, and following up after mentoring sessions.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-gray-700 hover:bg-[#3949AB]/10 hover:text-[#00C6FF]">
                Read Guide
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <TabsNav
        tabs={[
          { name: "Overview", href: "/dashboard/mentee" },
          { name: "Find Mentors", href: "/dashboard/mentee/find-mentors" },
          { name: "Sessions", href: "/dashboard/mentee/sessions" },
          { name: "Messages", href: "/dashboard/mentee/messages" },
          { name: "Learning Path", href: "/dashboard/mentee/learning-path" },
        ]}
      />
    </div>
  );
} 