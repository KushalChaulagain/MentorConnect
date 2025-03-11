'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  ClipboardCopy,
  Clock,
  Info,
  Plus,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MentorProfile {
  id: string;
  userId: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  id?: string;
  day: string;
  slots: TimeSlot[];
}

// Time slots in 30-minute increments
const TIME_SLOTS: string[] = [];
for (let hour = 0; hour < 24; hour++) {
  for (let minute of [0, 30]) {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    TIME_SLOTS.push(`${formattedHour}:${formattedMinute}`);
  }
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [activeTab, setActiveTab] = useState("calendar");
  
  // For adding new time slots
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  
  // For quick templates
  const [workWeekEnabled, setWorkWeekEnabled] = useState(true);
  const [weekendEnabled, setWeekendEnabled] = useState(false);
  
  useEffect(() => {
    if (session?.user) {
      fetchMentorProfile();
    }
  }, [session]);
  
  useEffect(() => {
    if (mentorProfile) {
      fetchAvailability();
    }
  }, [mentorProfile]);

  const fetchMentorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentor-profile');
      if (!response.ok) {
        if (response.status === 404) {
          setMentorProfile(null);
        } else {
          throw new Error('Failed to fetch mentor profile');
        }
      } else {
        const data = await response.json();
        setMentorProfile(data);
      }
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentor profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailability = async () => {
    if (!mentorProfile?.id) return;
    
    try {
      const response = await fetch(`/api/availability?mentorProfileId=${mentorProfile.id}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load availability. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAddTimeSlot = async () => {
    if (!mentorProfile) return;
    
    if (startTime >= endTime) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: selectedDay,
          slots: [{ start: startTime, end: endTime }],
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update availability');
      
      await fetchAvailability();
      toast({
        title: 'Success',
        description: 'Availability updated successfully.',
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteTimeSlot = async (day: string, slotIndex: number) => {
    const dayAvailability = availability.find((a) => a.day === day);
    if (!dayAvailability?.id) return;
    
    try {
      const response = await fetch(`/api/availability?id=${dayAvailability.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete time slot');
      
      await fetchAvailability();
      toast({
        title: 'Success',
        description: 'Time slot deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time slot. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const applyTemplate = async (template: 'work-week' | 'weekend' | 'reset') => {
    if (!mentorProfile) return;
    
    if (template === 'reset') {
      // Clear all availability
      try {
        for (const day of availability) {
          if (day.id) {
            await fetch(`/api/availability?id=${day.id}`, {
              method: 'DELETE',
            });
          }
        }
        await fetchAvailability();
        toast({
          title: 'Success',
          description: 'All availability has been cleared.',
        });
      } catch (error) {
        console.error('Error clearing availability:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear availability. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }
    
    const workDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekendDays = ['Saturday', 'Sunday'];
    
    const daysToUpdate = template === 'work-week' ? workDays : weekendDays;
    
    try {
      for (const day of daysToUpdate) {
        await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day,
            slots: [{ start: "09:00", end: "17:00" }],
          }),
        });
      }
      
      await fetchAvailability();
      toast({
        title: 'Success',
        description: `${template === 'work-week' ? 'Work week' : 'Weekend'} availability template applied.`,
      });
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const formatTimeForDisplay = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const meridiem = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${meridiem}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500">Loading availability settings...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/login');
  }

  if (!mentorProfile) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Manage Availability</CardTitle>
            <CardDescription>
              Set your availability to let mentees book sessions with you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Mentor Profile Required</AlertTitle>
              <AlertDescription>
                You need to complete your mentor profile before you can set your availability.
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => window.location.href = '/dashboard/profile/edit'}>
              Complete Your Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Availability</h1>
            <p className="text-gray-500 mt-1">
              Set your available hours for mentoring sessions
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/profile'}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Weekly Calendar
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Clock className="mr-2 h-4 w-4" />
              Quick Setup
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>
                  Set your recurring weekly availability for mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayAvailability = availability.find((a) => a.day === day);
                    const hasSlots = dayAvailability?.slots && dayAvailability.slots.length > 0;
                    
                    return (
                      <div key={day} className={`relative border rounded-lg p-4 hover:border-indigo-300 transition-colors 
                        ${hasSlots ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
                        <h3 className="font-semibold text-center mb-3">{day}</h3>
                        
                        {hasSlots ? (
                          <div className="space-y-2">
                            {dayAvailability?.slots.map((slot, index) => (
                              <div key={index} className="flex flex-col items-center bg-white px-3 py-2 rounded-md border border-indigo-100">
                                <span className="text-sm font-medium text-indigo-800">
                                  {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 mt-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteTimeSlot(day, index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4 text-gray-500 text-sm">
                            <span>Not Available</span>
                          </div>
                        )}
                        
                        {/* Add slot button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 text-xs bg-white"
                          onClick={() => {
                            setSelectedDay(day);
                            setActiveTab("templates");
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Time
                        </Button>
                      </div>
                    );
                  })}
                </div>
                
                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Timezone Information</AlertTitle>
                  <AlertDescription>
                    All times are displayed in your local timezone. Mentees will see these times converted to their own timezone.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Time Slot</CardTitle>
                  <CardDescription>
                    Add a new availability time slot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="day-select">Day of Week</Label>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger id="day-select" className="mt-1">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger id="start-time" className="mt-1">
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={`start-${time}`} value={time}>
                            {formatTimeForDisplay(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger id="end-time" className="mt-1">
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={`end-${time}`} value={time}>
                            {formatTimeForDisplay(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleAddTimeSlot} className="w-full">
                    Add Time Slot
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Templates</CardTitle>
                  <CardDescription>
                    Apply predefined availability templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="work-week">Work Week (9AM-5PM)</Label>
                      <p className="text-sm text-gray-500">Monday through Friday</p>
                    </div>
                    <Switch 
                      id="work-week" 
                      checked={workWeekEnabled}
                      onCheckedChange={setWorkWeekEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekend">Weekend (9AM-5PM)</Label>
                      <p className="text-sm text-gray-500">Saturday and Sunday</p>
                    </div>
                    <Switch 
                      id="weekend" 
                      checked={weekendEnabled}
                      onCheckedChange={setWeekendEnabled}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button 
                    onClick={() => applyTemplate('work-week')} 
                    className="w-full"
                    disabled={!workWeekEnabled}
                  >
                    Apply Work Week
                  </Button>
                  <Button 
                    onClick={() => applyTemplate('weekend')} 
                    className="w-full"
                    disabled={!weekendEnabled}
                    variant="outline"
                  >
                    Apply Weekend
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Availability Actions</CardTitle>
                  <CardDescription>
                    Additional actions for managing your availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-gray-50 border-gray-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Availability Settings</AlertTitle>
                    <AlertDescription>
                      Set your weekly availability to let mentees know when you're available for sessions. These times will repeat every week.
                    </AlertDescription>
                  </Alert>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <ClipboardCopy className="mr-2 h-4 w-4" />
                          Copy Schedule Link
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming soon: Share your availability link with others</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => applyTemplate('reset')}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset All Availability
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>How Availability Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium">Set Your Recurring Weekly Schedule</h3>
                  <p className="text-gray-500">
                    Define the times when you're available each week. These time slots will repeat weekly.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium">Mentees Book During Available Times</h3>
                  <p className="text-gray-500">
                    Mentees can only request sessions during your available time slots.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium">Automatic Timezone Conversion</h3>
                  <p className="text-gray-500">
                    Your availability is automatically converted to each mentee's local timezone.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 