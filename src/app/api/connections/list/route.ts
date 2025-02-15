import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          {
            mentorId: session.user.id,
            status: 'ACCEPTED',
          },
          {
            menteeId: session.user.id,
            status: 'ACCEPTED',
          },
        ],
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format the connections based on user role
    const formattedConnections = connections.map(connection => {
      if (session.user.id === connection.mentorId) {
        return {
          ...connection,
          otherUser: connection.mentee,
        };
      } else {
        return {
          ...connection,
          otherUser: connection.mentor,
        };
      }
    });

    return NextResponse.json(formattedConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 