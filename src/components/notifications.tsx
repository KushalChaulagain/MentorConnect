import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        <Bell className="h-5 w-5 text-gray-400 hover:text-gray-200 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-medium flex items-center justify-center bg-red-500 text-white rounded-full">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-sm text-gray-400 text-center">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium flex-1">{notification.title}</span>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-400">{notification.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleDateString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 