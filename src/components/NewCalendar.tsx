import { BookingStatus } from '@prisma/client';
import { addDays, format, getWeek, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: BookingStatus;
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
}

const getEventColor = (status: BookingStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500';
    case 'CONFIRMED':
      return 'bg-green-500';
    case 'COMPLETED':
      return 'bg-blue-500';
    case 'CANCELLED':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Generate hours for the day (00:00 to 23:00)
const hours = Array.from({ length: 24 }, (_, i) => 
  i < 10 ? `0${i}:00` : `${i}:00`
);

export default function Calendar({
  events,
  onSelectEvent,
  onSelectSlot,
  isEditable = false,
  view = 'week',
  onViewChange,
  date = new Date(),
  onNavigate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(date);
  const [currentView, setCurrentView] = useState(view);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  
  useEffect(() => {
    setCurrentDate(date);
  }, [date]);
  
  useEffect(() => {
    setCurrentView(view);
  }, [view]);

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
        
        <button 
          onClick={() => onSelectSlot?.({ start: new Date(), end: new Date(new Date().setHours(new Date().getHours() + 1)) })}
          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1"
        >
          <Plus size={14} /> Add Event
        </button>
      </div>
    </div>
  );

  // WEEK VIEW
  if (currentView === 'week') {
    // Generate days for the week
    const startDay = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
    
    // Get week number
    const weekNumber = getWeek(currentDate);

    // Filter events for the current week
    const weekEvents = events.filter(event => {
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
            {hours.map((hour, hourIndex) => (
              <div key={hourIndex} className="flex">
                <div className="w-20 p-2 text-xs text-gray-400 border-r border-b border-[rgba(255,255,255,0.06)] bg-[#0B0E14]">
                  {hour}
                </div>
                
                {days.map((day, dayIndex) => {
                  const key = `${dayIndex}-${hourIndex}`;
                  const cellEvents = eventMap.get(key) || [];
                  const isHovered = hoveredSlot === key;
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`flex-1 h-8 border-r border-b last:border-r-0 border-[rgba(255,255,255,0.06)] relative ${isHovered ? 'bg-[rgba(59,130,246,0.08)]' : 'hover:bg-[rgba(255,255,255,0.02)]'} transition-colors duration-100`}
                      onClick={() => handleSlotClick(day, hourIndex)}
                      onMouseEnter={() => setHoveredSlot(key)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      {cellEvents.length > 0 ? (
                        cellEvents.map((event: CalendarEvent, eventIndex: number) => (
                          <div 
                            key={eventIndex}
                            className={`absolute inset-0 m-0.5 p-1 text-xs rounded ${getEventColor(event.status)} text-white overflow-hidden`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectEvent) onSelectEvent(event);
                            }}
                          >
                            {event.title}
                          </div>
                        ))
                      ) : isHovered && (
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
    const dayEvents = events.filter(event => {
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
            {hours.map((hour, hourIndex) => {
              const key = `day-${hourIndex}`;
              const isHovered = hoveredSlot === key;
              
              return (
                <div key={hourIndex} className="flex">
                  <div className="w-20 p-2 text-xs text-gray-400 border-r border-b border-[rgba(255,255,255,0.06)] bg-[#0B0E14]">
                    {hour}
                  </div>
                  
                  <div 
                    className={`flex-1 h-8 border-b border-[rgba(255,255,255,0.06)] relative ${isHovered ? 'bg-[rgba(59,130,246,0.08)]' : 'hover:bg-[rgba(255,255,255,0.02)]'} transition-colors duration-100`}
                    onClick={() => handleSlotClick(currentDate, hourIndex)}
                    onMouseEnter={() => setHoveredSlot(key)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    {eventMap.has(hourIndex) ? (
                      eventMap.get(hourIndex).map((event: CalendarEvent, eventIndex: number) => (
                        <div 
                          key={eventIndex}
                          className={`absolute inset-0 m-0.5 p-1 text-xs rounded ${getEventColor(event.status)} text-white overflow-hidden flex items-center`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectEvent) onSelectEvent(event);
                          }}
                        >
                          <span className="mr-2">{format(event.start, 'HH:mm')}</span>
                          <span className="font-medium">{event.title}</span>
                          {event.mentorName && <span className="ml-2 text-[10px] opacity-90">• {event.mentorName}</span>}
                        </div>
                      ))
                    ) : isHovered && (
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
    const monthEvents = events.filter(event => {
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
                      onClick={() => handleSlotClick(day)}
                      onMouseEnter={() => setHoveredSlot(cellKey)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      <div className={`text-xs mb-1 ${isCurrentDay ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event: CalendarEvent, eventIndex: number) => (
                          <div 
                            key={eventIndex}
                            className={`text-xs p-1 rounded ${getEventColor(event.status)} text-white truncate`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectEvent) onSelectEvent(event);
                            }}
                          >
                            {format(event.start, 'HH:mm')} {event.title}
                          </div>
                        ))}
                        
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-400 pl-1">
                            + {dayEvents.length - 3} more
                          </div>
                        )}
                        
                        {isHovered && dayEvents.length === 0 && (
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