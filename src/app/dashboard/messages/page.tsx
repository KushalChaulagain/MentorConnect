'use client';

import { ChatInterface } from '@/components/chat-interface';
import { DashboardLayout } from '@/components/dashboard-layout';
import MentorFeatureGuard from "@/components/MentorFeatureGuard";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  mentorProfile: {
    id: string;
    user: {
      id: string;
      name: string;
      image: string;
    };
  };
  mentee: {
    id: string;
    name: string;
    image: string;
  };
}

export default function MessagesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(data);
        if (data.length > 0) {
          setSelectedBooking(data[0]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  const isMentor = session?.user?.role === 'MENTOR';

  const getOtherUser = (booking: Booking) => {
    return isMentor ? booking.mentee : booking.mentorProfile.user;
  };

  return isMentor ? (
    <MentorFeatureGuard feature="messaging">
      <DashboardLayout>
        <div className="flex h-[calc(100vh-4rem)] gap-4">
          <div className="w-1/3 overflow-y-auto">
            <div className="space-y-4">
              {bookings.map((booking) => {
                const otherUser = getOtherUser(booking);
                return (
                  <Card
                    key={booking.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedBooking?.id === booking.id
                        ? 'bg-gray-50 dark:bg-gray-800'
                        : ''
                    }`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={otherUser.image} />
                        <AvatarFallback>
                          {otherUser.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {otherUser.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={booking.status.toLowerCase() as any}>
                        {booking.status}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          <div className="flex-1">
            {selectedBooking ? (
              <ChatInterface
                bookingId={selectedBooking.id}
                otherUser={getOtherUser(selectedBooking)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a booking to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </MentorFeatureGuard>
  ) : (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] gap-4">
        <div className="w-1/3 overflow-y-auto">
          <div className="space-y-4">
            {bookings.map((booking) => {
              const otherUser = getOtherUser(booking);
              return (
                <Card
                  key={booking.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedBooking?.id === booking.id
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : ''
                  }`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={otherUser.image} />
                      <AvatarFallback>
                        {otherUser.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {otherUser.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={booking.status.toLowerCase() as any}>
                      {booking.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        <div className="flex-1">
          {selectedBooking ? (
            <ChatInterface
              bookingId={selectedBooking.id}
              otherUser={getOtherUser(selectedBooking)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">
                Select a booking to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 