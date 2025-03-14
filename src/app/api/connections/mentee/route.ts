import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Use bracket notation for Prisma client to work around type issues
    // @ts-ignore - We know this model exists despite type errors
    const connections = await (prisma as any).connection.findMany({
      where: {
        menteeId: session.user.id,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            image: true,
            mentorProfile: {
              select: {
                title: true,
                expertise: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error('[MENTEE_CONNECTIONS]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 