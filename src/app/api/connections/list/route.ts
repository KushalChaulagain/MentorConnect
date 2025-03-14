import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Connection } from "@prisma/client";
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
    const formattedConnections = connections.map((connection) => {
      // Properly type the connection
      type ConnectionWithUsers = Connection & {
        mentor: { id: string; name: string | null; image: string | null };
        mentee: { id: string; name: string | null; image: string | null };
      };
      
      const typedConnection = connection as ConnectionWithUsers;
      
      if (session.user.id === typedConnection.mentorId) {
        return {
          ...typedConnection,
          otherUser: typedConnection.mentee,
        };
      } else {
        return {
          ...typedConnection,
          otherUser: typedConnection.mentor,
        };
      }
    });

    return NextResponse.json(formattedConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 