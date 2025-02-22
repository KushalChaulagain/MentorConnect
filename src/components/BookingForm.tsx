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

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

interface BookingFormProps {
  mentorProfileId: string;
  onBookingComplete?: () => void;
}

export default function BookingForm({
  mentorProfileId,
  onBookingComplete,
}: BookingFormProps) {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // Set the first available day as default
      if (data.length > 0 && !selectedDay) {
        setSelectedDay(data[0].day);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load availability. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBookSession = async () => {
    if (!selectedDay || !selectedSlot) {
      toast({
        title: 'Error',
        description: 'Please select a day and time slot.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorProfileId,
          startTime: `${selectedDay} ${selectedSlot.start}`,
          endTime: `${selectedDay} ${selectedSlot.end}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to book session');

      toast({
        title: 'Success',
        description: 'Session booked successfully.',
      });

      onBookingComplete?.();
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: 'Error',
        description: 'Failed to book session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableDays = availability.filter((day) => day.slots.length > 0);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Day
          </label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a day" />
            </SelectTrigger>
            <SelectContent>
              {availableDays.map((day) => (
                <SelectItem key={day.day} value={day.day}>
                  {day.day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDay && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availability
                .find((day) => day.day === selectedDay)
                ?.slots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedSlot === slot ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedSlot(slot)}
                    className="justify-start"
                  >
                    {slot.start} - {slot.end}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleBookSession}
        disabled={!selectedDay || !selectedSlot || isLoading}
        className="w-full"
      >
        {isLoading ? 'Booking...' : 'Book Session'}
      </Button>
    </div>
  );
} 