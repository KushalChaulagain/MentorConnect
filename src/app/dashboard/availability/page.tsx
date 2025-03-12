'use client';

import MentorFeatureGuard from "@/components/MentorFeatureGuard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { toast } from '@/components/ui/use-toast';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CalendarDays,
    Check,
    Clock,
    Flame,
    Info,
    Laptop,
    Plus,
    RefreshCw,
    Settings,
    Trash,
    User,
    Users,
    X
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

// Predefined time blocks
const COMMON_TIME_BLOCKS = [
  { label: "Morning (9AM - 12PM)", start: "09:00", end: "12:00" },
  { label: "Afternoon (1PM - 5PM)", start: "13:00", end: "17:00" },
  { label: "Evening (6PM - 9PM)", start: "18:00", end: "21:00" },
  { label: "Full Day (9AM - 5PM)", start: "09:00", end: "17:00" },
  { label: "1 Hour Lunch (12PM - 1PM)", start: "12:00", end: "13:00" },
  { label: "Custom", start: "", end: "" },
];

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [activeTab, setActiveTab] = useState("calendar");
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  
  // For adding new time slots
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState(COMMON_TIME_BLOCKS[0]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [editMode, setEditMode] = useState(false);
  
  // For templates
  const [selectedTemplate, setSelectedTemplate] = useState<'weekday' | 'weekend' | 'custom' | ''>('');
  
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

  useEffect(() => {
    if (selectedTimeBlock.label !== "Custom") {
      setStartTime(selectedTimeBlock.start);
      setEndTime(selectedTimeBlock.end);
    }
  }, [selectedTimeBlock]);

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
    
    setSaveStatus('saving');
    
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
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
      setSaveStatus('unsaved');
    }
  };
  
  const handleDeleteTimeSlot = async (day: string, slotIndex: number) => {
    const dayAvailability = availability.find((a) => a.day === day);
    if (!dayAvailability?.id) return;
    
    setSaveStatus('saving');
    
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
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time slot. Please try again.',
        variant: 'destructive',
      });
      setSaveStatus('unsaved');
    }
  };
  
  const applyTemplate = async (template: 'weekday' | 'weekend' | 'reset') => {
    if (!mentorProfile) return;
    
    setSaveStatus('saving');
    
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
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error clearing availability:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear availability. Please try again.',
          variant: 'destructive',
        });
        setSaveStatus('unsaved');
      }
      return;
    }
    
    const workDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekendDays = ['Saturday', 'Sunday'];
    
    const daysToUpdate = template === 'weekday' ? workDays : weekendDays;
    
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
        description: `${template === 'weekday' ? 'Weekday' : 'Weekend'} availability template applied.`,
      });
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template. Please try again.',
        variant: 'destructive',
      });
      setSaveStatus('unsaved');
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-gray-400">Loading availability settings...</p>
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
        <Card className="max-w-4xl mx-auto border-gray-800 bg-gray-900 shadow-xl">
          <CardHeader className="border-b border-gray-800 bg-gray-800/50">
            <CardTitle className="text-2xl text-white">Set Your Availability</CardTitle>
            <CardDescription className="text-gray-400">
              Let mentees know when you're available for sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert className="mb-6 bg-amber-950 text-amber-200 border-amber-800">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Mentor Profile Required</AlertTitle>
              <AlertDescription>
                You need to complete your mentor profile before you can set your availability.
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => window.location.href = '/dashboard/profile/edit'} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Complete Your Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MentorFeatureGuard feature="availability settings">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with info bar */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6 mb-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-grid-white/[0.03]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-purple-900/30"></div>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Manage Your Availability</h1>
                <p className="text-indigo-200 max-w-xl">
                  Set when you're free to mentor. Your availability will repeat weekly until changed.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {saveStatus === 'saved' && (
                  <Badge variant="outline" className="bg-green-900/40 text-green-200 border-green-700 flex items-center gap-1 py-1">
                    <Check className="h-3 w-3" />
                    Saved
                  </Badge>
                )}
                {saveStatus === 'saving' && (
                  <Badge variant="outline" className="bg-yellow-900/40 text-yellow-200 border-yellow-700 flex items-center gap-1 py-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Saving...
                  </Badge>
                )}
                {saveStatus === 'unsaved' && (
                  <Badge variant="outline" className="bg-red-900/40 text-red-200 border-red-700 flex items-center gap-1 py-1">
                    <AlertCircle className="h-3 w-3" />
                    Unsaved
                  </Badge>
                )}
                
                <Button variant="outline" size="sm" className="bg-indigo-800/50 border-indigo-700 text-white hover:bg-indigo-700 ml-2" onClick={() => window.location.href = '/dashboard/mentor'}>
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Calendar Area */}
            <div className="lg:col-span-9">
              <Card className="border-gray-800 bg-gray-900 shadow-xl h-full">
                <CardHeader className="border-b border-gray-800 bg-gray-800/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center text-white">
                      <CalendarDays className="mr-2 h-5 w-5 text-indigo-400" />
                      Weekly Schedule
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Your recurring weekly availability for mentoring sessions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={editMode ? "bg-indigo-800/70 text-indigo-200" : "text-gray-300 hover:text-white hover:bg-gray-800"}
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Settings className="mr-1 h-4 w-4" />
                      {editMode ? "Exit Edit Mode" : "Edit Mode"}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-800/30">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={`header-${day}`} className="py-2 px-2 text-center font-medium text-sm border-r border-gray-800 last:border-r-0 text-gray-300">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 h-full min-h-[400px]">
                    {DAYS_OF_WEEK.map((day) => {
                      const dayAvailability = availability.find((a) => a.day === day);
                      const hasSlots = dayAvailability?.slots && dayAvailability.slots.length > 0;
                      
                      return (
                        <div key={day} className="p-3 border-r border-b border-gray-800 last:border-r-0 relative hover:bg-gray-800/30">
                          {hasSlots ? (
                            <div className="space-y-2">
                              {dayAvailability?.slots.map((slot, index) => (
                                <div key={index} className="relative group">
                                  <div className="bg-indigo-900/40 border border-indigo-800 rounded-md p-2 shadow-md">
                                    <div className="text-sm font-medium text-indigo-200">
                                      {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                                    </div>
                                  </div>
                                  
                                  {editMode && (
                                    <button 
                                      className="absolute -top-2 -right-2 bg-red-900/60 text-red-100 rounded-full p-1 shadow-md 
                                               hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                      onClick={() => handleDeleteTimeSlot(day, index)}
                                      aria-label="Delete time slot"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm py-4">
                              <Clock className="h-5 w-5 mb-1 text-gray-600" />
                              <span>Not Available</span>
                            </div>
                          )}
                          
                          {editMode && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs py-1 px-2 h-auto
                                        text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/50"
                              onClick={() => {
                                setSelectedDay(day);
                                setActiveTab("add");
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                
                <CardFooter className="bg-blue-900/20 border-t border-blue-900">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-200">Timezone Information</h4>
                      <p className="text-xs text-blue-300">
                        All times are displayed in your local timezone. Mentees will see these times converted to their own timezone.
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Add Time Slot */}
              <Card className="border-gray-800 bg-gray-900 shadow-xl">
                <CardHeader className="border-b border-gray-800 bg-gray-800/50">
                  <CardTitle className="text-base flex items-center text-white">
                    <Plus className="mr-2 h-4 w-4 text-indigo-400" />
                    Add Availability
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    Add new time slots for mentoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="day-select" className="text-sm text-gray-300">Day of Week</Label>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger id="day-select" className="mt-1 bg-gray-800 border-gray-700 text-gray-200">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day} className="focus:bg-gray-700 focus:text-white">{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="time-block" className="text-sm text-gray-300">Time Block</Label>
                    <Select 
                      value={selectedTimeBlock.label} 
                      onValueChange={(value) => {
                        const selected = COMMON_TIME_BLOCKS.find(block => block.label === value);
                        if (selected) {
                          setSelectedTimeBlock(selected);
                        }
                      }}
                    >
                      <SelectTrigger id="time-block" className="mt-1 bg-gray-800 border-gray-700 text-gray-200">
                        <SelectValue placeholder="Select time block" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        {COMMON_TIME_BLOCKS.map((block) => (
                          <SelectItem key={block.label} value={block.label} className="focus:bg-gray-700 focus:text-white">{block.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedTimeBlock.label === "Custom" && (
                    <>
                      <div>
                        <Label htmlFor="start-time" className="text-sm text-gray-300">Start Time</Label>
                        <Select value={startTime} onValueChange={setStartTime}>
                          <SelectTrigger id="start-time" className="mt-1 bg-gray-800 border-gray-700 text-gray-200">
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={`start-${time}`} value={time} className="focus:bg-gray-700 focus:text-white">
                                {formatTimeForDisplay(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="end-time" className="text-sm text-gray-300">End Time</Label>
                        <Select value={endTime} onValueChange={setEndTime}>
                          <SelectTrigger id="end-time" className="mt-1 bg-gray-800 border-gray-700 text-gray-200">
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={`end-${time}`} value={time} className="focus:bg-gray-700 focus:text-white">
                                {formatTimeForDisplay(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-400">
                      {selectedTimeBlock.label !== "Custom" ? (
                        <>
                          {formatTimeForDisplay(selectedTimeBlock.start)} - 
                          {formatTimeForDisplay(selectedTimeBlock.end)}
                        </>
                      ) : startTime && endTime ? (
                        <>
                          {formatTimeForDisplay(startTime)} - 
                          {formatTimeForDisplay(endTime)}
                        </>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-800 pt-4 pb-4">
                  <Button 
                    onClick={handleAddTimeSlot} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Time Slot
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Quick Templates */}
              <Card className="border-gray-800 bg-gray-900 shadow-xl">
                <CardHeader className="border-b border-gray-800 bg-gray-800/50">
                  <CardTitle className="text-base flex items-center text-white">
                    <Flame className="mr-2 h-4 w-4 text-indigo-400" />
                    Quick Templates
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    Apply preset availability patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center p-3 rounded-md cursor-pointer border transition-colors
                        ${selectedTemplate === 'weekday' 
                          ? 'bg-indigo-900/40 border-indigo-700 text-indigo-200' 
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-700'}`}
                      onClick={() => setSelectedTemplate(selectedTemplate === 'weekday' ? '' : 'weekday')}
                    >
                      <div className="mr-3 bg-indigo-900/60 h-10 w-10 rounded-full flex items-center justify-center text-indigo-300">
                        <Laptop className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Weekday Availability</h3>
                        <p className="text-xs text-gray-400">Mon-Fri, 9am-5pm</p>
                      </div>
                      <div className="ml-auto">
                        {selectedTemplate === 'weekday' ? (
                          <Check className="h-5 w-5 text-indigo-400" />
                        ) : (
                          <Plus className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center p-3 rounded-md cursor-pointer border transition-colors
                        ${selectedTemplate === 'weekend' 
                          ? 'bg-indigo-900/40 border-indigo-700 text-indigo-200' 
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-700'}`}
                      onClick={() => setSelectedTemplate(selectedTemplate === 'weekend' ? '' : 'weekend')}
                    >
                      <div className="mr-3 bg-indigo-900/60 h-10 w-10 rounded-full flex items-center justify-center text-indigo-300">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Weekend Availability</h3>
                        <p className="text-xs text-gray-400">Sat-Sun, 9am-5pm</p>
                      </div>
                      <div className="ml-auto">
                        {selectedTemplate === 'weekend' ? (
                          <Check className="h-5 w-5 text-indigo-400" />
                        ) : (
                          <Plus className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-800 pt-4 flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => selectedTemplate && applyTemplate(selectedTemplate as any)} 
                    disabled={!selectedTemplate}
                    className="w-full bg-indigo-900/30 border-indigo-700 text-indigo-300 hover:bg-indigo-800 hover:text-white"
                  >
                    Apply Template
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full bg-red-900/20 border-red-900 text-red-300 hover:bg-red-900/40 hover:text-red-200"
                    onClick={() => applyTemplate('reset')}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Clear All Availability
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Mentor Tips */}
              <Card className="border-gray-800 bg-gray-900/80 shadow-xl">
                <CardHeader className="border-b border-amber-900/30 bg-amber-900/20">
                  <CardTitle className="text-base flex items-center text-amber-200">
                    <Info className="mr-2 h-4 w-4" />
                    Availability Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-amber-100">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                      <span>Create consistent weekly hours for better mentee engagement</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                      <span>Add buffer time between sessions (15-30 mins) to prepare</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                      <span>Once booked, sessions will appear in your calendar</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* How Availability Works */}
          <Card className="mt-8 border-gray-800 bg-gray-900 shadow-xl">
            <CardHeader className="bg-gray-800/50 border-b border-gray-800">
              <CardTitle className="text-lg flex items-center text-white">
                <Info className="mr-2 h-5 w-5 text-indigo-400" />
                How Availability Works
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-900/40 rounded-full p-4 mb-4">
                    <Clock className="h-6 w-6 text-indigo-300" />
                  </div>
                  <h3 className="font-medium mb-2 text-indigo-200">1. Set Your Weekly Schedule</h3>
                  <p className="text-sm text-gray-400">
                    Define what days and times you're free for mentoring each week. These slots will repeat weekly.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-900/40 rounded-full p-4 mb-4">
                    <User className="h-6 w-6 text-indigo-300" />
                  </div>
                  <h3 className="font-medium mb-2 text-indigo-200">2. Mentees Book Sessions</h3>
                  <p className="text-sm text-gray-400">
                    Mentees can only request sessions during your available time slots, eliminating scheduling conflicts.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-900/40 rounded-full p-4 mb-4">
                    <Users className="h-6 w-6 text-indigo-300" />
                  </div>
                  <h3 className="font-medium mb-2 text-indigo-200">3. Connect with Mentees</h3>
                  <p className="text-sm text-gray-400">
                    Once booked, you'll receive a notification and sessions will appear in your dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MentorFeatureGuard>
  );
} 