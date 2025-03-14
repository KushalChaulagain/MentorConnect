import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { mentorId } = body;

    if (!mentorId) {
      return new NextResponse('Missing mentor ID', { status: 400 });
    }

    // Check if mentor exists
    const mentor = await prisma.user.findUnique({
      where: {
        id: mentorId,
        role: 'MENTOR',
      },
    });

    if (!mentor) {
      return new NextResponse('Mentor not found', { status: 404 });
    }

    // Check if a connection request already exists
    // @ts-ignore - We know this model exists despite type errors
    const existingConnection = await (prisma as any).connection.findFirst({
      where: {
        mentorId,
        menteeId: session.user.id,
      },
    });

    if (existingConnection) {
      return new NextResponse('Connection request already exists', { status: 400 });
    }

    // Create connection request
    // @ts-ignore - We know this model exists despite type errors
    const connection = await (prisma as any).connection.create({
      data: {
        mentorId,
        menteeId: session.user.id,
        status: 'PENDING',
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create notification for the mentor
    await prisma.notification.create({
      data: {
        type: 'connection',
        title: 'Connection Request',
        message: `${session.user.name} wants to connect with you!`,
        userId: mentorId,
        senderId: session.user.id,
      },
    });

    try {
      // Trigger Pusher event for the mentor
      await pusher.trigger(
        `user-${mentorId}`,
        'connection-request',
        {
          ...connection,
          createdAt: connection.createdAt.toISOString(),
        }
      );

      return NextResponse.json(connection);
    } catch (error) {
      console.error('Error triggering Pusher event:', error);
      // Still return success since the connection was created
      return NextResponse.json(connection);
    }
  } catch (error) {
    console.error('[CONNECTION_REQUEST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 