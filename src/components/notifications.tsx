import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  type: 'message' | 'connection';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sender: {
    name: string;
    image: string;
  };
  metadata?: {
    connectionId?: string;
    messageId?: string;
  };
}

export function Notifications() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.10;

    if (session?.user?.id) {
      setupPusher();
      fetchNotifications();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
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
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.error('Pusher configuration is missing');
        return;
      }

      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      const channel = pusher.subscribe(`user-${session?.user?.id}`);

      // Listen for new messages
      channel.bind('new-message', (data: any) => {
        // Only create notification if user is not on the messages page
        if (!window.location.pathname.includes('/messages')) {
          const newNotification: Notification = {
            id: data.id,
            type: 'message',
            title: 'New Message',
            message: `${data.sender.name}: ${data.content}`,
            timestamp: new Date().toISOString(),
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
        const newNotification: Notification = {
          id: data.id,
          type: 'connection',
          title: 'Connection Request',
          message: `${data.mentee.name} wants to connect with you!`,
          timestamp: new Date().toISOString(),
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
        const newNotification: Notification = {
          id: data.connection.id,
          type: 'connection',
          title: 'Connection Response',
          message: data.message,
          timestamp: new Date().toISOString(),
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
        router.push(`/dashboard/${session?.user?.role.toLowerCase()}/messages?connectionId=${notification.metadata.connectionId}`);
      } else if (notification.type === 'connection') {
        router.push(`/dashboard/${session?.user?.role.toLowerCase()}`);
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    !notification.read && "bg-gray-50 dark:bg-gray-800/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.sender.image} />
                      <AvatarFallback>
                        {notification.sender.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No notifications
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 