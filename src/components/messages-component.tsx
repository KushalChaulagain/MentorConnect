'use client';

import { CallDialog } from "@/components/call/CallDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Phone, Search, Send, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from "react";

// Add type declaration for window.messagePusher
declare global {
  interface Window {
    messagePusher?: Pusher;
  }
}

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

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  mentorProfile: {
    id: string;
    user: {
      id: string;
      name: string;
      image: string;
    };
  };
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

// This component merges functionality from both mentor and mentee message pages
export function MessagesComponent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedItem, setSelectedItem] = useState<Connection | Booking | null>(null);
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

  const isMentor = session?.user?.role === 'MENTOR';

  useEffect(() => {
    if (session?.user?.id) {
      if (isMentor) {
        fetchMentorConnections();
      } else {
        fetchMenteeConnections();
      }
    }
  }, [isMentor, session?.user?.id]);

  useEffect(() => {
    if (selectedItem) {
      fetchMessages(selectedItem.id);
      setupPusher(selectedItem.id);
    }
  }, [selectedItem]);

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

  const fetchMentorConnections = async () => {
    try {
      const response = await fetch('/api/connections/list');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
      if (data.length > 0) {
        setSelectedItem(data[0]);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMenteeConnections = async () => {
    try {
      const response = await fetch('/api/connections/mentee');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
      if (data.length > 0) {
        setSelectedItem(data[0]);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
      if (data.length > 0) {
        setSelectedItem(data[0]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (itemId: string) => {
    try {
      const response = await fetch(`/api/messages/${itemId}`);
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

  const setupPusher = (itemId: string) => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) return;

    // Clean up previous Pusher subscription
    window.messagePusher?.unsubscribe(`chat-${itemId}`);
    window.messagePusher?.disconnect();

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe(`chat-${itemId}`);
    
    channel.bind('new-message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    window.messagePusher = pusher;

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`chat-${itemId}`);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newMessage.trim()) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: selectedItem.id,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

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
    if (!selectedItem) return;

    try {
      // Determine recipient ID based on user role and selected item type
      let recipientId;
      if (isMentor) {
        // For mentor, the recipient is the mentee
        recipientId = 'mentee' in selectedItem ? selectedItem.mentee.id : (selectedItem as any).mentee?.id;
      } else {
        // For mentee, the recipient is the mentor
        if ('mentorProfile' in selectedItem) {
          // It's a booking
          recipientId = selectedItem.mentorProfile.user.id;
        } else if ('mentorId' in selectedItem) {
          // It's a connection, use mentorId directly
          recipientId = selectedItem.mentorId;
        } else if ('mentor' in selectedItem) {
          // It might have a mentor object
          recipientId = (selectedItem as any).mentor.id;
        } else {
          recipientId = undefined;
        }
      }

      if (!recipientId) {
        throw new Error('Unable to determine call recipient');
      }

      const response = await fetch('/api/call/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          channelName: selectedItem.id,
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

  const getOtherUser = (item: Connection | Booking) => {
    if ('mentorProfile' in item) {
      // Item is a Booking
      return isMentor ? item.mentee : item.mentorProfile.user;
    } else if ('mentee' in item) {
      // Item is a Connection from mentor's perspective
      return (item as Connection).mentee;
    } else if ('mentor' in item) {
      // Item is a Connection from mentee's perspective
      return (item as any).mentor;
    } else {
      // Fallback if structure is unexpected
      return {
        id: 'unknown',
        name: 'Unknown User',
        image: ''
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const items = isMentor ? connections : connections.length > 0 ? connections : bookings;

  return (
    <div className="h-[calc(100vh-6rem)] p-5">
      <div className="grid grid-cols-12 h-full gap-4">
        {/* Contacts List */}
        <Card className="col-span-4 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <CardHeader className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl">Messages</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {items.length > 0 ? (
              <div className="space-y-0.5">
                {items.map((item) => {
                  const otherUser = getOtherUser(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 cursor-pointer transition-colors border-l-2 ${
                        selectedItem?.id === item.id
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-indigo-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={otherUser.image} alt={otherUser.name} />
                          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {otherUser.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Click to start chatting
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No connections yet</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {isMentor 
                    ? "You don't have any mentee connections yet." 
                    : "You don't have any mentor connections yet."}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = isMentor ? "/dashboard/mentor/mentees" : "/dashboard/find-mentors"}
                >
                  {isMentor ? "Find Mentees" : "Find Mentors"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col">
          {selectedItem ? (
            <>
              <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600">
                      <AvatarImage 
                        src={getOtherUser(selectedItem).image} 
                        alt={getOtherUser(selectedItem).name} 
                      />
                      <AvatarFallback>{getOtherUser(selectedItem).name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-sm font-medium">{getOtherUser(selectedItem).name}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => startCall(false)}
                      className="rounded-full h-9 w-9 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="sr-only">Audio Call</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => startCall(true)}
                      className="rounded-full h-9 w-9 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Video className="h-4 w-4" />
                      <span className="sr-only">Video Call</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)] bg-gray-50 dark:bg-gray-900/50">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${
                        message.senderId === session?.user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.senderId !== session?.user?.id && (
                        <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600">
                          <AvatarImage src={message.sender.image} alt={message.sender.name} />
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[70%] shadow-sm border ${
                          message.senderId === session?.user?.id
                            ? "bg-indigo-500 text-white border-indigo-600"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {message.senderId === session?.user?.id && (
                        <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2 items-center">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-full h-12 px-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">
                {items.length > 0 
                  ? "Select a conversation to start chatting" 
                  : "Connect with mentors/mentees to start messaging"}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Call dialog - only show if there's a selected item or incoming call */}
      {(selectedItem || incomingCall) && (
        <CallDialog
          isOpen={isCallDialogOpen}
          onClose={() => setIsCallDialogOpen(false)}
          callerName={incomingCall ? incomingCall.caller.name : session?.user?.name || ""}
          callerImage={incomingCall ? incomingCall.caller.image : session?.user?.image || ""}
          channelName={selectedItem?.id || incomingCall?.channelName || ""}
          isVideo={incomingCall ? incomingCall.isVideo : isVideoCall}
          isIncoming={!!incomingCall}
        />
      )}
    </div>
  );
} 