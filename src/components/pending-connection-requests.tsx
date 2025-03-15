"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

type PendingRequest = {
  id: string;
  mentee: {
    name: string;
    image: string;
  };
  createdAt: string;
};

export function PendingConnectionRequests() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/connections/pending');
      if (!response.ok) throw new Error('Failed to fetch pending requests');
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast({
        title: "Error",
        description: "Failed to load pending connection requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      // Remove the request from the list
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));

      toast({
        title: action === 'accept' ? "Connection Accepted" : "Connection Rejected",
        description: action === 'accept' 
          ? "You are now connected with this mentee" 
          : "You have rejected this connection request",
        variant: action === 'accept' ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} the connection request`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6">
        <CardContent className="p-4 flex justify-center">
          <p className="text-muted-foreground">Loading pending requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No pending connection requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {pendingRequests.map((request) => (
        <Card 
          key={request.id} 
          className="bg-[#111218] border-dashed border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12 border border-gray-700">
              <AvatarImage src={request.mentee.image} alt={request.mentee.name} />
              <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                {request.mentee.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-white">{request.mentee.name}</CardTitle>
              <CardDescription className="text-xs text-[#E0E0E0]">
                Requested on {formatDate(request.createdAt)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-2 justify-center mt-2">
              <Button 
                onClick={() => handleRequest(request.id, 'accept')}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 transition-all border-0 text-white"
                size="sm"
              >
                <Check className="mr-1 h-4 w-4" />
                Accept
              </Button>
              <Button 
                onClick={() => handleRequest(request.id, 'reject')}
                variant="outline" 
                size="sm"
                className="flex-1 border-gray-700 bg-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-red-600 transition-colors text-gray-400"
              >
                <X className="mr-1 h-4 w-4" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 