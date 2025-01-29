import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';

const onboardingSchema = z.object({
  title: z.string(),
  hourlyRate: z.number(),
  experience: z.string(),
  interests: z.array(z.string()),
  goals: z.array(z.string()),
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
    const data = onboardingSchema.parse(body);

    // Update user profile with onboarding data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        mentorProfile: {
          upsert: {
            create: {
              title: data.title,
              hourlyRate: data.hourlyRate,
              experience: data.experience,
              interests: data.interests,
              goals: data.goals,
            },
            update: {
              experience: data.experience,
              interests: data.interests,
              goals: data.goals,
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to save onboarding data:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 