import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get top mentors based on rating
    const mentors = await prisma.mentorProfile.findMany({
      where: {
        user: {
          role: 'MENTOR',
          onboardingCompleted: true,
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: 6, // Limit to top 6 mentors
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average rating for each mentor
    const mentorsWithRating = mentors.map((mentor: any) => {
      const rating = mentor.reviews.length > 0
        ? mentor.reviews.reduce((acc: any, review: any) => acc + review.rating, 0) / mentor.reviews.length
        : 0;

      return {
        id: mentor.id,
        userId: mentor.userId,
        title: mentor.title,
        expertise: mentor.expertise,
        rating,
        user: mentor.user,
      };
    });

    return NextResponse.json(mentorsWithRating);
  } catch (error) {
    console.error('[TOP_MENTORS]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 