import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['MENTOR', 'MENTEE'] as const, {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }),
});

export async function POST(req: Request) {
  try {
    const { name, email, password, role, recaptchaToken } = await req.json();

    // Verify reCAPTCHA token
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return NextResponse.json(
        { message: 'Invalid reCAPTCHA. Please try again.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: role as Role,
        onboardingCompleted: false,
      },
    });

    // Remove hashedPassword from response
    const { hashedPassword: _, ...userWithoutPassword } = user; 

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 