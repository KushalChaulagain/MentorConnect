'use client';

import { CallDialog } from "@/components/call/CallDialog";
import { ModeToggle } from "@/components/mode-toggle";
import { Notifications } from "@/components/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Calendar, LayoutDashboard, MessageSquare, Search, Settings, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Pusher from 'pusher-js';
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [incomingCall, setIncomingCall] = useState<{
    channelName: string;
    isVideo: boolean;
    caller: {
      name: string;
      image: string;
    };
  } | null>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (session?.user) {
      console.log('Dashboard Layout - Session user data:', {
        name: session.user.name,
        image: session.user.image,
        email: session.user.email,
        status: status
      });
    }
  }, [session, status]);

  useEffect(() => {
    if (session?.user?.id) {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.error('Pusher configuration is missing');
        return;
      }

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

  const mentorSidebarItems = [
    {
      title: "Overview",
      href: "/dashboard/mentor",
      icon: LayoutDashboard,
    },
    {
      title: "Messages",
      href: "/dashboard/mentor/messages",
      icon: MessageSquare,
    },
    {
      title: "My Sessions",
      href: "/dashboard/sessions",
      icon: Calendar,
    },
    {
      title: "Availability",
      href: "/dashboard/availability",
      icon: Calendar,
    },
    {
      title: "Reviews",
      href: "/dashboard/mentor/reviews",
      icon: Star,
    },
    {
      title: "Settings",
      href: "/dashboard/mentor/settings",
      icon: Settings,
    },
  ];

  const menteeSidebarItems = [
    {
      title: "Overview",
      href: "/dashboard/mentee",
      icon: LayoutDashboard,
    },
    {
      title: "Messages",
      href: "/dashboard/mentee/messages",
      icon: MessageSquare,
    },
    {
      title: "Find Mentors",
      href: "/dashboard/find-mentors",
      icon: Search,
    },
    {
      title: "My Sessions",
      href: "/dashboard/sessions",
      icon: Calendar,
    },
    {
      title: "Settings",
      href: "/dashboard/mentee/settings",
      icon: Settings,
    },
  ];

  const sidebarItems = session?.user?.role === 'MENTOR' ? mentorSidebarItems : menteeSidebarItems;

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                MentorConnect
              </Link>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      pathname === item.href
                        ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-200"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-[#0F172A] border-b border-gray-800">
            <div className="flex items-center justify-between px-6 h-full">
              <div className="flex-1">
                {/* Left side empty for now */}
              </div>
              <div className="flex items-center gap-4">
                <ModeToggle />
                <Notifications />
                {session?.user ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-800">
                      {session.user.image ? (
                        <AvatarImage 
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', {
                              src: session.user.image,
                              error: e
                            });
                            setImageError(true);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', session.user.image);
                            setImageLoaded(true);
                            setImageError(false);
                          }}
                        />
                      ) : (
                        <AvatarFallback className="bg-gray-800 text-gray-200">
                          {session.user.name ? session.user.name.slice(0, 2).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                      {imageError && (
                        <AvatarFallback className="bg-gray-800 text-gray-200">
                          {session.user.name ? session.user.name.slice(0, 2).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-200">
                        {session.user.name?.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
                )}
              </div>
            </div>
          </div>
          <main className="py-6 px-4 sm:px-6 md:px-8">{children}</main>
        </div>
      </div>

      {/* Global Call Dialog */}
      {incomingCall && (
        <CallDialog
          isOpen={isCallDialogOpen}
          onClose={() => {
            setIsCallDialogOpen(false);
            setIncomingCall(null);
          }}
          channelName={incomingCall.channelName}
          isVideo={incomingCall.isVideo}
          callerName={incomingCall.caller.name}
          callerImage={incomingCall.caller.image}
          isIncoming={true}
        />
      )}
    </div>
  );
} 