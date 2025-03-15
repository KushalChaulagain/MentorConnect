"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";

// Use the existing notification interface from the app
interface Notification {
  id: string;
  type: 'message' | 'connection' | 'session' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sender?: {
    name: string;
    image: string;
  };
  metadata?: {
    connectionId?: string;
    messageId?: string;
    sessionId?: string;
  };
}

export function EnhancedNotifications() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio("/sounds/notification.mp3");
    if (audioRef.current) {
      audioRef.current.volume = 0.10;
    }

    let cleanupPusher: (() => void) | undefined;
    
    if (session?.user?.id) {
      cleanupPusher = setupPusher();
      fetchNotifications();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      
      // Execute Pusher cleanup function if it exists
      if (cleanupPusher) {
        cleanupPusher();
      }
    };
  }, [session?.user?.id]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    }
  };

  const setupPusher = () => {
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

      if (!pusherKey) {
        console.error('Pusher configuration is missing');
        return;
      }

      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      const channel = pusher.subscribe(`user-${session?.user?.id}`);

      // Listen for new messages
      channel.bind('notification-message', (data: any) => {
        // Only create notification if user is not on the messages page
        if (!window.location.pathname.includes('/messages')) {
          const timestamp = new Date().toISOString();
          const newNotification: Notification = {
            id: data.id,
            type: 'message',
            title: 'New Message',
            message: `${data.sender.name}: ${data.content}`,
            timestamp: timestamp,
            read: false,
            sender: data.sender,
            metadata: {
              connectionId: data.connectionId,
              messageId: data.id
            }
          };
          addNotification(newNotification);
          playNotificationSound();
        }
      });

      // Listen for connection requests/responses
      channel.bind('connection-request', (data: any) => {
        const timestamp = new Date().toISOString();
        const newNotification: Notification = {
          id: data.id,
          type: 'connection',
          title: 'Connection Request',
          message: `${data.mentee.name} wants to connect with you!`,
          timestamp: timestamp,
          read: false,
          sender: data.mentee,
          metadata: {
            connectionId: data.id
          }
        };
        addNotification(newNotification);
        playNotificationSound();
      });

      channel.bind('connection-response', (data: any) => {
        const timestamp = new Date().toISOString();
        const newNotification: Notification = {
          id: data.connection.id,
          type: 'connection',
          title: 'Connection Response',
          message: data.message,
          timestamp: timestamp,
          read: false,
          sender: data.connection.mentor,
          metadata: {
            connectionId: data.connection.id
          }
        };
        addNotification(newNotification);
        playNotificationSound();
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
      updateUnreadCount(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      await markAsRead(notification.id);

      // Navigate based on notification type
      if (notification.type === 'message' && notification.metadata?.connectionId) {
        router.push(`/dashboard/${session?.user?.role?.toLowerCase()}/messages?connectionId=${notification.metadata.connectionId}`);
      } else if (notification.type === 'connection') {
        router.push(`/dashboard/${session?.user?.role?.toLowerCase()}`);
      } else if (notification.type === 'session' && notification.metadata?.sessionId) {
        router.push(`/dashboard/sessions/${notification.metadata.sessionId}`);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // This assumes you have an API endpoint for marking all as read
      // If not, you'll need to adapt this to mark them one by one
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "connection":
        return <div className="rounded-full bg-emerald-500/20 p-2 h-8 w-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>;
      case "session":
        return <div className="rounded-full bg-blue-500/20 p-2 h-8 w-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
        </div>;
      case "message":
        return <div className="rounded-full bg-violet-500/20 p-2 h-8 w-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </div>;
      default:
        return <div className="rounded-full bg-gray-500/20 p-2 h-8 w-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        </div>;
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    // Handle missing or invalid timestamp
    if (!timestamp) {
      return "Recently";
    }
    
    // Try to create a valid date object
    const date = new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Recently"; // Fallback for invalid dates
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? "Yesterday" : `${days} days ago`;
    }
    
    // For older notifications, return the formatted date with error handling
    try {
      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-[#111218] border-gray-800 hover:border-[#00C6FF]/50 hover:bg-[#111A28] transition-all duration-300"
        >
          <Bell className="h-5 w-5 text-cyan-400" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#3949AB] to-[#4A5BC7] p-0 text-[10px] text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 overflow-hidden rounded-xl border-gray-800 bg-[#111218] p-0 shadow-xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between border-b border-gray-800 px-4 py-3 text-white">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-[11px] font-normal text-cyan-400 hover:bg-[#3949AB]/10 hover:text-cyan-300"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>

        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A25]">
                <Bell className="h-6 w-6 text-cyan-400 opacity-60" />
              </div>
              <p className="mt-3 font-medium text-white">No notifications</p>
              <p className="text-sm text-gray-400">
                When you have notifications, they'll appear here
              </p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border-b border-gray-800/80 px-4 py-3 hover:bg-[#191925] focus:bg-[#191925]",
                    !notification.read && "bg-slate-900/40"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.sender?.image ? (
                    <Avatar className="h-8 w-8 border border-gray-700">
                      <AvatarImage src={notification.sender.image} alt={notification.sender.name || "User"} />
                      <AvatarFallback className="bg-[#3949AB]/20 text-[#00C6FF]">
                        {notification.sender.name?.substring(0, 2).toUpperCase() || "UN"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    getNotificationIcon(notification.type)
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="whitespace-nowrap text-[10px] text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-300">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>

        <div className="border-t border-gray-800 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-lg py-2 text-xs font-medium text-cyan-400 hover:bg-[#3949AB]/10 hover:text-cyan-300"
            asChild
          >
            <Link href="/dashboard/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 