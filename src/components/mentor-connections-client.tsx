"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, UserX } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { useEffect, useState } from "react";

type Connection = {
  id: string;
  mentee: {
    id: string;
    name: string;
    image: string;
    title?: string;
  };
  createdAt: string;
  status: string;
};

export function MentorConnectionsClient({ session }: { session: Session | null }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/connections/list');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      
      // Filter for accepted connections only
      const acceptedConnections = data.filter(
        (connection: Connection) => connection.status === 'ACCEPTED'
      );
      
      setConnections(acceptedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!confirm("Are you sure you want to remove this connection?")) {
      return;
    }
    
    try {
      const response = await fetch('/api/connections/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) throw new Error('Failed to remove connection');

      // Remove the connection from the list
      setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));

      toast({
        title: "Connection Removed",
        description: "You have successfully removed this connection",
        variant: "default",
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove the connection",
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
          <p className="text-muted-foreground">Loading connections...</p>
        </CardContent>
      </Card>
    );
  }

  if (connections.length === 0) {
    return (
      <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6">
        <CardContent className="p-4 text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-[#3949AB]/10 p-6">
              <UserX className="h-10 w-10 text-[#00C6FF] opacity-70" />
            </div>
            <h3 className="text-xl font-medium text-white">No Active Connections</h3>
            <p className="text-muted-foreground max-w-md">
              You don't have any active connections with mentees yet. They will appear here once mentees connect with you and you accept their requests.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {connections.map((connection) => (
        <Card 
          key={connection.id} 
          className="bg-[#111218] border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12 border border-gray-700">
              <AvatarImage src={connection.mentee.image} alt={connection.mentee.name} />
              <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                {connection.mentee.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-white">{connection.mentee.name}</CardTitle>
              <CardDescription className="text-xs text-[#E0E0E0]">
                {connection.mentee.title || "Mentee"} • Connected since {formatDate(connection.createdAt)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="flex gap-2 pt-4 border-t border-gray-800">
            <Button 
              asChild
              variant="outline" 
              size="sm"
              className="flex-1 border-gray-700 bg-transparent hover:bg-[#3949AB]/10 hover:text-[#00C6FF] transition-colors"
            >
              <Link href={`/dashboard/mentor/messages?connectionId=${connection.id}`}>
                <MessageSquare className="mr-1 h-4 w-4" />
                Message
              </Link>
            </Button>
            <Button 
              onClick={() => handleRemoveConnection(connection.id)}
              variant="outline" 
              size="sm"
              className="flex-1 border-gray-700 bg-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-red-600 transition-colors text-gray-400"
            >
              <UserX className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 