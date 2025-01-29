import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: {
        mentorProfile: true,
      },
    });

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    // Check if user is either the mentor or mentee
    if (
      booking.menteeId !== session.user.id &&
      booking.mentorProfile.userId !== session.user.id
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        bookingId: params.bookingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[MESSAGES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 