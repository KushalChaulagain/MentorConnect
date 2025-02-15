import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Pusher from 'pusher';

// Initialize Pusher with proper error handling
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  useTLS: true
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { requestId, action } = body;

    if (!requestId || !action || !['accept', 'reject'].includes(action)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Get the connection request
    const request = await prisma.connection.findUnique({
      where: { id: requestId },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!request) {
      return new NextResponse("Request not found", { status: 404 });
    }

    if (request.mentorId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the connection status
    const updatedConnection = await prisma.connection.update({
      where: { id: requestId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
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
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    try {
      // Send notification to mentee
      await pusher.trigger(`user-${request.menteeId}`, 'connection-response', {
        connection: updatedConnection,
        action,
        message: `${request.mentor.name} has ${action}ed your connection request.`,
      });
    } catch (error) {
      console.error('Pusher notification error:', error);
      // Continue execution even if notification fails
    }

    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error('Error responding to connection request:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 