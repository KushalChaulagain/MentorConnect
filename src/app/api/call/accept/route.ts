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
    const { channelName } = body;

    if (!channelName) {
      return new NextResponse('Missing channel name', { status: 400 });
    }

    // Broadcast to the channel that the call was accepted
    await pusher.trigger(`call-${channelName}`, 'call-accepted', {
      acceptedBy: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CALL_ACCEPT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 