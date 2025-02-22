import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  id?: string;
  day: string;
  slots: TimeSlot[];
}

interface AvailabilityManagerProps {
  mentorProfileId: string;
  onUpdate?: () => void;
}

export default function AvailabilityManager({
  mentorProfileId,
  onUpdate,
}: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState<string>(TIME_SLOTS[8]); // Default to 08:00
  const [endTime, setEndTime] = useState<string>(TIME_SLOTS[17]); // Default to 17:00

  useEffect(() => {
    fetchAvailability();
  }, [mentorProfileId]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(
        `/api/availability?mentorProfileId=${mentorProfileId}`
      );
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: selectedDay,
          slots: [{ start: startTime, end: endTime }],
        }),
      });

      if (!response.ok) throw new Error('Failed to update availability');

      await fetchAvailability();
      onUpdate?.();
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
      const response = await fetch(
        `/api/availability?id=${dayAvailability.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete time slot');

      await fetchAvailability();
      onUpdate?.();
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger>
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OF_WEEK.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger>
            <SelectValue placeholder="Start time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={endTime} onValueChange={setEndTime}>
          <SelectTrigger>
            <SelectValue placeholder="End time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleAddTimeSlot} className="w-full">
        Add Time Slot
      </Button>

      <div className="mt-8 space-y-6">
        {DAYS_OF_WEEK.map((day) => {
          const dayAvailability = availability.find((a) => a.day === day);
          return (
            <div key={day} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{day}</h3>
              {dayAvailability?.slots.length ? (
                <div className="space-y-2">
                  {dayAvailability.slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span>
                        {slot.start} - {slot.end}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTimeSlot(day, index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No availability set</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 