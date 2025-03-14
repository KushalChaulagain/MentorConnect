import { authOptions } from "@/lib/auth-config";
import { safeTriggerPusher } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { channelName } = body;

    if (!channelName) {
      return new NextResponse('Missing channel name', { status: 400 });
    }

    // Broadcast to the channel that the call was ended
    await safeTriggerPusher(`call-${channelName}`, 'call-ended', {
      endedBy: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CALL_END]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 