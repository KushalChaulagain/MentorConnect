import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

interface ConnectionRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  mentee: {
    name: string;
    image: string;
  };
}

export function ConnectionNotifications() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPendingRequests();
      const cleanup = setupPusher();
      return () => {
        cleanup();
      };
    }
  }, [session?.user?.id]);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/connections/pending');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load connection requests",
        variant: "destructive",
      });
    }
  };

  const setupPusher = () => {
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;

      if (!pusherKey) {
        console.error('Pusher configuration is missing');
        return () => {};
      }

      const pusher = new Pusher(pusherKey, {
        cluster: 'ap2',
      });

      if (!session?.user?.id) {
        console.error('User session is not available');
        return () => {};
      }

      const channel = pusher.subscribe(`user-${session.user.id}`);
      
      channel.bind('connection-request', (data: ConnectionRequest) => {
        setRequests(prev => [...prev, data]);
        toast({
          title: "New Connection Request",
          description: `${data.mentee.name} wants to connect with you!`,
        });
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up Pusher:', error);
      return () => {};
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      if (!response.ok) throw new Error('Failed to respond to request');

      // Update local state
      setRequests(prev => prev.filter(req => req.id !== requestId));

      toast({
        title: "Success",
        description: `Connection request ${action}ed successfully!`,
      });
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Connection Requests</h2>
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarImage src={request.mentee.image} alt={request.mentee.name} />
              <AvatarFallback>{request.mentee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{request.mentee.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sent {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => handleRequest(request.id, 'accept')}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRequest(request.id, 'reject')}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 