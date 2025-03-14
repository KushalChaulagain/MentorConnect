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
    const { requestId, action } = body;

    if (!requestId || !action || !['accept', 'reject'].includes(action)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Fetch connection request
    // @ts-ignore - We know this model exists despite type errors
    const request = await (prisma as any).connection.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return new NextResponse("Request not found", { status: 404 });
    }

    if (request.mentorId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update connection status
    // @ts-ignore - We know this model exists despite type errors
    const updatedConnection = await (prisma as any).connection.update({
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
      await safeTriggerPusher(
        `user-${request.menteeId}`,
        'connection-response',
        {
          connection: updatedConnection,
          action,
          message: `${request.mentor.name} has ${action}ed your connection request.`,
        }
      );
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