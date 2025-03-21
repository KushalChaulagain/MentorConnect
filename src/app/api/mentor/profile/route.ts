import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const profileSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  company: z.string().optional(),
  experience: z.string().min(1, 'Experience is required'),
  expertise: z.array(z.string()),
  skills: z.array(z.string()),
  hourlyRate: z.number().min(1, 'Hourly rate must be at least 1'),
  languages: z.array(z.string()),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // First, verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const data = await req.json();
    console.log('Received data:', data)

    // Validate the data against the schema
    try {
      profileSchema.parse(data);
    } catch (error) {
      console.error('Validation error:', error)
      return new NextResponse('Invalid data format', { status: 400 });
    }

    const {
      title,
      company,
      bio,
      expertise,
      languages,
      skills,
      experience,
      interests,
      goals,
      hourlyRate,
      github,
      linkedin,
      website,
    } = data;

    // Create or update mentor profile with proper error handling
    try {
      const mentorProfile = await prisma.mentorProfile.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          user: {
            connect: {
              id: session.user.id
            }
          },
          title,
          company,
          bio,
          expertise,
          languages,
          skills,
          experience,
          interests,
          goals,
          hourlyRate: parseFloat(hourlyRate),
          github,
          linkedin,
          website,
        },
        update: {
          title,
          company,
          bio,
          expertise,
          languages,
          skills,
          experience,
          interests,
          goals,
          hourlyRate: parseFloat(hourlyRate),
          github,
          linkedin,
          website,
        },
      });

      // Update user's role and onboarding status
      const updatedUser = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          role: 'MENTOR',
          onboardingCompleted: true,
        },
      });

      console.log('Profile created successfully')

      return NextResponse.json({ 
        success: true, 
        profile: mentorProfile,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          role: updatedUser.role,
          onboardingCompleted: updatedUser.onboardingCompleted
        }
      });
    } catch (error) {
      console.error('[MENTOR_PROFILE_UPSERT]', error);
      return new NextResponse('Failed to create/update profile', { status: 500 });
    }
  } catch (error) {
    console.error('[MENTOR_PROFILE_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 