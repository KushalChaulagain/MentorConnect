'use client';

import AvailabilityManager from '@/components/AvailabilityManager';
import { toast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MentorProfile {
  id: string;
  userId: string;
}

export default function AvailabilityPage() {
  const { data: session } = useSession();
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchMentorProfile();
    }
  }, [session]);

  const fetchMentorProfile = async () => {
    try {
      const response = await fetch('/api/mentor-profile');
      if (!response.ok) throw new Error('Failed to fetch mentor profile');
      const data = await response.json();
      setMentorProfile(data);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentor profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!session?.user) {
    redirect('/login');
  }

  if (!mentorProfile) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Availability</h1>
        <p className="text-gray-500">
          You need to be a mentor to manage availability. Please complete your
          mentor profile first.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Availability</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <AvailabilityManager mentorProfileId={mentorProfile.id} />
      </div>
    </div>
  );
} 