'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Star, Video } from "lucide-react";
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
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [topMentors, setTopMentors] = useState<TopMentor[]>(initialTopMentors);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative p-8 rounded-lg bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#0ea5e9)] opacity-20 rounded-lg"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-indigo-100">
            Connect with expert mentors and accelerate your learning journey.
          </p>
        </div>
      </div>

      {/* Connected Mentors Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Mentors</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {connections.filter(c => c.status === 'ACCEPTED').map((connection) => (
            <Card key={connection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={connection.mentor.image} alt={connection.mentor.name} />
                  <AvatarFallback>{connection.mentor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{connection.mentor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {connection.mentor.mentorProfile.title}
                  </p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-sm">
                    {connection.mentor.mentorProfile.rating.toFixed(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {connection.mentor.mentorProfile.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/messages?connectionId=${connection.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Video className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {connections.filter(c => c.status === 'ACCEPTED').length === 0 && (
            <Card className="col-span-full p-6 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't connected with any mentors yet.
              </p>
              <Link href="/dashboard/find-mentors">
                <Button>Find Mentors</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Pending Requests Section */}
      {connections.filter(c => c.status === 'PENDING').length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {connections.filter(c => c.status === 'PENDING').map((connection) => (
              <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={connection.mentor.image} alt={connection.mentor.name} />
                    <AvatarFallback>{connection.mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{connection.mentor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {connection.mentor.mentorProfile.title}
                    </p>
                  </div>
                  <Badge>Pending</Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Mentors Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recommended Mentors</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topMentors.slice(0, 3).map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentor.user.image} alt={mentor.user.name} />
                  <AvatarFallback>{mentor.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{mentor.user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-sm">{mentor.rating.toFixed(1)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Link href="/dashboard/find-mentors">
                  <Button className="w-full">View Profile</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 