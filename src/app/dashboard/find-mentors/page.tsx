'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface MentorProfile {
  id: string;
  userId: string;
  title: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  user: {
    name: string;
    image: string;
  };
}

interface Connection {
  mentorId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export default function FindMentorsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  useEffect(() => {
    fetchMentors();
    fetchConnections();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/mentors/list');
      if (!response.ok) throw new Error('Failed to fetch mentors');
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast({
        title: "Error",
        description: "Failed to load mentors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections/mentee');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const sendConnectionRequest = async (mentorId: string) => {
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send request');

      // Add the new connection to the local state
      setConnections(prev => [...prev, { mentorId, status: 'PENDING' }]);

      toast({
        title: "Success",
        description: "Connection request sent successfully!",
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = (mentorId: string) => {
    return connections.find(c => c.mentorId === mentorId)?.status;
  };

  const getButtonConfig = (mentorId: string) => {
    if (session?.user?.id === mentorId) {
      return {
        text: 'Your Profile',
        disabled: true,
        variant: 'outline' as const,
      };
    }

    const status = getConnectionStatus(mentorId);
    switch (status) {
      case 'PENDING':
        return {
          text: 'Request Pending',
          disabled: true,
          variant: 'secondary' as const,
        };
      case 'ACCEPTED':
        return {
          text: 'Connected',
          disabled: true,
          variant: 'outline' as const,
        };
      case 'REJECTED':
        return {
          text: 'Request Rejected',
          disabled: true,
          variant: 'destructive' as const,
        };
      default:
        return {
          text: 'Connect',
          disabled: false,
          variant: 'default' as const,
          onClick: () => sendConnectionRequest(mentorId),
        };
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExpertise = expertiseFilter === "all" || mentor.expertise.includes(expertiseFilter);

    const matchesPriceRange = priceRange === "all" || (
      priceRange === "0-50" ? mentor.hourlyRate <= 50 :
      priceRange === "51-100" ? mentor.hourlyRate > 50 && mentor.hourlyRate <= 100 :
      priceRange === "101+" ? mentor.hourlyRate > 100 : true
    );

    return matchesSearch && matchesExpertise && matchesPriceRange;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={setExpertiseFilter} value={expertiseFilter || "all"}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by expertise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expertise</SelectItem>
            <SelectItem value="frontend">Frontend Development</SelectItem>
            <SelectItem value="backend">Backend Development</SelectItem>
            <SelectItem value="mobile">Mobile Development</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="ai">AI/ML</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setPriceRange} value={priceRange || "all"}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            <SelectItem value="0-50">Rs. 0-50/hr</SelectItem>
            <SelectItem value="51-100">Rs. 51-100/hr</SelectItem>
            <SelectItem value="101+">Rs. 101+/hr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
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
              <p className="text-sm text-muted-foreground line-clamp-3">{mentor.bio}</p>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  Rs. {mentor.hourlyRate}/hr
                </span>
                {(() => {
                  const config = getButtonConfig(mentor.userId);
                  return (
                    <Button
                      variant={config.variant}
                      disabled={config.disabled}
                      onClick={config.onClick}
                    >
                      {config.text}
                    </Button>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 