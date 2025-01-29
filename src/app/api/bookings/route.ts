import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isMentor = session.user.role === 'MENTOR';

    let bookings;
    if (isMentor) {
      // Get mentor's profile first
      const mentorProfile = await prisma.mentorProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!mentorProfile) {
        return new NextResponse('Mentor profile not found', { status: 404 });
      }

      // Get bookings for mentor
      bookings = await prisma.booking.findMany({
        where: {
          mentorProfileId: mentorProfile.id,
        },
        include: {
          mentorProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
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
          createdAt: 'desc',
        },
      });
    } else {
      // Get bookings for mentee
      bookings = await prisma.booking.findMany({
        where: {
          menteeId: session.user.id,
        },
        include: {
          mentorProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
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
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[BOOKINGS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 