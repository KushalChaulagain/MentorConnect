import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { safeTriggerPusher } from '@/lib/pusher-server';
import { NextResponse } from 'next/server';

// Get all sessions for the current user (both mentor and mentee)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let bookings = [];
    try {
      if (user?.role === 'MENTOR') {
        if (!user.mentorProfile?.id) {
          return new NextResponse('Mentor profile not found', { status: 404 });
        }
        
        bookings = await prisma.booking.findMany({
          where: {
            mentorProfileId: user.mentorProfile.id,
          },
          include: {
            mentee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        });
      } else {
        bookings = await prisma.booking.findMany({
          where: {
            menteeId: userId,
          },
          include: {
            mentorProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return new NextResponse(
        'Error fetching bookings: ' + (error instanceof Error ? error.message : 'Unknown error'), 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return new NextResponse(
      'Internal Server Error: ' + (error instanceof Error ? error.message : 'Unknown error'), 
      { status: 500 }
    );
  }
}

// Create a new booking
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { mentorProfileId, startTime, endTime } = body;

    // Add more robust validation
    if (!mentorProfileId) {
      return new NextResponse('Missing required field: mentorProfileId', { status: 400 });
    }
    
    if (!startTime || !endTime) {
      return new NextResponse('Missing required fields: startTime and endTime', { status: 400 });
    }

    // Validate date formats and ordering
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return new NextResponse('Invalid date format for startTime or endTime', { status: 400 });
    }
    
    if (startDate >= endDate) {
      return new NextResponse('startTime must be before endTime', { status: 400 });
    }
    
    // Don't allow booking in the past
    if (startDate < new Date()) {
      return new NextResponse('Cannot book sessions in the past', { status: 400 });
    }

    // Verify that the mentorProfile exists
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
      include: { user: true }
    });

    if (!mentorProfile) {
      return new NextResponse('Mentor profile not found', { status: 404 });
    }
    
    // Verify there's a connection between mentee and mentor
    const connection = await prisma.connection.findFirst({
      where: {
        menteeId: session.user.id,
        mentorId: mentorProfile.userId,
        status: 'ACCEPTED',
      },
    });

    if (!connection) {
      return new NextResponse('You need to be connected with this mentor to book a session', { status: 403 });
    }

    // Validate the time slot is available
    const existingBooking = await prisma.booking.findFirst({
      where: {
        mentorProfileId,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return new NextResponse('This time slot is no longer available', { status: 409 });
    }

    let booking;
    try {
      // Create the booking with proper relationship connections
      booking = await prisma.booking.create({
        data: {
          mentorProfile: {
            connect: { id: mentorProfileId }
          },
          mentee: {
            connect: { id: session.user.id }
          },
          startTime: startDate,
          endTime: endDate,
          status: 'PENDING',
        },
        include: {
          mentorProfile: {
            include: {
              user: true,
            },
          },
          mentee: true,
        },
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      return new NextResponse(
        'Failed to create booking: ' + (error instanceof Error ? error.message : 'Unknown error'), 
        { status: 500 }
      );
    }

    // Get formatted start time for notification
    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    let mentorNotification, menteeNotification;
    
    try {
      // Create notification for the mentor
      mentorNotification = await prisma.notification.create({
        data: {
          type: 'session',
          title: 'New Booking Request',
          message: `${session.user.name} has requested a mentoring session on ${formattedDate} at ${formattedTime}. Session ID: ${booking.id}`,
          userId: booking.mentorProfile.user.id,
          senderId: session.user.id,
          read: false
        },
      });

      // Create notification for mentee
      menteeNotification = await prisma.notification.create({
        data: {
          type: 'session',
          title: 'Session Request Sent',
          message: `Your session request with ${booking.mentorProfile.user.name} for ${formattedDate} at ${formattedTime} has been sent. Session ID: ${booking.id}`,
          userId: session.user.id,
          senderId: session.user.id, // Self-notification
          read: false
        },
      });
    } catch (error) {
      console.error('Error creating notifications:', error);
      // Continue execution even if notifications fail - booking was already created
    }

    try {
      // Send real-time notifications with additional metadata for the frontend
      if (mentorNotification) {
        await safeTriggerPusher(`user-${booking.mentorProfile.user.id}`, 'notification', {
          ...mentorNotification,
          metadata: {
            sessionId: booking.id,
            menteeId: session.user.id,
            action: 'requested',
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (menteeNotification) {
        await safeTriggerPusher(`user-${session.user.id}`, 'notification', {
          ...menteeNotification,
          metadata: {
            sessionId: booking.id,
            mentorId: booking.mentorProfile.user.id,
            action: 'requested',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Send real-time session update for mentor dashboard
      await safeTriggerPusher(`user-${booking.mentorProfile.user.id}`, 'session-update', {
        type: 'new-request',
        sessionId: booking.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending real-time notifications:', error);
      // Continue execution even if real-time notifications fail
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return new NextResponse('Internal Server Error: ' + (error instanceof Error ? error.message : 'Unknown error'), { status: 500 });
  }
} 