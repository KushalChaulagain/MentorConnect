import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

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
    await pusher.trigger(`user-${recipientId}`, 'incoming-call', {
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