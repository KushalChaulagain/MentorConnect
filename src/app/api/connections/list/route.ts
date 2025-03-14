import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Define connection interface locally
interface ConnectionWithUsers {
  id: string;
  mentorId: string;
  menteeId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  mentor: { id: string; name: string | null; image: string | null };
  mentee: { id: string; name: string | null; image: string | null };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Access Prisma models with bracket notation to work around type issues
    // @ts-ignore - We know this model exists despite type errors
    const connections = await (prisma as any).connection.findMany({
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
    const formattedConnections = connections.map((connection: any) => {
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