import { BookingStatus } from '@prisma/client';
import { addDays, format, getWeek, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AvailabilityDisplay, AvailabilitySlot } from './AvailabilityDisplay';

// Extend BookingStatus to include AVAILABLE
type ExtendedBookingStatus = BookingStatus | 'AVAILABLE';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: ExtendedBookingStatus;
  mentorName?: string;
  menteeName?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  isEditable?: boolean;
  view?: 'month' | 'week' | 'day';
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  date?: Date;
  onNavigate?: (date: Date) => void;
  mentorProfileId?: string;
  showAvailability?: boolean;
}

function getEventColor(status: ExtendedBookingStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-500/90 hover:bg-amber-500 border-amber-400/30';
    case 'CONFIRMED':
      return 'bg-blue-600/90 hover:bg-blue-600 border-blue-500/30';
    case 'COMPLETED':
      return 'bg-emerald-600/90 hover:bg-emerald-600 border-emerald-500/30';
    case 'CANCELLED':
      return 'bg-red-500/90 hover:bg-red-500 border-red-400/30';
    case 'AVAILABLE':
      return 'bg-cyan-500/70 hover:bg-cyan-500/90 border-cyan-400/30';
    default:
      return 'bg-slate-600/90 hover:bg-slate-600 border-slate-500/30';
  }
}

// Generate hours for the day (00:00 to 23:00)
const hours = Array.from({ length: 24 }, (_, i) => {
  const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i < 12 ? 'AM' : 'PM';
  const hour24 = i < 10 ? `0${i}` : `${i}`;
  return {
    hour24: `${hour24}:00`,
    hour12: `${hour12}:00 ${ampm}`,
    value: i
  };
});

export default function Calendar({
  events,
  onSelectEvent,
  onSelectSlot,
  isEditable = false,
  view = 'week',
  onViewChange,
  date = new Date(),
  onNavigate,
  mentorProfileId,
  showAvailability = false,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(date);
  const [currentView, setCurrentView] = useState(view);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    setCurrentDate(date);
  }, [date]);
  
  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'day') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
    } else if (currentView === 'week') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
    } else if (currentView === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    }
    
    setCurrentDate(newDate);
    if (onNavigate) {
      onNavigate(newDate);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (onNavigate) {
      onNavigate(today);
    }
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setCurrentView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  const handleSlotClick = (day: Date, hour?: number) => {
    if (!onSelectSlot) return;
    
    const start = new Date(day);
    if (hour !== undefined) {
      start.setHours(hour, 0, 0, 0);
    } else {
      start.setHours(9, 0, 0, 0); // Default to 9:00 AM for day clicks
    }
    
    const end = new Date(start);
    if (hour !== undefined) {
      end.setHours(hour + 1, 0, 0, 0);
    } else {
      end.setHours(10, 0, 0, 0); // Default 1 hour duration
    }
    
    onSelectSlot({ start, end });
  };

  // Header component used by all views
  const CalendarHeader = () => (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleViewChange('day')}
          className={`px-3 py-1.5 text-xs rounded ${currentView === 'day' ? 'bg-blue-600' : 'bg-[#1A1B1E] text-gray-400 hover:bg-[#2C2D31]'}`}
        >
          Day
        </button>
        <button 
          onClick={() => handleViewChange('week')}
          className={`px-3 py-1.5 text-xs rounded ${currentView === 'week' ? 'bg-blue-600' : 'bg-[#1A1B1E] text-gray-400 hover:bg-[#2C2D31]'}`}
        >
          Week
        </button>
        <button 
          onClick={() => handleViewChange('month')}
          className={`px-3 py-1.5 text-xs rounded ${currentView === 'month' ? 'bg-blue-600' : 'bg-[#1A1B1E] text-gray-400 hover:bg-[#2C2D31]'}`}
        >
          Month
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex rounded-md overflow-hidden border border-[rgba(255,255,255,0.06)]">
          <button 
            onClick={() => handleNavigate('prev')}
            className="p-1.5 bg-[#1A1B1E] text-gray-400 hover:bg-[#2C2D31] border-r border-[rgba(255,255,255,0.06)]"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleToday}
            className="px-3 py-1 text-xs bg-[#1A1B1E] text-gray-400 hover:bg-[#2C2D31]"
          >
            Today
          </button>
          <button 
            onClick={() => handleNavigate('next')}
            className="p-1.5 bg-[#1A1B1E] text-gray-400 hover:bg-[#2C2D31] border-l border-[rgba(255,255,255,0.06)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        {isEditable && (
          <button 
            onClick={() => onSelectSlot?.({ start: new Date(), end: new Date(new Date().setHours(new Date().getHours() + 1)) })}
            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Plus size={14} /> Add Event
          </button>
        )}
      </div>
    </div>
  );

  // Handle availability data
  const handleAvailabilityLoaded = (slots: AvailabilitySlot[]) => {
    setAvailabilitySlots(slots);
  };
  
  // Create availability events
  const availabilityEvents = showAvailability && mentorProfileId ? availabilitySlots.map(slot => ({
    id: slot.id,
    title: 'Available',
    start: slot.date as Date,
    end: new Date((slot.date as Date).getTime() + (60 * 60 * 1000)), // 1 hour slots
    status: 'AVAILABLE' as ExtendedBookingStatus,
  })) : [];
  
  // Combine regular events with availability slots
  const combinedEvents = [...events, ...availabilityEvents];

  // WEEK VIEW
  if (currentView === 'week') {
    // Generate days for the week
    const startDay = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
    
    // Get week number
    const weekNumber = getWeek(currentDate);

    // Filter events for the current week
    const weekEvents = combinedEvents.filter(event => {
      const eventDate = new Date(event.start);
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = addDays(weekStart, 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    // Map events to their respective day and hour
    const eventMap = new Map();
    
    weekEvents.forEach(event => {
      const day = event.start.getDay();
      const hour = event.start.getHours();
      const key = `${day}-${hour}`;
      
      if (!eventMap.has(key)) {
        eventMap.set(key, []);
      }
      
      eventMap.get(key).push(event);
    });

    return (
      <div className="flex flex-col h-full bg-[#0B0E14] text-white">
        {showAvailability && mentorProfileId && (
          <AvailabilityDisplay 
            mentorProfileId={mentorProfileId}
            onAvailabilityLoaded={handleAvailabilityLoaded}
          />
        )}
        
        <CalendarHeader />
        
        {/* Calendar container */}
        <div className="flex-1 overflow-auto border border-[rgba(255,255,255,0.06)] rounded-lg m-4">
          {/* Week header */}
          <div className="flex">
            <div className="w-20 p-2 bg-[#0B0E14] border-b border-r border-[rgba(255,255,255,0.06)]">
              <div className="text-xs text-gray-400">Week {weekNumber}</div>
            </div>
            
            {days.map((day, index) => (
              <div 
                key={index} 
                className="flex-1 p-2 text-center bg-[#0B0E14] border-b border-r last:border-r-0 border-[rgba(255,255,255,0.06)]"
              >
                <div className="text-xs text-gray-400">{format(day, 'EEE')}</div>
                <div className="text-xs">{format(day, 'd')}</div>
              </div>
            ))}
          </div>
          
          {/* Time grid */}
          <div className="relative">
            {/* Current time indicator */}
            {(() => {
              const now = new Date();
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();
              const currentDayOfWeek = now.getDay();
              
              // Only show if current day is in the displayed week
              const isCurrentWeekDisplayed = days.some(day => 
                day.getDate() === now.getDate() && 
                day.getMonth() === now.getMonth() && 
                day.getFullYear() === now.getFullYear()
              );
              
              if (!isCurrentWeekDisplayed) return null;
              
              // Calculate position
              const topPosition = (currentHour + currentMinute / 60) * 8; // 8px is the height of each hour cell
              
              return (
                <div 
                  className="absolute left-[80px] right-0 z-20 pointer-events-none" 
                  style={{ top: `${topPosition}px` }}
                >
                  <div className="flex items-center w-full">
                    <div className="w-[20px] h-[16px] flex items-center justify-center bg-red-500 rounded-l text-[10px] text-white font-medium">
                      {now.getHours() % 12 || 12}:{now.getMinutes().toString().padStart(2, '0')}
                    </div>
                    <div className="h-[1px] flex-1 bg-red-500"></div>
                  </div>
                </div>
              );
            })()}
            
            {hours.map((hour, hourIndex) => (
              <div key={hourIndex} className="flex">
                <div className="w-20 p-2 text-xs text-gray-400 border-r border-b border-[rgba(255,255,255,0.06)] bg-[#0B0E14]">
                  {hour.hour12}
                </div>
                
                {days.map((day, dayIndex) => {
                  const key = `${dayIndex}-${hourIndex}`;
                  const cellEvents = eventMap.get(key) || [];
                  const isHovered = hoveredSlot === key;
                  
                  return (
                    <div 
                      key={`${dayIndex}-${hourIndex}`}
                      className={`flex-1 h-8 border-r border-b last:border-r-0 border-[rgba(255,255,255,0.06)] relative ${isHovered ? 'bg-[rgba(59,130,246,0.08)]' : 'hover:bg-[rgba(255,255,255,0.02)]'} transition-colors duration-100`}
                      onClick={() => {
                        if (cellEvents.length === 0) {
                          handleSlotClick(day, hourIndex);
                        }
                      }}
                      onMouseEnter={() => setHoveredSlot(key)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      {cellEvents.length > 0 ? (
                        cellEvents.map((event: CalendarEvent, eventIndex: number) => (
                          <div
                            key={`${dayIndex}-${eventIndex}`}
                            className={`absolute p-2 rounded-md text-xs shadow-md border border-white/10 backdrop-blur-sm ${getEventColor(event.status)} text-white z-10 transition-all duration-200 ease-in-out hover:shadow-lg cursor-pointer`}
                            style={{
                              top: `${((event.start.getHours() * 60 + event.start.getMinutes()) / 1440) * 100}%`,
                              height: `${((event.end.getTime() - event.start.getTime()) / (24 * 60 * 60 * 1000)) * 100}%`,
                              width: '90%',
                              left: '5%',
                              minHeight: '25px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectEvent && event.status !== 'AVAILABLE') onSelectEvent(event);
                            }}
                          >
                            <div className="flex flex-col h-full">
                              <div className="font-medium flex items-center justify-between mb-1">
                                <span className="truncate">{event.title}</span>
                                <span className="text-[10px] bg-white/20 rounded-sm px-1">{event.status}</span>
                              </div>
                              <div className="text-[10px] flex-1 flex flex-col justify-between">
                                <span>{format(event.start, 'HH:mm')}-{format(event.end, 'HH:mm')}</span>
                                <div className="flex items-center mt-1 opacity-80">
                                  <User className="h-2.5 w-2.5 mr-1" />
                                  <span className="truncate">Session</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : isHovered && isEditable && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                          Add Event
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // DAY VIEW
  if (currentView === 'day') {
    // Filter events for the current day
    const dayEvents = combinedEvents.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, currentDate);
    });

    // Map events to their respective hour
    const eventMap = new Map();
    
    dayEvents.forEach(event => {
      const hour = event.start.getHours();
      
      if (!eventMap.has(hour)) {
        eventMap.set(hour, []);
      }
      
      eventMap.get(hour).push(event);
    });

    return (
      <div className="flex flex-col h-full bg-[#0B0E14] text-white">
        {showAvailability && mentorProfileId && (
          <AvailabilityDisplay 
            mentorProfileId={mentorProfileId}
            onAvailabilityLoaded={handleAvailabilityLoaded}
          />
        )}
        
        <CalendarHeader />
        
        {/* Calendar container */}
        <div className="flex-1 overflow-auto border border-[rgba(255,255,255,0.06)] rounded-lg m-4">
          {/* Day header */}
          <div className="flex">
            <div className="w-20 p-2 bg-[#0B0E14] border-b border-r border-[rgba(255,255,255,0.06)]"></div>
            <div className="flex-1 p-2 text-center bg-[#0B0E14] border-b border-[rgba(255,255,255,0.06)]">
              <div className="text-xs text-gray-400">{format(currentDate, 'EEEE')}</div>
              <div className="text-xs">{format(currentDate, 'd MMMM yyyy')}</div>
            </div>
          </div>
          
          {/* Time grid */}
          <div className="relative">
            {/* Current time indicator */}
            {(() => {
              const now = new Date();
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();
              
              // Only show if current day is displayed
              const isToday = currentDate.getDate() === now.getDate() && 
                             currentDate.getMonth() === now.getMonth() && 
                             currentDate.getFullYear() === now.getFullYear();
              
              if (!isToday) return null;
              
              // Calculate position
              const topPosition = (currentHour + currentMinute / 60) * 8; // 8px is the height of each hour cell
              
              return (
                <div 
                  className="absolute left-[80px] right-0 z-20 pointer-events-none" 
                  style={{ top: `${topPosition}px` }}
                >
                  <div className="flex items-center w-full">
                    <div className="w-[20px] h-[16px] flex items-center justify-center rounded-l text-[10px] text-white font-medium">
                      {now.getHours() % 12 || 12}:{now.getMinutes().toString().padStart(2, '0')}
                    </div>
                    <div className="h-[1px] flex-1 bg-green-500"></div>
                  </div>
                </div>
              );
            })()}
            
            {hours.map((hour, hourIndex) => {
              const key = `day-${hourIndex}`;
              const isHovered = hoveredSlot === key;
              
              return (
                <div key={hourIndex} className="flex">
                  <div className="w-20 p-2 text-xs text-gray-400 border-r border-b border-[rgba(255,255,255,0.06)] bg-[#0B0E14]">
                    {hour.hour12}
                  </div>
                  
                  <div 
                    className={`flex-1 h-8 border-b border-[rgba(255,255,255,0.06)] relative ${isHovered ? 'bg-[rgba(59,130,246,0.08)]' : 'hover:bg-[rgba(255,255,255,0.02)]'} transition-colors duration-100`}
                    onClick={() => {
                      if (!eventMap.has(hourIndex)) {
                        handleSlotClick(currentDate, hourIndex);
                      }
                    }}
                    onMouseEnter={() => setHoveredSlot(key)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    {eventMap.has(hourIndex) ? (
                      eventMap.get(hourIndex).map((event: CalendarEvent, eventIndex: number) => (
                        <div
                          key={`${hourIndex}-${eventIndex}`}
                          className={`absolute p-2 rounded-md text-xs shadow-md border border-white/10 backdrop-blur-sm ${getEventColor(event.status)} text-white z-10 transition-all duration-200 ease-in-out hover:shadow-lg cursor-pointer`}
                          style={{
                            top: `${((event.start.getHours() * 60 + event.start.getMinutes()) / 1440) * 100}%`,
                            height: `${((event.end.getTime() - event.start.getTime()) / (24 * 60 * 60 * 1000)) * 100}%`,
                            width: '90%',
                            left: '5%',
                            minHeight: '25px',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectEvent && event.status !== 'AVAILABLE') onSelectEvent(event);
                          }}
                        >
                          <div className="flex flex-col h-full">
                            <div className="font-medium flex items-center justify-between mb-1">
                              <span className="truncate">{event.title}</span>
                              <span className="text-[10px] bg-white/20 rounded-sm px-1">{event.status}</span>
                            </div>
                            <div className="text-[10px] flex-1 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span>{format(event.start, 'HH:mm')}-{format(event.end, 'HH:mm')}</span>
                              </div>
                              <div className="flex items-center mt-1 opacity-80">
                                <User className="h-2.5 w-2.5 mr-1" />
                                <span className="truncate">Session</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : isHovered && isEditable && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                        Add Event
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // MONTH VIEW
  if (currentView === 'month') {
    // Get first day of the month and all days to display
    const firstDayOfMonth = startOfMonth(currentDate);
    const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
    
    // Create 6 weeks of days (42 days) to ensure we have enough rows
    const days = Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
    
    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    // Get all events for the displayed days
    const monthEvents = combinedEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= startDate && eventDate <= days[days.length - 1];
    });
    
    // Map events to their respective day
    const eventMap = new Map();
    
    monthEvents.forEach(event => {
      const dateStr = format(event.start, 'yyyy-MM-dd');
      
      if (!eventMap.has(dateStr)) {
        eventMap.set(dateStr, []);
      }
      
      eventMap.get(dateStr).push(event);
    });
    
    return (
      <div className="flex flex-col h-full bg-[#0B0E14] text-white">
        {showAvailability && mentorProfileId && (
          <AvailabilityDisplay 
            mentorProfileId={mentorProfileId}
            onAvailabilityLoaded={handleAvailabilityLoaded}
          />
        )}
        
        <CalendarHeader />
        
        {/* Calendar container */}
        <div className="flex-1 overflow-auto border border-[rgba(255,255,255,0.06)] rounded-lg m-4">
          {/* Month header with days of week */}
          <div className="grid grid-cols-7 bg-[#0B0E14] border-b border-[rgba(255,255,255,0.06)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={index} className="p-2 text-center">
                <div className="text-xs text-gray-400">{day}</div>
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div>
            <div className="text-sm p-2 border-b border-[rgba(255,255,255,0.06)] bg-[#0B0E14] font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((day, dayIndex) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventMap.get(dateStr) || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);
                  const cellKey = `month-${dateStr}`;
                  const isHovered = hoveredSlot === cellKey;
                  
                  return (
                    <div 
                      key={dayIndex}
                      className={`min-h-[100px] p-1 border-r border-b last:border-r-0 border-[rgba(255,255,255,0.06)] ${
                        isCurrentMonth ? 'opacity-100' : 'opacity-40'
                      } ${isHovered ? 'bg-[rgba(59,130,246,0.08)]' : isCurrentDay ? 'bg-[rgba(255,255,255,0.03)]' : 'hover:bg-[rgba(255,255,255,0.02)]'} transition-colors duration-100`}
                      onClick={() => {
                        if (dayEvents.length === 0) {
                          handleSlotClick(day);
                        }
                      }}
                      onMouseEnter={() => setHoveredSlot(cellKey)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      <div className={`text-xs mb-1 ${isCurrentDay ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event: CalendarEvent, eventIndex: number) => (
                          <div 
                            key={`${dayIndex}-${eventIndex}`}
                            className={`text-xs p-1.5 rounded-md ${getEventColor(event.status)} text-white shadow-md border border-white/10 backdrop-blur-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectEvent && event.status !== 'AVAILABLE') onSelectEvent(event);
                              else if (event.status === 'AVAILABLE') handleSlotClick(day);
                            }}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-medium truncate">{event.title}</span>
                                <span className="text-[10px] bg-white/20 rounded-sm px-1">{event.status}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span>{format(event.start, 'HH:mm')}-{format(event.end, 'HH:mm')}</span>
                                {event.mentorName && event.menteeName && (
                                  <span className="flex items-center opacity-80">
                                    <User className="h-2 w-2 mr-0.5" />
                                    <span className="truncate">Session</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-400 pl-1">
                            + {dayEvents.length - 3} more
                          </div>
                        )}
                        
                        {isHovered && isEditable && dayEvents.length === 0 && (
                          <div className="text-xs text-gray-400 p-1 flex items-center justify-center">
                            Add Event
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
} 