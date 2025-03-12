"use client"

import { AddEventDialog } from "@/components/AddEventDialog"
import MentorFeatureGuard from "@/components/MentorFeatureGuard"
import Calendar from "@/components/NewCalendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type { BookingStatus } from "@prisma/client"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

type CalendarView = 'month' | 'week' | 'day';

interface Session {
  id: string
  title: string
  startTime: string
  endTime: string
  status: BookingStatus
  mentorProfile: {
    user: {
      name: string
    }
  }
  mentee: {
    name: string
  }
}

export default function SessionsPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | undefined>()
  const [view, setView] = useState<CalendarView>('week')
  const [date, setDate] = useState(new Date())
  const [mentorProfileId, setMentorProfileId] = useState<string | undefined>()
  const [showAvailability, setShowAvailability] = useState(false)

  useEffect(() => {
    fetchSessions()
    fetchMentorProfile()
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

  const fetchMentorProfile = async () => {
    try {
      const response = await fetch("/api/profile/mentor")
      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error("Failed to fetch mentor profile")
        }
        return // User doesn't have a mentor profile
      }
      
      const data = await response.json()
      setMentorProfileId(data.id)
      // Only show availability in your own calendar if you're a mentor
      setShowAvailability(!!data.id)
    } catch (error) {
      console.error("Error fetching mentor profile:", error)
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

  const handleAddEvent = async (event: { title: string; start: Date; end: Date }) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: event.title,
          startTime: event.start.toISOString(),
          endTime: event.end.toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to create session")

      await fetchSessions()
      toast({
        title: "Success",
        description: "Session created successfully.",
      })
    } catch (error) {
      console.error("Error creating session:", error)
      throw error
    }
  }

  const calendarEvents = sessions.map((session) => ({
    id: session.id,
    title: session.title,
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

  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo)
    setIsAddEventDialogOpen(true)
  }

  const handleViewChange = (newView: CalendarView) => {
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
    <MentorFeatureGuard feature="session management">
      <div className="flex h-full flex-col bg-[#0B0E14]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-gray-400 h-5 w-5" />
            <div>
              <h1 className="text-lg font-medium text-white">Calendar</h1>
              <p className="text-xs text-gray-400">
                {format(date, "MMMM yyyy")}
              </p>
            </div>
          </div>
          
          {mentorProfileId && (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvailability(!showAvailability)}
                className={`text-xs border-[rgba(255,255,255,0.2)] ${showAvailability ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent'}`}
              >
                {showAvailability ? 'Hide Availability' : 'Show Availability'}
              </Button>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="flex-1 h-[calc(100vh-5rem)] overflow-hidden">
          <Calendar
            events={calendarEvents}
            onSelectEvent={handleEventSelect}
            onSelectSlot={handleSlotSelect}
            isEditable={true}
            view={view}
            onViewChange={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            mentorProfileId={mentorProfileId}
            showAvailability={showAvailability}
          />
        </div>

        {/* Session details dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#0B0E14] border-0 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Session Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View and manage session information
              </DialogDescription>
            </DialogHeader>

            {selectedSession && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs text-gray-400 mb-1">Title</h3>
                  <p className="text-sm">{selectedSession.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs text-gray-400 mb-1">Start Time</h3>
                    <p className="text-sm">
                      {format(new Date(selectedSession.startTime), "PPp")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs text-gray-400 mb-1">End Time</h3>
                    <p className="text-sm">
                      {format(new Date(selectedSession.endTime), "PPp")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs text-gray-400 mb-1">Mentor</h3>
                    <p className="text-sm">{selectedSession.mentorProfile.user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-xs text-gray-400 mb-1">Mentee</h3>
                    <p className="text-sm">{selectedSession.mentee.name}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-gray-400 mb-1">Status</h3>
                  <div>
                    <Badge variant={getStatusBadgeVariant(selectedSession.status)}>
                      {selectedSession.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  {selectedSession.status === "PENDING" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleSessionUpdate(selectedSession.id, "CANCELLED")
                        }
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        Decline
                      </Button>
                      <Button
                        onClick={() =>
                          handleSessionUpdate(selectedSession.id, "CONFIRMED")
                        }
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Confirm
                      </Button>
                    </>
                  )}
                  {selectedSession.status === "CONFIRMED" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleSessionUpdate(selectedSession.id, "CANCELLED")
                        }
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          handleSessionUpdate(selectedSession.id, "COMPLETED")
                        }
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Complete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add event dialog */}
        <AddEventDialog
          isOpen={isAddEventDialogOpen}
          onClose={() => setIsAddEventDialogOpen(false)}
          selectedSlot={selectedSlot}
          onEventAdd={handleAddEvent}
        />
      </div>
    </MentorFeatureGuard>
  );
}

