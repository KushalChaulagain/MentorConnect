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

    const pendingRequests = await prisma.connection.findMany({
      where: {
        mentorId: session.user.id,
        status: 'PENDING',
      },
      include: {
        mentee: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 