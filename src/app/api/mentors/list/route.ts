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

    const mentors = await prisma.mentorProfile.findMany({
      where: {
        user: {
          role: 'MENTOR',
          onboardingCompleted: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Calculate average rating for each mentor
    const mentorsWithRating = await Promise.all(
      mentors.map(async (mentor) => {
        const reviews = await prisma.mentorReview.findMany({
          where: {
            mentorProfileId: mentor.id,
          },
          select: {
            rating: true,
          },
        });

        const rating = reviews.length > 0
          ? reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / reviews.length
          : 0;

        return {
          id: mentor.id,
          userId: mentor.userId,
          title: mentor.title,
          bio: mentor.bio,
          expertise: mentor.expertise,
          hourlyRate: mentor.hourlyRate,
          rating,
          user: mentor.user,
        };
      })
    );

    return NextResponse.json(mentorsWithRating);
  } catch (error) {
    console.error('[MENTORS_LIST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 