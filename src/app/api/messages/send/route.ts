import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { authOptions } from '../../auth/[...nextauth]/route';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { bookingId, content } = body;

    if (!bookingId || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    const message = await prisma.message.create({
      data: {
        bookingId,
        senderId: session.user.id,
        content,
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
    });

    // Trigger Pusher event
    await pusher.trigger(`booking-${bookingId}`, 'new-message', message);

    return NextResponse.json(message);
  } catch (error) {
    console.error('[MESSAGES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 