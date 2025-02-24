"use client"

import Calendar from "@/components/Calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { BookingStatus } from "@prisma/client"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { View } from 'react-big-calendar'

interface Session {
  id: string
  startTime: string
  endTime: string
  status: BookingStatus
  mentorProfile: {
    user: {
      name: string
      email: string
    }
  }
  mentee: {
    name: string
    email: string
  }
}

export default function SessionsPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      if (!response.ok) throw new Error("Failed to fetch sessions")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSessionUpdate = async (sessionId: string, status: BookingStatus) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update session")

      await fetchSessions()
      setIsDialogOpen(false)
      toast({
        title: "Success",
        description: "Session status updated successfully.",
      })
    } catch (error) {
      console.error("Error updating session:", error)
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const calendarEvents = sessions.map((session) => ({
    id: session.id,
    title: `Session with ${session.mentorProfile.user.name}`,
    start: new Date(session.startTime),
    end: new Date(session.endTime),
    status: session.status,
    mentorName: session.mentorProfile.user.name,
    menteeName: session.mentee.name,
  }))

  const handleEventSelect = (event: any) => {
    const session = sessions.find((s) => s.id === event.id)
    if (session) {
      setSelectedSession(session)
      setIsDialogOpen(true)
    }
  }

  const handleViewChange = (newView: View) => {
    setView(newView)
  }

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'outline'
      case 'CONFIRMED':
        return 'secondary'
      case 'COMPLETED':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-6 bg-[#0F172A]">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-200">My Sessions</h1>
          <p className="text-sm text-gray-400">
            {format(date, 'MMMM yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-gray-800 bg-[#0F172A]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setMonth(date.getMonth() - 1);
                handleNavigate(newDate);
              }}
              className="h-8 w-8 p-0 rounded-none rounded-l-md text-gray-200 hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDate(new Date())}
              className="h-8 px-3 rounded-none border-l border-r border-gray-800 text-gray-200 hover:bg-gray-800"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setMonth(date.getMonth() + 1);
                handleNavigate(newDate);
              }}
              className="h-8 w-8 p-0 rounded-none rounded-r-md text-gray-200 hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={view} onValueChange={(v) => handleViewChange(v as View)}>
            <SelectTrigger className="h-8 w-[110px] bg-[#0F172A] border-gray-800 text-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0F172A] border-gray-800">
              <SelectItem value="month" className="text-gray-200 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">Month</SelectItem>
              <SelectItem value="week" className="text-gray-200 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">Week</SelectItem>
              <SelectItem value="day" className="text-gray-200 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-gray-800 bg-[#0F172A] overflow-hidden">
        <Calendar
          events={calendarEvents}
          onSelectEvent={handleEventSelect}
          isEditable={false}
          view={view as View}
          onViewChange={(view: string) => handleViewChange(view as View)}
          date={date}
          onNavigate={handleNavigate}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedSession && (
          <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-200">Session Details</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 mt-4">
                  <div className="grid gap-1">
                    <p className="text-xs font-medium text-gray-400">Mentor</p>
                    <p className="text-sm text-gray-200">{selectedSession.mentorProfile.user.name}</p>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs font-medium text-gray-400">Mentee</p>
                    <p className="text-sm text-gray-200">{selectedSession.mentee.name}</p>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs font-medium text-gray-400">Date</p>
                    <p className="text-sm text-gray-200">{format(new Date(selectedSession.startTime), 'PPP')}</p>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs font-medium text-gray-400">Time</p>
                    <p className="text-sm text-gray-200">
                      {format(new Date(selectedSession.startTime), 'p')} -{' '}
                      {format(new Date(selectedSession.endTime), 'p')}
                    </p>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs font-medium text-gray-400">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedSession.status)}>
                      {selectedSession.status.toLowerCase()}
                    </Badge>
                  </div>

                  {selectedSession.status === 'PENDING' && (
                    <div className="flex gap-2 mt-6">
                      <Button
                        onClick={() => handleSessionUpdate(selectedSession.id, 'CONFIRMED')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={() => handleSessionUpdate(selectedSession.id, 'CANCELLED')}
                        variant="destructive"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

