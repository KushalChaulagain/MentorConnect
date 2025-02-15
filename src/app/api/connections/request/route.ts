import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

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
    const existingConnection = await prisma.connection.findFirst({
      where: {
        mentorId,
        menteeId: session.user.id,
      },
    });

    if (existingConnection) {
      return new NextResponse('Connection request already exists', { status: 400 });
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        mentorId,
        menteeId: session.user.id,
        status: 'PENDING',
      },
      include: {
        mentor: {
          select: {
            name: true,
            email: true,
          },
        },
        mentee: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notification to mentor about new connection request
    // This could be implemented using email notifications or real-time notifications

    return NextResponse.json(connection);
  } catch (error) {
    console.error('[CONNECTION_REQUEST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 