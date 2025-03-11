import { BookingStatus } from '@prisma/client';
import { SchedularView, SchedulerProvider } from "mina-scheduler";
import { useTheme } from 'next-themes';

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
      return 'warning';
    case 'CONFIRMED':
      return 'success';
    case 'COMPLETED':
      return 'primary';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'default';
  }
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
  const { theme } = useTheme();

  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    description: `${event.mentorName ? `Mentor: ${event.mentorName}` : ''} ${event.menteeName ? `Mentee: ${event.menteeName}` : ''}`,
    startDate: event.start,
    endDate: event.end,
    variant: getEventColor(event.status),
  }));

  return (
    <SchedulerProvider initialEvents={formattedEvents}>
      <SchedularView
        views={{ views: [view], mobileViews: [view] }}
        startOfWeek="sunday"
        onEventSelect={onSelectEvent}
        onSlotSelect={onSelectSlot}
        theme={theme as 'dark' | 'light'}
        classNames={{
          views: {
            dayView: "h-[700px]",
            weekView: "h-[700px]",
            monthView: "h-[700px]"
          }
        }}
      />
    </SchedulerProvider>
  );
} 