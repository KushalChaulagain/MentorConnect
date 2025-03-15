import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeTriggerPusher } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
        safeTriggerPusher(channelName, 'new-message', eventData),
        safeTriggerPusher(`user-${recipientId}`, 'notification-message', eventData)
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