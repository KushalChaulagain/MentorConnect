import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized - No valid session found' },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const { role } = await req.json();

    console.log('Session info:', {
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    });

    // Check if email exists in database directly
    const allUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    console.log('All similar email users:', allUsers);

    if (!role || !['MENTOR', 'MENTEE'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user exists in both Account and User tables
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    });

    console.log('Database lookup result:', existingUser);

    if (!existingUser) {
      return NextResponse.json(
        { message: 'User account not found' },
        { status: 404 }
      );
    }

    // Update user role and ensure onboarding is marked as started
    const updatedUser = await prisma.user.update({
      where: { 
        id: existingUser.id  // Use ID instead of email for more reliable updates
      },
      data: { 
        role: role as Role,
        onboardingCompleted: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        onboardingCompleted: true
      }
    });

    return NextResponse.json(
      { 
        message: 'Role updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          onboardingCompleted: updatedUser.onboardingCompleted
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { message: 'Internal server error during role update' },
      { status: 500 }
    );
  }
} 