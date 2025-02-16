'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Phone, Search, Send, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from "react";

interface Connection {
  id: string;
  mentorId: string;
  menteeId: string;
  status: string;
  mentor: {
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
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    const connectionId = searchParams.get('connectionId');
    if (connectionId && connections.length > 0) {
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        setSelectedConnection(connection);
      }
    }
  }, [connections, searchParams]);

  useEffect(() => {
    if (selectedConnection) {
      fetchMessages(selectedConnection.id);
      const cleanup = setupPusher(selectedConnection.id);
      return () => {
        cleanup();
      };
    }
  }, [selectedConnection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection || !newMessage.trim()) return;

    try {
      // Optimistically add the message to the UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        senderId: session?.user?.id!,
        createdAt: new Date().toISOString(),
        sender: {
          name: session?.user?.name!,
          image: session?.user?.image!,
        },
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");
      scrollToBottom();

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

      if (!response.ok) {
        // Remove the optimistic message if the request failed
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Error from server:', data.error);
        toast({
          title: "Warning",
          description: "Message sent but real-time updates may be delayed",
          variant: "destructive",
        });
      }

      // Replace the optimistic message with the real one
      setMessages(prev => 
        prev.map(msg => msg.id === optimisticMessage.id ? data.message || data : msg)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const setupPusher = (connectionId: string) => {
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.error('Missing Pusher configuration:', { pusherKey, pusherCluster });
        toast({
          title: "Configuration Error",
          description: "Real-time updates are not available. Please refresh the page.",
          variant: "destructive",
        });
        return () => {};
      }

      console.log('Initializing Pusher with:', {
        key: pusherKey,
        cluster: pusherCluster,
        channel: `chat-${connectionId}`
      });

      // Initialize Pusher with explicit configuration
      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss', 'xhr_streaming', 'xhr_polling'],
        disabledTransports: [],
        wsHost: `ws-${pusherCluster}.pusher.com`,
        httpHost: `sockjs-${pusherCluster}.pusher.com`,
      });

      // Log the full Pusher configuration for debugging
      console.log('Full Pusher configuration:', {
        key: pusherKey,
        cluster: pusherCluster,
        wsHost: `ws-${pusherCluster}.pusher.com`,
        httpHost: `sockjs-${pusherCluster}.pusher.com`,
      });

      const channel = pusher.subscribe(`chat-${connectionId}`);
      
      channel.bind('new-message', (data: Message) => {
        console.log('Received new message:', data);
        
        // Only add the message if it's from another user
        if (data.senderId !== session?.user?.id) {
          setMessages(prev => {
            // Check if message already exists
            const messageExists = prev.some(m => m.id === data.id);
            if (messageExists) {
              console.log('Message already exists, skipping:', data.id);
              return prev;
            }
            console.log('Adding new message to state:', data.id);
            return [...prev, data];
          });
          scrollToBottom();
        }
      });

      // Monitor connection state
      pusher.connection.bind('state_change', (states: any) => {
        console.log('Pusher connection state changed:', {
          previous: states.previous,
          current: states.current
        });

        if (states.current === 'connected') {
          console.log('Successfully connected to Pusher');
          toast({
            title: "Connected",
            description: "Real-time messaging is active",
          });
        }
      });

      pusher.connection.bind('error', (err: any) => {
        console.error('Pusher connection error:', err);
        toast({
          title: "Connection Error",
          description: "Real-time updates may be delayed. Messages will still be sent.",
          variant: "destructive",
        });
      });

      return () => {
        console.log('Cleaning up Pusher connection');
        channel.unbind_all();
        pusher.unsubscribe(`chat-${connectionId}`);
        pusher.disconnect();
      };
    } catch (error) {
      console.error('Error setting up Pusher:', error);
      toast({
        title: "Connection Error",
        description: "Failed to initialize real-time updates",
        variant: "destructive",
      });
      return () => {};
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
                      <AvatarImage src={connection.mentor.image} alt={connection.mentor.name} />
                      <AvatarFallback>{connection.mentor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {connection.mentor.name}
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
                      <AvatarImage src={selectedConnection.mentor.image} alt={selectedConnection.mentor.name} />
                      <AvatarFallback>{selectedConnection.mentor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedConnection.mentor.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mentor
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
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
    </div>
  );
} 