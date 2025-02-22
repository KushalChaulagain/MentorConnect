import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { status } = body as { status: BookingStatus };

    // Verify the booking exists and the user has permission to update it
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        mentorProfile: {
          include: {
            user: true,
          },
        },
        mentee: true,
      },
    });

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    // Check if the user is either the mentor or mentee of the booking
    const isMentor = booking.mentorProfile.user.id === session.user.id;
    const isMentee = booking.menteeId === session.user.id;

    if (!isMentor && !isMentee) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        mentorProfile: {
          include: {
            user: true,
          },
        },
        mentee: true,
      },
    });

    // Create a notification for the other party
    const notificationReceiverId = isMentor ? booking.menteeId : booking.mentorProfile.user.id;
    const statusMessage = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'marked as completed',
    }[status];

    if (statusMessage) {
      await prisma.notification.create({
        data: {
          type: 'booking',
          title: 'Session Update',
          message: `Your session has been ${statusMessage}`,
          userId: notificationReceiverId,
          senderId: session.user.id,
        },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 