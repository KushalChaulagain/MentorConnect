import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const profileSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  company: z.string().optional(),
  experience: z.number().min(1, 'Experience must be at least 1 year'),
  expertise: z.array(z.string()),
  skills: z.array(z.string()),
  hourlyRate: z.number().min(1, 'Hourly rate must be at least 1'),
  languages: z.array(z.string()),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = profileSchema.parse(body);

    // Update user role to MENTOR and create mentor profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: UserRole.MENTOR,
        mentorProfile: {
          create: {
            title: data.title,
            company: data.company,
            experience: data.experience.toString(),
            expertise: data.expertise,
            skills: data.skills,
            hourlyRate: data.hourlyRate,
            languages: data.languages,
            bio: data.bio,
            github: data.github,
            linkedin: data.linkedin,
            availability: {},
          },
        },
      },
      include: {
        mentorProfile: true,
      },
    });

    return NextResponse.json({
      message: 'Mentor profile created successfully',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to create mentor profile:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 