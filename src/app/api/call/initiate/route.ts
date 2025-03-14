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
    const { recipientId, channelName, isVideo } = body;

    if (!recipientId || !channelName) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Trigger a call event to the recipient
    await safeTriggerPusher(`user-${recipientId}`, 'incoming-call', {
      channelName,
      isVideo,
      caller: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CALL_INITIATE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 