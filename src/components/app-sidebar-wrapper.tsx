'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { CallDialog } from "@/components/call/CallDialog";
import { MessagesComponent } from "@/components/messages-component";
import ProfileCompletionCheck from "@/components/ProfileCompletionCheck";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Pusher from 'pusher-js';
import { useEffect, useState } from "react";

export function AppSidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showMessages, setShowMessages] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    channelName: string;
    isVideo: boolean;
    caller: {
      name: string;
      image: string;
    };
  } | null>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  // Effect to determine the current user role as early as possible
  useEffect(() => {
    if (status === "loading") return;
    
    if (session?.user?.role) {
      setPageReady(true);
    } else {
      // If no session but we're done loading, we should redirect to login
      if (status === "unauthenticated") {
        router.push('/login');
      }
    }
  }, [session, status, router]);

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

  // Reset message view when route changes
  useEffect(() => {
    if (pathname !== '/dashboard/messages') {
      setShowMessages(false);
    }
  }, [pathname]);

  // Get page title based on current path
  const getPageTitle = () => {
    if (showMessages) return 'Messages';
    if (pathname.includes('/dashboard/mentor')) return 'Mentor Dashboard';
    if (pathname.includes('/dashboard/mentee')) return 'Mentee Dashboard';
    if (pathname.includes('/dashboard/profile')) return 'Profile';
    if (pathname.includes('/dashboard/messages')) return 'Messages';
    if (pathname.includes('/dashboard/sessions')) return 'Sessions';
    if (pathname.includes('/dashboard/availability')) return 'Availability';
    if (pathname.includes('/dashboard/find-mentors')) return 'Find Mentors';
    return 'Dashboard';
  };

  // If still loading or we don't have user role information, show a loading state
  if (!pageReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Wrap children with ProfileCompletionCheck based on path
  const getContent = () => {
    if (showMessages) {
      return (
        <div className="h-[calc(100vh-6rem)]">
          <MessagesComponent />
        </div>
      );
    }
    
    if (pathname.includes('/dashboard/mentor')) {
      return <ProfileCompletionCheck type="MENTOR">{children}</ProfileCompletionCheck>;
    }
    
    if (pathname.includes('/dashboard/mentee')) {
      return <ProfileCompletionCheck type="MENTEE">{children}</ProfileCompletionCheck>;
    }
    
    return children;
  };

  return (
    <SidebarProvider>
      <AppSidebar showMessages={showMessages} setShowMessages={setShowMessages} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    MentorConnect
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        {getContent()}
        
      </SidebarInset>
      
      {/* Call dialog */}
      {incomingCall && (
        <CallDialog
          isOpen={isCallDialogOpen}
          onClose={() => {
            setIsCallDialogOpen(false);
            setIncomingCall(null);
          }}
          callerName={incomingCall.caller.name}
          callerImage={incomingCall.caller.image}
          channelName={incomingCall.channelName}
          isVideo={incomingCall.isVideo}
          isIncoming={true}
        />
      )}
    </SidebarProvider>
  );
} 