'use client';

import { CallDialog } from "@/components/call/CallDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Phone, Search, Send, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from "react";

interface Connection {
  id: string;
  mentorId: string;
  menteeId: string;
  status: string;
  mentee: {
    id: string;
    name: string;
    image: string;
  };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    name: string;
    image: string;
  };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    channelName: string;
    isVideo: boolean;
    caller: {
      name: string;
      image: string;
    };
  } | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      fetchMessages(selectedConnection.id);
      setupPusher(selectedConnection.id);
    }
  }, [selectedConnection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session?.user?.id) {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) return;

      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      const channel = pusher.subscribe(`user-${session.user.id}`);
      
      channel.bind('incoming-call', (data: any) => {
        setIncomingCall(data);
        setIsCallDialogOpen(true);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`user-${session.user.id}`);
      };
    }
  }, [session?.user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections/list');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/messages/${connectionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const setupPusher = (connectionId: string) => {
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.error('Pusher configuration is missing. Please check your .env.local file.');
        return () => {};
      }

      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
      });

      // Add connection monitoring
      let connectionAttempts = 0;
      const maxConnectionAttempts = 5;

      pusher.connection.bind('state_change', (states: any) => {
        const currentState = states.current;
        console.log('Pusher connection state changed:', currentState, {
          key: pusherKey,
          cluster: pusherCluster
        });
        
        if (currentState === 'connected') {
          console.log('Successfully connected to Pusher');
          connectionAttempts = 0; // Reset attempts on successful connection
          toast({
            title: "Connected",
            description: "Real-time messaging is now active",
          });
        }
        if (currentState === 'disconnected' || currentState === 'failed') {
          connectionAttempts++;
          console.log(`Attempting to reconnect... (Attempt ${connectionAttempts}/${maxConnectionAttempts})`, {
            key: pusherKey,
            cluster: pusherCluster
          });
          
          if (connectionAttempts < maxConnectionAttempts) {
            setTimeout(() => {
              console.log('Reconnecting with config:', {
                key: pusherKey,
                cluster: pusherCluster
              });
              pusher.connect();
            }, 3000);
          } else {
            console.error('Max reconnection attempts reached', {
              key: pusherKey,
              cluster: pusherCluster
            });
            toast({
              title: "Connection Failed",
              description: "Unable to establish real-time connection. Please refresh the page.",
              variant: "destructive",
            });
          }
        }
      });

      pusher.connection.bind('error', (err: any) => {
        console.error('Pusher connection error:', {
          error: err,
          config: {
            key: pusherKey,
            cluster: pusherCluster
          }
        });
        
        // Only show toast and attempt reconnect if under max attempts
        if (connectionAttempts < maxConnectionAttempts) {
          toast({
            title: "Connection Error",
            description: "Attempting to reconnect...",
            variant: "destructive",
          });
        }
      });

      const channel = pusher.subscribe(`chat-${connectionId}`);
      
      channel.bind('new-message', (message: Message) => {
        setMessages(prev => [...prev, message]);
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection || !newMessage.trim()) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: selectedConnection.id,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const startCall = async (isVideo: boolean) => {
    if (!selectedConnection) return;

    try {
      const response = await fetch('/api/call/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedConnection.mentee.id,
          channelName: selectedConnection.id,
          isVideo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      setIsVideoCall(isVideo);
      setIsCallDialogOpen(true);
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start call. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)]">
      <div className="grid grid-cols-12 h-full gap-4">
        {/* Contacts List */}
        <Card className="col-span-4 bg-white dark:bg-gray-800">
          <CardHeader className="p-4 space-y-4">
            <CardTitle className="text-xl">Messages</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  onClick={() => setSelectedConnection(connection)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedConnection?.id === connection.id
                      ? "bg-indigo-50 dark:bg-indigo-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={connection.mentee.image} alt={connection.mentee.name} />
                      <AvatarFallback>{connection.mentee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {connection.mentee.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Click to start chatting
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 bg-white dark:bg-gray-800">
          {selectedConnection ? (
            <>
              <CardHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={selectedConnection.mentee.image} alt={selectedConnection.mentee.name} />
                      <AvatarFallback>{selectedConnection.mentee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedConnection.mentee.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mentee
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => startCall(false)}
                    >
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => startCall(true)}
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[calc(100vh-16rem)] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === session?.user?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[70%] ${
                          message.senderId === session?.user?.id ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.image} alt={message.sender.name} />
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.senderId === session?.user?.id
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={sendMessage} className="border-t pt-4 flex gap-2">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </Card>
      </div>
      {selectedConnection && (
        <CallDialog
          isOpen={isCallDialogOpen}
          onClose={() => {
            setIsCallDialogOpen(false);
            setIncomingCall(null);
          }}
          channelName={incomingCall?.channelName || selectedConnection.id}
          isVideo={incomingCall?.isVideo || isVideoCall}
          callerName={incomingCall?.caller?.name || selectedConnection.mentee.name}
          callerImage={incomingCall?.caller?.image || selectedConnection.mentee.image}
          isIncoming={!!incomingCall}
        />
      )}
    </div>
  );
} 