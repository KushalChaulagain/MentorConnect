import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all notifications for the user
    // @ts-ignore - We know this model exists despite type errors
    const notifications = await (prisma as any).notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      take: 50, // Limit to last 50 notifications
    });

    // Format timestamps properly to avoid "Invalid Date" errors
    const formattedNotifications = notifications.map((notification: any) => {
      return {
        ...notification,
        // Ensure createdAt and updatedAt are properly formatted ISO strings
        createdAt: notification.createdAt ? new Date(notification.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: notification.updatedAt ? new Date(notification.updatedAt).toISOString() : new Date().toISOString(),
        // Add a timestamp field for consistency with real-time notifications
        timestamp: notification.createdAt ? new Date(notification.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 