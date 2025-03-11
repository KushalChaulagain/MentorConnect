'use client';

import { CallDialog } from "@/components/call/CallDialog";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    Bell,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Grid3X3,
    HelpCircle,
    History,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Search,
    Settings,
    Star,
    User,
    Users
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Pusher from 'pusher-js';
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      title: "Dashboard",
      href: "/dashboard/mentor",
      icon: LayoutDashboard,
    },
    {
      title: "Messages",
      href: "/dashboard/mentor/messages",
      icon: MessageSquare,
      badge: 3, // Example badge count
    },
    {
      title: "My Sessions",
      href: "/dashboard/sessions",
      icon: Calendar,
    },
    {
      title: "Availability",
      href: "/dashboard/availability",
      icon: Clock,
    },
    {
      title: "Mentees",
      href: "/dashboard/mentor/mentees",
      icon: Users,
    },
    {
      title: "Reviews",
      href: "/dashboard/mentor/reviews",
      icon: Star,
    },
    {
      title: "History",
      href: "/dashboard/mentor/history",
      icon: History,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/dashboard/mentor/settings",
      icon: Settings,
    },
  ];

  const menteeSidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard/mentee",
      icon: LayoutDashboard,
    },
    {
      title: "Messages",
      href: "/dashboard/mentee/messages",
      icon: MessageSquare,
      badge: 1, // Example badge count
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
      title: "My Learning",
      href: "/dashboard/mentee/learning",
      icon: Grid3X3,
    },
    {
      title: "History",
      href: "/dashboard/mentee/history",
      icon: History,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/dashboard/mentee/settings",
      icon: Settings,
    },
  ];

  const sidebarItems = session?.user?.role === 'MENTOR' ? mentorSidebarItems : menteeSidebarItems;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar toggle */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  MentorConnect
                </span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="py-4">
              {sidebarItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium",
                    pathname === item.href
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-l-4 border-indigo-600 dark:border-indigo-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="px-4 py-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                    {session?.user?.image && !imageError ? (
                      <AvatarImage 
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarFallback className="bg-indigo-600 text-white">
                        {session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.email || ""}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-gray-700 dark:text-gray-300"
                    onClick={() => router.push('/dashboard/support')}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-gray-700 dark:text-gray-300"
                    onClick={() => router.push('/api/auth/signout')}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-30 hidden md:block",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                MentorConnect
              </span>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              sidebarCollapsed && "mx-auto"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <nav className="py-4">
          <TooltipProvider>
            {sidebarItems.map((item) => (
              <Tooltip key={item.title} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center py-3 text-sm font-medium my-1 relative",
                      pathname === item.href
                        ? "text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50",
                      sidebarCollapsed ? "justify-center px-0" : "px-4"
                    )}
                  >
                    {pathname === item.href && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                    )}
                    <item.icon className={cn(
                      "h-5 w-5", 
                      pathname === item.href 
                        ? "text-indigo-600 dark:text-indigo-300" 
                        : "text-gray-500 dark:text-gray-400"
                    )} />
                    
                    {!sidebarCollapsed && (
                      <span className="ml-3 flex-1">{item.title}</span>
                    )}
                    
                    {!sidebarCollapsed && item.badge && (
                      <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                    
                    {sidebarCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700",
          sidebarCollapsed ? "text-center" : ""
        )}>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center",
                  sidebarCollapsed ? "justify-center" : "space-x-3"
                )}>
                  <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                    {session?.user?.image && !imageError ? (
                      <AvatarImage 
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        onError={() => setImageError(true)}
                        onLoad={() => setImageLoaded(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarFallback className="bg-indigo-600 text-white">
                        {session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session?.user?.email || ""}
                      </p>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {sidebarCollapsed && session?.user?.name && (
                <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                  <div>
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs opacity-80">{session.user.email}</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 w-full">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            {/* Left: Search */}
            <div className="relative max-w-md w-full hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ModeToggle />
              
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 flex h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </div>
              
              {/* More Actions on Mobile */}
              <div className="sm:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
          {children}
        </main>
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