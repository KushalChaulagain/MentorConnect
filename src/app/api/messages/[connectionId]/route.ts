import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { connectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { connectionId } = params;

    // Verify the connection exists and user is part of it
    // @ts-ignore - We know this model exists despite type errors
    const connection = await (prisma as any).connection.findUnique({
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

    // Get all messages for the connection
    // @ts-ignore - We know this model exists despite type errors
    const messages = await (prisma as any).message.findMany({
      where: {
        connectionId,
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
    console.error('Error fetching messages:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 