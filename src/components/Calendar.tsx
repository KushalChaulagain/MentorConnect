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
  let backgroundColor;
  let borderColor;
  let opacity = '1';

  switch (event.status) {
    case 'PENDING':
      backgroundColor = 'hsl(48 96% 89%)';
      borderColor = 'hsl(45 93% 47%)';
      break;
    case 'CONFIRMED':
      backgroundColor = 'hsl(142 76% 36%)';
      borderColor = 'hsl(142 72% 29%)';
      break;
    case 'COMPLETED':
      backgroundColor = 'hsl(217 91% 60%)';
      borderColor = 'hsl(217 91% 50%)';
      break;
    case 'CANCELLED':
      backgroundColor = 'hsl(0 84% 60%)';
      borderColor = 'hsl(0 84% 50%)';
      opacity = '0.8';
      break;
    default:
      backgroundColor = 'hsl(217 91% 60%)';
      borderColor = 'hsl(217 91% 50%)';
  }

  return {
    style: {
      backgroundColor,
      borderColor,
      borderWidth: '1px',
      borderStyle: 'solid',
      color: event.status === 'PENDING' ? 'hsl(20 5% 9%)' : 'white',
      borderRadius: '6px',
      padding: '2px 6px',
      opacity,
      fontSize: '0.875rem',
      fontWeight: 500,
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
    <div className="h-[700px] bg-background rounded-lg overflow-hidden">
      <style jsx global>{`
        .rbc-calendar {
          background-color: hsl(var(--background));
          font-family: system-ui, -apple-system, sans-serif;
        }
        .rbc-header {
          padding: 12px 4px;
          font-weight: 600;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          background: hsl(var(--accent) / 0.1);
          border-bottom: 1px solid hsl(var(--border));
        }
        .rbc-month-view {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
          background: hsl(var(--background));
        }
        .rbc-month-row {
          border-top: 1px solid hsl(var(--border) / 0.3);
        }
        .rbc-date-cell {
          padding: 8px;
          text-align: right;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }
        .rbc-off-range {
          color: hsl(var(--muted-foreground) / 0.5);
        }
        .rbc-off-range-bg {
          background: hsl(var(--muted) / 0.3);
        }
        .rbc-day-bg {
          border-left: 1px solid hsl(var(--border) / 0.3);
          transition: all 0.2s ease;
        }
        .rbc-day-bg:hover {
          background: hsl(var(--accent) / 0.1);
        }
        .rbc-today {
          background-color: hsl(var(--primary) / 0.1) !important;
        }
        .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
          height: 2px;
        }
        .rbc-event {
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 13px;
          border: none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.1s ease;
        }
        .rbc-event:hover {
          transform: scale(1.02);
        }
        .rbc-toolbar {
          display: none;
        }
        .rbc-time-view {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
          background: hsl(var(--background));
        }
        .rbc-time-header {
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--accent) / 0.1);
        }
        .rbc-time-content {
          border-top: 1px solid hsl(var(--border));
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid hsl(var(--border) / 0.2);
          min-height: 60px;
        }
        .rbc-time-gutter {
          font-size: 11px;
          font-weight: 500;
          padding: 0 8px;
          color: hsl(var(--muted-foreground));
          background: hsl(var(--muted) / 0.1);
        }
        .rbc-time-slot {
          color: hsl(var(--muted-foreground));
          font-size: 12px;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.1);
        }
        .rbc-time-column {
          background: hsl(var(--background));
        }
        .rbc-day-slot .rbc-events-container {
          margin-right: 1px;
        }
        .rbc-time-view .rbc-row {
          min-height: 40px;
        }
        .rbc-show-more {
          color: hsl(var(--primary));
          font-size: 0.875rem;
          font-weight: 500;
          padding: 2px 4px;
          background: transparent;
        }
        .rbc-show-more:hover {
          color: hsl(var(--primary));
          background: hsl(var(--accent) / 0.1);
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

