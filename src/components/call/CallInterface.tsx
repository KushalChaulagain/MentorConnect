'use client';

import { Button } from '@/components/ui/button';
import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Monitor, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CallInterfaceProps {
  channelName: string;
  isVideo: boolean;
  onEndCall: () => void;
}

const client: IAgoraRTCClient = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

export function CallInterface({ channelName, isVideo, onEndCall }: CallInterfaceProps) {
  const [localTracks, setLocalTracks] = useState<{
    audioTrack?: IMicrophoneAudioTrack;
    videoTrack?: ICameraVideoTrack;
  }>({});
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<any>(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        // Get Agora token from your API
        const response = await fetch('/api/agora/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName }),
        });
        
        if (!response.ok) throw new Error('Failed to get token');
        const { token } = await response.json();

        // Join the channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          token,
          null
        );

        // Create and publish tracks
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        const [audioTrack, videoTrack] = tracks;

        if (isVideo) {
          await client.publish([audioTrack, videoTrack]);
          setLocalTracks({ audioTrack, videoTrack });
        } else {
          await client.publish([audioTrack]);
          setLocalTracks({ audioTrack });
        }

        // Listen for remote users
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          if (mediaType === 'video') {
            setRemoteUsers(prev => [...prev, user]);
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
          }
          if (mediaType === 'audio') {
            user.audioTrack?.stop();
          }
        });

        client.on('user-left', (user) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });
      } catch (error) {
        console.error('Error initializing call:', error);
      }
    };

    initCall();

    return () => {
      Object.values(localTracks).forEach(track => track?.stop());
      Object.values(localTracks).forEach(track => track?.close());
      client.removeAllListeners();
      client.leave();
    };
  }, [channelName, isVideo]);

  const toggleAudio = async () => {
    if (localTracks.audioTrack) {
      if (isAudioMuted) {
        await localTracks.audioTrack.setEnabled(true);
      } else {
        await localTracks.audioTrack.setEnabled(false);
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      if (isVideoMuted) {
        await localTracks.videoTrack.setEnabled(true);
      } else {
        await localTracks.videoTrack.setEnabled(false);
      }
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
      await client.unpublish(localTracks.videoTrack);
      await client.publish(screenTrack);
      setScreenTrack(screenTrack);
      setIsScreenSharing(true);
    } else {
      await client.unpublish(screenTrack);
      await client.publish(localTracks.videoTrack);
      screenTrack.stop();
      setScreenTrack(null);
      setIsScreenSharing(false);
    }
  };

  const handleEndCall = async () => {
    Object.values(localTracks).forEach(track => track?.stop());
    Object.values(localTracks).forEach(track => track?.close());
    await client.leave();
    onEndCall();
  };

  return (
    <div className="relative h-full w-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Containers */}
      <div className="grid grid-cols-2 gap-4 p-4 h-full">
        {/* Local Video */}
        {isVideo && localTracks.videoTrack && (
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <div className="absolute inset-0" id="local-video"></div>
            {localTracks.videoTrack.play('local-video')}
          </div>
        )}

        {/* Remote Videos */}
        {remoteUsers.map(user => (
          <div key={user.uid} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <div className="absolute inset-0" id={`remote-video-${user.uid}`}></div>
            {user.videoTrack?.play(`remote-video-${user.uid}`)}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20"
            onClick={toggleAudio}
          >
            {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {isVideo && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20"
              onClick={toggleVideo}
            >
              {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          )}

          {isVideo && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20"
              onClick={toggleScreenShare}
            >
              <Monitor className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 