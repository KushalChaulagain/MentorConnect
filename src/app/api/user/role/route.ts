import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';

const roleUpdateSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { role } = roleUpdateSchema.parse(body);

    // Update user role
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to update user role:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 