import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

interface Availability {
  day: string;
  slots: { start: string; end: string }[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: {
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
}

interface MentorProfile {
  title: string | null;
  company: string | null;
  bio: string | null;
  expertise: string[];
  languages: string[];
  skills: string[];
  hourlyRate: number;
  rating: number;
  github: string | null;
  linkedin: string | null;
  website: string | null;
  availability: Availability[];
  reviews: Review[];
}

interface User {
  id: string;
  name: string;
  mentorProfile: MentorProfile | null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mentor = await db.user.findUnique({
      where: {
        id: params.id,
        role: 'MENTOR',
      },
      include: {
        mentorProfile: {
          include: {
            availability: true,
            reviews: {
              include: {
                author: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    }) as User | null;

    if (!mentor) {
      return new NextResponse('Mentor not found', { status: 404 });
    }

    // Transform the data to match the MentorProfile interface
    const transformedMentor = {
      id: mentor.id,
      name: mentor.name,
      title: mentor.mentorProfile?.title || '',
      company: mentor.mentorProfile?.company,
      bio: mentor.mentorProfile?.bio || '',
      expertise: mentor.mentorProfile?.expertise || [],
      languages: mentor.mentorProfile?.languages || [],
      skills: mentor.mentorProfile?.skills || [],
      hourlyRate: mentor.mentorProfile?.hourlyRate || 0,
      rating: mentor.mentorProfile?.rating || 0,
      totalReviews: mentor.mentorProfile?.reviews?.length || 0,
      github: mentor.mentorProfile?.github,
      linkedin: mentor.mentorProfile?.linkedin,
      website: mentor.mentorProfile?.website,
      availability: mentor.mentorProfile?.availability?.map((slot: Availability) => ({
        day: slot.day,
        slots: slot.slots,
      })) || [],
      reviews: mentor.mentorProfile?.reviews?.map((review: Review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        author: {
          name: review.author.name || 'Anonymous',
          image: review.author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author.name || 'Anonymous')}`,
        },
        createdAt: review.createdAt.toISOString(),
      })) || [],
    };

    return NextResponse.json(transformedMentor);
  } catch (error) {
    console.error('[MENTOR_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 