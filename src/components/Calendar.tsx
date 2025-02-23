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
  view = 'month',
  onViewChange,
  date = new Date(),
  onNavigate,
}: CalendarProps) {
  return (
    <div className="h-[700px] bg-[#0F172A] rounded-lg overflow-hidden border border-gray-800">
      <style jsx global>{`
        /* Base calendar styles */
        .rbc-calendar {
          @apply bg-[#0F172A] font-sans text-gray-200;
        }

        /* Header styles */
        .rbc-header {
          @apply px-4 py-3 font-semibold uppercase text-xs tracking-wider bg-gray-800/50 border-b border-gray-800;
        }

        /* Month view styles */
        .rbc-month-view {
          @apply border border-gray-800 rounded-lg overflow-hidden bg-[#0F172A];
        }

        .rbc-month-row {
          @apply border-t border-gray-800/30;
        }

        /* Date cell styles */
        .rbc-date-cell {
          @apply p-2 text-right text-sm text-gray-300;
        }

        .rbc-date-cell.rbc-now {
          @apply font-bold text-blue-400;
        }

        .rbc-off-range {
          @apply text-gray-600;
        }

        .rbc-off-range-bg {
          @apply bg-gray-900/30;
        }

        /* Day background styles */
        .rbc-day-bg {
          @apply border-l border-gray-800/30 transition-colors duration-200;
        }

        .rbc-day-bg:hover {
          @apply bg-gray-800/20;
        }

        .rbc-today {
          @apply bg-blue-900/20 !important;
        }

        /* Event styles */
        .rbc-event {
          @apply rounded px-2 py-1 text-xs border-0 shadow-sm transition-transform duration-200 ease-in-out;
        }

        .rbc-event:hover {
          @apply transform scale-[1.02];
        }

        /* Time view styles */
        .rbc-time-view {
          @apply border border-gray-800 rounded-lg overflow-hidden bg-[#0F172A];
        }

        .rbc-time-header {
          @apply border-b border-gray-800 bg-gray-800/50;
        }

        .rbc-time-content {
          @apply border-t border-gray-800;
        }

        .rbc-timeslot-group {
          @apply border-b border-gray-800/20 min-h-[60px];
        }

        .rbc-time-gutter {
          @apply text-xs font-medium px-2 text-gray-400 bg-gray-800/20;
        }

        .rbc-time-slot {
          @apply text-gray-400 text-xs;
        }

        /* Remove all yellow outlines and improve selection states */
        .rbc-selected,
        .rbc-selected-cell,
        .rbc-day-slot .rbc-selected,
        .rbc-day-slot .rbc-selected:focus,
        .rbc-day-slot .rbc-selected:hover,
        .rbc-day-slot .rbc-selected.rbc-current,
        .rbc-day-slot .rbc-background-event,
        .rbc-selected.rbc-background-event,
        .rbc-day-slot .rbc-selected.rbc-background-event {
          @apply bg-transparent outline-none ring-0 shadow-none !important;
        }

        /* Time slot selection */
        .rbc-time-slot.rbc-selected,
        .rbc-time-slot:focus,
        .rbc-time-slot:hover {
          @apply bg-transparent outline-none !important;
        }

        /* Event selection */
        .rbc-event.rbc-selected,
        .rbc-event:focus {
          @apply ring-2 ring-blue-500 ring-offset-0 !important;
        }

        /* Day selection */
        .rbc-day-bg.rbc-selected-cell {
          @apply bg-gray-800/40 !important;
        }

        /* Remove focus outlines */
        .rbc-calendar *:focus {
          @apply outline-none ring-0 !important;
        }

        /* Time slot hover */
        .rbc-time-slot:hover {
          @apply bg-gray-800/20 !important;
        }

        /* Header selection */
        .rbc-header.rbc-selected,
        .rbc-header:focus {
          @apply outline-none bg-transparent !important;
        }

        /* Current time indicator */
        .rbc-current-time-indicator {
          @apply bg-blue-500 h-0.5;
        }

        /* Hide toolbar */
        .rbc-toolbar {
          @apply hidden;
        }

        /* Show more link */
        .rbc-show-more {
          @apply text-blue-400 text-sm font-medium px-1 py-0.5 hover:bg-gray-800/20 rounded;
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
          dayFormat: (date: Date) => format(date, 'EEE'),
          dayHeaderFormat: (date: Date) => format(date, 'EEE dd'),
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'MMMM dd')} - ${format(end, 'MMMM dd, yyyy')}`,
        }}
        className="text-gray-200"
      />
    </div>
  );
}

