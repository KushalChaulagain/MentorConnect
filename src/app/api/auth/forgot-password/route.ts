import { sendPasswordResetEmail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether a user exists
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive password reset instructions.' },
        { status: 200 }
      );
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await prisma.passwordReset.create({
      data: {
        token,
        expires,
        userId: user.id,
      },
    });

    // Send reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to process forgot password request:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 