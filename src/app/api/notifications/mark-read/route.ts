import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return new NextResponse("Notification ID is required", { status: 400 });
    }

    // Verify the notification exists
    // @ts-ignore - We know this model exists despite type errors
    const notification = await (prisma as any).notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    // Verify the notification belongs to the user
    if (notification.userId !== session.user.id) {
      return new NextResponse("Notification does not belong to the user", { status: 403 });
    }

    // Mark notification as read
    // @ts-ignore - We know this model exists despite type errors
    const updatedNotification = await (prisma as any).notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('[NOTIFICATION_MARK_READ]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 