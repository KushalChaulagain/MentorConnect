import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Pusher from 'pusher';

// Validate environment variables first
const requiredEnvVars = {
  PUSHER_APP_ID: process.env.PUSHER_APP_ID,
  NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  PUSHER_SECRET: process.env.PUSHER_SECRET,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize Pusher with your credentials
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
  host: `api-${process.env.NEXT_PUBLIC_PUSHER_CLUSTER}.pusher.com`,
});

// Log Pusher configuration on initialization
console.log('Server Pusher configuration:', {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  host: `api-${process.env.NEXT_PUBLIC_PUSHER_CLUSTER}.pusher.com`,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { connectionId, content } = body;

    if (!connectionId || !content) {
      console.error('Missing required fields:', { connectionId, content });
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify connection exists and user is part of it
    // @ts-ignore - We know this model exists despite type errors
    const connection = await (prisma as any).connection.findUnique({
      where: {
        id: connectionId,
      },
    });

    if (!connection) {
      console.error('Connection not found:', connectionId);
      return new NextResponse("Connection not found", { status: 404 });
    }

    if (connection.mentorId !== session.user.id && connection.menteeId !== session.user.id) {
      console.error('User not authorized for this connection:', { userId: session.user.id, connectionId });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create the message
    // @ts-ignore - We know this model exists despite type errors
    const message = await (prisma as any).message.create({
      data: {
        content,
        senderId: session.user.id,
        connectionId: connectionId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        connection: {
          select: {
            mentorId: true,
            menteeId: true,
          },
        },
      },
    });

    console.log('Message created successfully:', message.id);

    // Create notification for the recipient
    const recipientId = message.connection.mentorId === session.user.id 
      ? message.connection.menteeId 
      : message.connection.mentorId;

    // @ts-ignore - We know this model exists despite type errors
    await (prisma as any).notification.create({
      data: {
        type: 'message',
        title: 'New Message',
        message: message.content,
        userId: recipientId,
        senderId: session.user.id,
      },
    });

    try {
      const channelName = `chat-${connectionId}`;
      console.log('Attempting to trigger Pusher event:', {
        channel: channelName,
        event: 'new-message',
        messageId: message.id
      });

      const eventData = {
        ...message,
        createdAt: message.createdAt.toISOString(),
      };

      // Trigger Pusher events for both chat and user channels
      await Promise.all([
        pusher.trigger(channelName, 'new-message', eventData),
        pusher.trigger(`user-${recipientId}`, 'new-message', eventData)
      ]);
      
      console.log('Pusher events triggered successfully');

      return NextResponse.json(message);
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
      // Return the message even if Pusher fails, but include error details
      return NextResponse.json({
        message,
        error: {
          type: 'PUSHER_ERROR',
          details: pusherError instanceof Error ? pusherError.message : 'Unknown Pusher error'
        }
      });
    }
  } catch (error) {
    console.error('Error in message sending:', error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
} 