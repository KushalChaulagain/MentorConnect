import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';

const mentorProfileSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  company: z.string().optional(),
  experience: z.string().min(1, 'Experience is required'),
  education: z.string().optional(),
  languages: z.array(z.string()).min(1, 'At least one programming language is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
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
    const data = mentorProfileSchema.parse(body);

    // Check if user already has a mentor profile
    const existingProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { message: 'Mentor profile already exists' },
        { status: 400 }
      );
    }

    // Create mentor profile with default availability
    const profile = await prisma.mentorProfile.create({
      data: {
        ...data,
        user: {
          connect: {
            id: session.user.id
          }
        },
        hourlyRate: 0,
      },
    });

    return NextResponse.json(profile, { status: 201 });
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