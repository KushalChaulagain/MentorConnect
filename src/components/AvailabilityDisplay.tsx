import { addDays, set } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface AvailabilitySlot {
  id: string;
  day: number; // 0-6 (Sunday to Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  date: Date; // Calculated date object for the current week
}

interface AvailabilityDisplayProps {
  mentorProfileId: string;
  onAvailabilityLoaded: (slots: AvailabilitySlot[]) => void;
}

export function AvailabilityDisplay({ 
  mentorProfileId, 
  onAvailabilityLoaded 
}: AvailabilityDisplayProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        
        // Fetch mentor availability from the API
        const res = await fetch(`/api/availability?mentorProfileId=${mentorProfileId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch availability');
        }
        
        const data = await res.json();
        
        if (!data.availability) {
          setLoading(false);
          return;
        }
        
        // Process availability data for the calendar
        // Convert weekly recurring availability to actual dates for the current week
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0-6 (Sunday to Saturday)
        
        // Find the previous Sunday (start of week)
        const startOfWeek = addDays(today, -currentDayOfWeek);
        
        // Process each availability slot
        const processedSlots = data.availability.map((slot: any) => {
          // Calculate the actual date for this slot in the current week
          const slotDate = addDays(startOfWeek, slot.day);
          
          // Parse time strings to create Date objects
          const startDateTime = set(
            new Date(slotDate),
            {
              hours: parseInt(slot.startTime.split(':')[0]),
              minutes: parseInt(slot.startTime.split(':')[1]),
              seconds: 0,
              milliseconds: 0
            }
          );
          
          return {
            ...slot,
            date: startDateTime
          };
        });
        
        // Pass the processed slots to the parent component
        onAvailabilityLoaded(processedSlots);
      } catch (error) {
        console.error('Error fetching availability:', error);
        toast.error('Failed to load mentor availability');
      } finally {
        setLoading(false);
      }
    };
    
    if (mentorProfileId) {
      fetchAvailability();
    }
  }, [mentorProfileId, onAvailabilityLoaded]);

  // This component doesn't render anything visible
  return null;
} 