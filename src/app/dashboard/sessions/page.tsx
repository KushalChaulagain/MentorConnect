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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your mentoring sessions and availability
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigate(new Date(date.setDate(date.getDate() - 7)))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigate(new Date(date.setDate(date.getDate() + 7)))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={view} onValueChange={(v) => handleViewChange(v as View)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Calendar
          events={calendarEvents}
          onSelectEvent={handleEventSelect}
          isEditable={false}
          view={view}
          onViewChange={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedSession && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="font-medium text-sm">Mentor</p>
                    <p className="text-foreground">{selectedSession.mentorProfile.user.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Mentee</p>
                    <p className="text-foreground">{selectedSession.mentee.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Date</p>
                    <p className="text-foreground">{format(new Date(selectedSession.startTime), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Time</p>
                    <p className="text-foreground">
                      {format(new Date(selectedSession.startTime), 'p')} -{' '}
                      {format(new Date(selectedSession.endTime), 'p')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedSession.status)}>
                      {selectedSession.status.toLowerCase()}
                    </Badge>
                  </div>

                  {selectedSession.status === 'PENDING' && (
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => handleSessionUpdate(selectedSession.id, 'CONFIRMED')}
                        className="flex-1"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleSessionUpdate(selectedSession.id, 'CANCELLED')}
                        variant="destructive"
                        className="flex-1"
                      >
                        Decline
                      </Button>
                    </div>
                  )}

                  {selectedSession.status === 'CONFIRMED' && (
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => handleSessionUpdate(selectedSession.id, 'COMPLETED')}
                        className="flex-1"
                      >
                        Mark as Completed
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

