import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { channelName } = body;

    if (!channelName) {
      return new NextResponse('Channel name is required', { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return new NextResponse('Agora credentials not configured', { status: 500 });
    }

    // Set token expiry to 24 hours
    const expirationTimeInSeconds = 24 * 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build the token with uid 0 to let Agora assign one
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      0,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[AGORA_TOKEN]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 