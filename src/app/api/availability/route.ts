import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// Get mentor availability
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mentorProfileId = searchParams.get('mentorProfileId');

    if (!mentorProfileId) {
      return new NextResponse('Mentor profile ID is required', { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: {
        mentorProfileId,
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update mentor availability
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mentorProfile: true },
    });

    if (!user?.mentorProfile) {
      return new NextResponse('Mentor profile not found', { status: 404 });
    }

    const body = await request.json();
    const { day, slots } = body;

    // Update or create availability for the day
    const availability = await prisma.availability.upsert({
      where: {
        mentorProfileId_day: {
          mentorProfileId: user.mentorProfile.id,
          day,
        },
      },
      update: {
        slots,
      },
      create: {
        mentorProfileId: user.mentorProfile.id,
        day,
        slots,
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error updating availability:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Delete availability
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const availabilityId = searchParams.get('id');

    if (!availabilityId) {
      return new NextResponse('Availability ID is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mentorProfile: true },
    });

    if (!user?.mentorProfile) {
      return new NextResponse('Mentor profile not found', { status: 404 });
    }

    // Verify ownership before deletion
    const availability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        mentorProfileId: user.mentorProfile.id,
      },
    });

    if (!availability) {
      return new NextResponse('Availability not found or unauthorized', { status: 404 });
    }

    await prisma.availability.delete({
      where: {
        id: availabilityId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 