import { BookingStatus } from '@prisma/client';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { Calendar as BigCalendar, View, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  view?: View;
  onViewChange?: (view: View) => void;
  date?: Date;
  onNavigate?: (date: Date) => void;
}

const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = '#3B82F6'; // Default blue
  let borderColor = '#2563EB';

  switch (event.status) {
    case 'PENDING':
      backgroundColor = '#F59E0B';
      borderColor = '#D97706';
      break;
    case 'CONFIRMED':
      backgroundColor = '#10B981';
      borderColor = '#059669';
      break;
    case 'COMPLETED':
      backgroundColor = '#6B7280';
      borderColor = '#4B5563';
      break;
    case 'CANCELLED':
      backgroundColor = '#EF4444';
      borderColor = '#DC2626';
      break;
  }

  return {
    style: {
      backgroundColor,
      borderColor,
      borderWidth: '2px',
      color: 'white',
      borderRadius: '4px',
      padding: '2px 4px',
    },
  };
};

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
  return (
    <div className="h-[700px] bg-background rounded-lg">
      <style jsx global>{`
        .rbc-calendar {
          background-color: transparent;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 500;
          color: var(--foreground);
        }
        .rbc-toolbar button {
          color: var(--foreground);
        }
        .rbc-toolbar button:hover {
          background-color: hsl(var(--muted));
        }
        .rbc-toolbar button.rbc-active {
          background-color: hsl(var(--muted));
          color: hsl(var(--primary));
        }
        .rbc-today {
          background-color: hsl(var(--muted));
        }
        .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.3);
        }
        .rbc-time-content {
          border-top: 1px solid hsl(var(--border));
        }
        .rbc-time-header-content {
          border-left: 1px solid hsl(var(--border));
        }
        .rbc-time-header.rbc-overflowing {
          border-right: 1px solid hsl(var(--border));
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid hsl(var(--border));
        }
        .rbc-time-slot {
          color: var(--foreground);
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.5);
        }
        .rbc-time-view {
          border: 1px solid hsl(var(--border));
        }
        .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
        }
      `}</style>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable={isEditable}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={onViewChange}
        date={date}
        onNavigate={onNavigate}
        formats={{
          timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
        }}
        className="text-foreground"
      />
    </div>
  );
}

