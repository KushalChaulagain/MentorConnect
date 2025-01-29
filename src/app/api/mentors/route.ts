import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const languages = searchParams.get('languages')?.split(',').filter(Boolean) || [];
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || Number.MAX_SAFE_INTEGER;

    const mentors = await prisma.user.findMany({
      where: {
        role: UserRole.MENTOR,
        name: search ? { contains: search, mode: 'insensitive' } : undefined,
        AND: [
          {
            mentorProfile: {
              hourlyRate: {
                gte: minPrice,
                lte: maxPrice,
              },
              ...(languages.length > 0 && {
                languages: {
                  hasSome: languages,
                },
              }),
              ...(skills.length > 0 && {
                skills: {
                  hasSome: skills,
                },
              }),
            },
          },
        ],
      },
      include: {
        mentorProfile: true,
        mentorReviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Transform the data to match the Mentor interface
    const transformedMentors = mentors.map((mentor) => {
      const profile = mentor.mentorProfile;
      if (!profile) {
        throw new Error('Mentor profile not found');
      }

      const totalReviews = mentor.mentorReviews.length;
      const averageRating = totalReviews > 0
        ? mentor.mentorReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      return {
        id: mentor.id,
        name: mentor.name,
        title: profile.title,
        company: profile.company || '',
        expertise: profile.expertise,
        hourlyRate: profile.hourlyRate,
        languages: profile.languages,
        skills: profile.skills,
        rating: averageRating,
        totalReviews,
      };
    });

    return NextResponse.json(transformedMentors);
  } catch (error) {
    console.error('Failed to fetch mentors:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 