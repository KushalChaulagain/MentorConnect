import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { connectionId } = body;

    if (!connectionId) {
      return new NextResponse("Connection ID is required", { status: 400 });
    }

    // Verify the connection exists and belongs to the user
    // @ts-ignore - We know this model exists despite type errors
    const connection = await (prisma as any).connection.findUnique({
      where: {
        id: connectionId,
      },
    });

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 });
    }

    // Verify the user is either the mentor or mentee of this connection
    if (connection.mentorId !== session.user.id && connection.menteeId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update connection status to REMOVED
    // @ts-ignore - We know this model exists despite type errors
    const updatedConnection = await (prisma as any).connection.update({
      where: { id: connectionId },
      data: {
        status: 'REMOVED',
      },
    });

    // Create a notification for the other party
    const isUserMentor = connection.mentorId === session.user.id;
    const recipientId = isUserMentor ? connection.menteeId : connection.mentorId;
    const senderName = session.user.name || "A user";

    // @ts-ignore - We know this model exists despite type errors
    await (prisma as any).notification.create({
      data: {
        type: 'connection',
        title: 'Connection Removed',
        message: `${senderName} has removed the connection with you.`,
        userId: recipientId,
        senderId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error('Error removing connection:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 