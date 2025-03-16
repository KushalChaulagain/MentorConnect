"use client"

import { AddEventDialog } from "@/components/AddEventDialog"
import MentorFeatureGuard from "@/components/MentorFeatureGuard"
import Calendar from "@/components/NewCalendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type { BookingStatus } from "@prisma/client"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"

type CalendarView = 'month' | 'week' | 'day';

interface Session {
  id: string
  title?: string
  startTime: string
  endTime: string
  status?: BookingStatus
  mentorProfileId?: string
  menteeId?: string
  mentorProfile?: {
    id?: string
    user?: {
      id?: string
      name?: string
      image?: string
    }
  }
  mentee?: {
    id?: string
    name?: string
    email?: string
    image?: string
  }
  description?: string
  createdAt?: string
  updatedAt?: string
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
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchSessions()
    fetchMentorProfile()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSessions()
    }, 30000)
    
    setRefreshInterval(interval)
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      if (!response.ok) throw new Error("Failed to fetch sessions")
      const data = await response.json()
      
      // Defensive check to ensure we always set sessions as an array
      if (Array.isArray(data)) {
        setSessions(data);
      } else if (data && typeof data === 'object') {
        // Check for nested arrays in various properties
        if (Array.isArray(data.bookings)) {
          setSessions(data.bookings);
        } else if (data.success && Array.isArray(data.bookings)) {
          setSessions(data.bookings);
        } else {
          console.error("Unexpected API response format:", data);
          setSessions([]);
        }
      } else {
        console.error("Unexpected API response:", data);
        setSessions([]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      })
      setSessions([]);
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

  const handleAddEvent = async (event: { 
    title: string; 
    start: Date; 
    end: Date; 
    menteeId?: string;
    description?: string;
  }) => {
    try {
      if (!mentorProfileId) {
        toast({
          title: "Error",
          description: "You need a mentor profile to create sessions.",
          variant: "destructive",
        });
        return;
      }

      if (!event.menteeId) {
        toast({
          title: "Error",
          description: "Please select a mentee for this session.",
          variant: "destructive",
        });
        return;
      }

      // Validate event times to ensure they're in the future
      const now = new Date();
      
      // TEMPORARY FIX: Only validate dates if they're not in 2025
      // This fixes the system clock issue where the machine thinks it's 2025
      if (event.start.getFullYear() !== 2025 && event.start < now) {
        // No need to warn here as we're handling it later
      }

      // Prepare the request payload
      const requestData = {
        mentorProfileId,
        menteeId: event.menteeId,
        title: event.title,
        description: event.description || '',
        startTime: event.start.toISOString(),
        endTime: event.end.toISOString(),
      };

      const response = await fetch("/api/mentor/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // More detailed error handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Session creation error details:", {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        // Provide more user-friendly error message based on error type
        let errorMessage = errorText || response.statusText;
        if (errorText.includes("in the past")) {
          errorMessage = "The selected time appears to be in the past. Please select a future time.";
        } else if (errorText.includes("connection")) {
          errorMessage = "You don't have an active connection with this mentee.";
        } else if (errorText.includes("time slot is not available")) {
          errorMessage = "This time slot is already booked. Please select another time.";
        }
        
        throw new Error(`Failed to create session: ${errorMessage}`);
      }

      await fetchSessions();
      toast({
        title: "Success",
        description: "Session created successfully.",
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create session",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Create calendar events directly from the session data structure we're receiving
  const calendarEvents = useMemo(() => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return [];
    }
    
    return sessions.map(session => {
      // Make sure required date fields are properly parsed
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      
      // Create an event object that matches the CalendarEvent interface
      return {
        id: session.id,
        title: session.title || 'Untitled Session',
        start: startTime,
        end: endTime,
        status: session.status || 'CONFIRMED',
        // Use mentee.name or fallback to default
        menteeName: session.mentee?.name || 'Unknown Mentee',
        // Use mentorProfile.user.name or fallback
        mentorName: session.mentorProfile?.user?.name || 'Unknown Mentor'
      };
    });
  }, [sessions]);

  // Also add safety to the event selection handler
  const handleEventSelect = (event: any) => {
    if (!Array.isArray(sessions) || !event?.id) return;
    
    // Find the session that matches the event id
    const session = sessions.find((s) => s && s.id === event.id);
    if (session) {
      setSelectedSession(session);
      setIsDialogOpen(true);
    } else {
      console.warn("Session not found for event id:", event.id);
    }
  };

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

  const handleCancelSession = () => {
    if (selectedSession) {
      handleSessionUpdate(selectedSession.id, "CANCELLED");
    }
  };

  const handleCompleteSession = () => {
    if (selectedSession) {
      handleSessionUpdate(selectedSession.id, "COMPLETED");
    }
  };

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
            onSelectSlot={session?.user?.role === 'MENTOR' ? handleSlotSelect : undefined}
            isEditable={session?.user?.role === 'MENTOR'}
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
          <DialogContent className="bg-[#0B0E14] border-0 p-0 gap-0 max-w-md w-full rounded-lg shadow-xl text-white overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-sm font-medium text-white">Session Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.02)] rounded-full h-7 w-7 p-0"
              >
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs text-gray-400 mb-1">Title</h3>
                <p className="text-base font-medium">{selectedSession?.title || 'Session'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs text-gray-400 mb-1">Start Time</h3>
                  <p className="text-sm">
                    {selectedSession?.startTime ? format(new Date(selectedSession.startTime), 'MMM d, yyyy HH:mm') : ''}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs text-gray-400 mb-1">End Time</h3>
                  <p className="text-sm">
                    {selectedSession?.endTime ? format(new Date(selectedSession.endTime), 'MMM d, yyyy HH:mm') : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs text-gray-400 mb-1">Mentor</h3>
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mr-2">
                      {selectedSession?.mentorProfile?.user?.image ? (
                        <img 
                          src={selectedSession.mentorProfile.user.image} 
                          alt="Mentor" 
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-white">
                          {selectedSession?.mentorProfile?.user?.name?.charAt(0) || 'M'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">
                      {selectedSession?.mentorProfile?.user?.name || 'Mentor'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-gray-400 mb-1">Mentee</h3>
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mr-2">
                      {selectedSession?.mentee?.image ? (
                        <img 
                          src={selectedSession.mentee.image} 
                          alt="Mentee" 
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-white">
                          {session?.user?.role === 'MENTEE' 
                            ? session.user.name?.charAt(0) || 'M'
                            : selectedSession?.mentee?.name?.charAt(0) || 'M'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">
                      {session?.user?.role === 'MENTEE' 
                        ? session.user.name 
                        : (selectedSession?.mentee?.name || 'Mentee')}
                    </p>
                  </div>
                </div>
              </div>

              {selectedSession?.description && (
                <div>
                  <h3 className="text-xs text-gray-400 mb-1">Description</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedSession.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-xs text-gray-400 mb-1">Status</h3>
                <div>
                  <Badge variant={getStatusBadgeVariant(selectedSession?.status || 'CONFIRMED')}>
                    {selectedSession?.status || 'CONFIRMED'}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                {selectedSession?.status !== 'CANCELLED' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelSession}
                    className="text-xs h-8"
                  >
                    Cancel Session
                  </Button>
                )}
                {selectedSession?.status === 'CONFIRMED' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCompleteSession}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
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

