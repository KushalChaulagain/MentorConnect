import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Briefcase, Code, Home, MessageSquare, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-800 bg-[#0F1729] text-white">
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          <div className="px-6 py-2">
            <h2 className="text-xl font-semibold tracking-tight">MentorConnect</h2>
          </div>
          <nav className="space-y-1 px-3">
            <Button
              variant="ghost"
              className={`w-full justify-start hover:bg-white/10 ${
                pathname === '/dashboard' ? 'bg-white/10' : ''
              }`}
              asChild
            >
              <Link href="/dashboard" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Overview
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start hover:bg-white/10 ${
                pathname.includes('/find-mentors') ? 'bg-white/10' : ''
              }`}
              asChild
            >
              <Link href="/dashboard/find-mentors" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Find Mentors
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start hover:bg-white/10 ${
                pathname.includes('/jobs') ? 'bg-white/10' : ''
              }`}
              asChild
            >
              <Link href="/dashboard/jobs" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                My Jobs
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start hover:bg-white/10 ${
                pathname.includes('/code-review') ? 'bg-white/10' : ''
              }`}
              asChild
            >
              <Link href="/dashboard/code-review" className="flex items-center">
                <Code className="mr-2 h-4 w-4" />
                Code Review
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start hover:bg-white/10 ${
                pathname.includes('/messages') ? 'bg-white/10' : ''
              }`}
              asChild
            >
              <Link href="/dashboard/messages" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start hover:bg-white/10 ${
                pathname.includes('/settings') ? 'bg-white/10' : ''
              }`}
              asChild
            >
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>
        </div>
      </ScrollArea>
    </div>
  )
}

