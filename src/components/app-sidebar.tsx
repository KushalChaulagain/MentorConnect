"use client"

import {
  BookOpen,
  Calendar,
  Clock,
  Command,
  HelpCircle,
  History,
  LayoutDashboard,
  MessageSquare,
  Search,
  Send,
  Settings,
  Star,
  User,
  Users
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  showMessages?: boolean;
  setShowMessages?: (show: boolean) => void;
}

export function AppSidebar({ showMessages = false, setShowMessages, ...props }: AppSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useSidebar()

  const toggleMessages = (e: React.MouseEvent) => {
    e.preventDefault()
    if (setShowMessages) {
      setShowMessages(!showMessages)
    }
  }

  const getMentorNavItems = React.useMemo(() => [
    {
      title: "Dashboard",
      url: "/dashboard/mentor",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard/mentor" && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "Messages",
      url: "#",
      icon: MessageSquare,
      isActive: showMessages,
      onClick: toggleMessages
    },
    {
      title: "Sessions",
      url: "/dashboard/sessions",
      icon: Calendar,
      isActive: pathname.includes("/dashboard/sessions") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "Availability",
      url: "/dashboard/availability",
      icon: Clock,
      isActive: pathname.includes("/dashboard/availability") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "Mentees",
      url: "/dashboard/mentor/mentees",
      icon: Users,
      isActive: pathname.includes("/dashboard/mentor/mentees") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User,
      isActive: pathname.includes("/dashboard/profile") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
  ], [pathname, showMessages, setShowMessages, toggleMessages])

  const getMenteeNavItems = React.useMemo(() => [
    {
      title: "Dashboard",
      url: "/dashboard/mentee",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard/mentee" && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "Messages",
      url: "#",
      icon: MessageSquare,
      isActive: showMessages,
      onClick: toggleMessages
    },
    {
      title: "Find Mentors",
      url: "/dashboard/find-mentors",
      icon: Search,
      isActive: pathname.includes("/dashboard/find-mentors") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "Sessions",
      url: "/dashboard/sessions",
      icon: Calendar,
      isActive: pathname.includes("/dashboard/sessions") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "My Learning",
      url: "/dashboard/mentee/learning",
      icon: BookOpen,
      isActive: pathname.includes("/dashboard/mentee/learning") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User,
      isActive: pathname.includes("/dashboard/profile") && !showMessages,
      onClick: () => {
        if (setShowMessages) setShowMessages(false)
      }
    },
  ], [pathname, showMessages, setShowMessages, toggleMessages])

  const navSecondaryItems = [
    {
      title: "Help & Support",
      url: "/dashboard/support",
      icon: HelpCircle,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Send,
    },
  ]

  const userData = {
    user: {
      name: session?.user?.name || "User",
      email: session?.user?.email || "",
      avatar: session?.user?.image || "",
    }
  }

  // Projects section customized for MentorConnect - show based on role
  const projectItems = React.useMemo(() => [
    {
      name: session?.user?.role === 'MENTOR' ? "Reviews" : "Favorites",
      url: session?.user?.role === 'MENTOR' ? "/dashboard/mentor/reviews" : "/dashboard/mentee/favorites",
      icon: Star,
    },
    {
      name: "History",
      url: session?.user?.role === 'MENTOR' ? "/dashboard/mentor/history" : "/dashboard/mentee/history",
      icon: History,
    },
    {
      name: "Settings",
      url: session?.user?.role === 'MENTOR' ? "/dashboard/mentor/settings" : "/dashboard/mentee/settings",
      icon: Settings,
    },
  ], [session?.user?.role])

  const navItems = session?.user?.role === 'MENTOR' ? getMentorNavItems : getMenteeNavItems

  return (
    <Sidebar 
      variant="inset" 
      {...props}
    >
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MentorConnect</span>
                  <span className="truncate text-xs">{session?.user?.role || "User"}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent >
        <NavMain items={navItems} />
        <NavProjects projects={projectItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter >
        <NavUser user={userData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
