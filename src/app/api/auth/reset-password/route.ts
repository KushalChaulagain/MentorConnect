import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Find valid reset token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (passwordReset.expires < new Date()) {
      await prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: { hashedPassword },
    });

    // Delete used reset token
    await prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    return NextResponse.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to reset password:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 