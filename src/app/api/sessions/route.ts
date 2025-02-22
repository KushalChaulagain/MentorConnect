import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// Get all sessions for the current user (both mentor and mentee)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
      },
    });

    let bookings;
    if (user?.role === 'MENTOR') {
      bookings = await prisma.booking.findMany({
        where: {
          mentorProfileId: user.mentorProfile?.id,
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

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Create a new booking
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { mentorProfileId, startTime, endTime } = body;

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
      return new NextResponse('Time slot is not available', { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        mentorProfileId,
        menteeId: session.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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

    // Create notification for the mentor
    await prisma.notification.create({
      data: {
        type: 'booking',
        title: 'New Booking Request',
        message: `${session.user.name} has requested a mentoring session`,
        userId: booking.mentorProfile.user.id,
        senderId: session.user.id,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 