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

    const { role } = await req.json();

    if (!role || !['MENTOR', 'MENTEE'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        role: role as Role,
        onboardingCompleted: role === 'MENTOR' ? false : true
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 