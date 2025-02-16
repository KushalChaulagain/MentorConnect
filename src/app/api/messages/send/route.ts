import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
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
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify the user is part of this connection
    const connection = await prisma.connection.findUnique({
      where: {
        id: connectionId,
      },
    });

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 });
    }

    if (connection.mentorId !== session.user.id && connection.menteeId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create the message
    const message = await prisma.message.create({
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
      },
    });

    // Send real-time notification
    await pusher.trigger(`chat-${connectionId}`, 'new-message', message);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 