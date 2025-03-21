import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.id;

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        mentorProfile: {
          include: {
            user: true,
          },
        },
        mentee: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify that this session should indeed be auto-completed:
    // 1. The session must be in CONFIRMED status
    // 2. The session end time must be in the past
    const now = new Date();
    const endTime = new Date(existingSession.endTime);

    if (existingSession.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed sessions can be auto-completed" },
        { status: 400 }
      );
    }

    if (endTime > now) {
      return NextResponse.json(
        { error: "Session has not ended yet" },
        { status: 400 }
      );
    }

    // Update the session status to COMPLETED
    const updatedSession = await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        status: "COMPLETED",
        // You can add additional fields here if needed for auto-completion
      },
    });

    return NextResponse.json({
      message: "Session automatically marked as completed",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error auto-completing session:", error);
    return NextResponse.json(
      { error: "Failed to auto-complete session" },
      { status: 500 }
    );
  }
} 