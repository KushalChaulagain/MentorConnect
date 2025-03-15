import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get the prisma client
    const { prisma } = await import("@/lib/prisma");
    
    // Mark all notifications as read for this user
    const result = await (prisma as any).notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('[NOTIFICATION_MARK_ALL_READ]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 