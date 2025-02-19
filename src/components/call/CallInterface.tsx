'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IScreenVideoTrack,
} from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Monitor, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  const { toast } = useToast();
  const [localTracks, setLocalTracks] = useState<{
    audioTrack?: IMicrophoneAudioTrack;
    videoTrack?: ICameraVideoTrack;
  }>({});
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const screenTrackRef = useRef<IScreenVideoTrack | null>(null);
  const isComponentMounted = useRef(true);
  const initAttempts = useRef(0);
  const maxAttempts = 3;
  const initializationInProgress = useRef(false);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      handleCleanup();
    };
  }, []);

  const handleCleanup = async () => {
    console.log('Starting cleanup...');
    try {
      // First, leave the channel if connected
      if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
        console.log('Leaving channel...');
        await client.leave();
      }

      // Then clean up local tracks
      if (localTracks.audioTrack) {
        console.log('Cleaning up audio track...');
        await localTracks.audioTrack.setEnabled(false);
        await localTracks.audioTrack.stop();
        await localTracks.audioTrack.close();
      }
      
      if (localTracks.videoTrack) {
        console.log('Cleaning up video track...');
        await localTracks.videoTrack.setEnabled(false);
        await localTracks.videoTrack.stop();
        await localTracks.videoTrack.close();
      }
      
      if (screenTrackRef.current) {
        console.log('Cleaning up screen track...');
        await screenTrackRef.current.setEnabled(false);
        await screenTrackRef.current.stop();
        await screenTrackRef.current.close();
        screenTrackRef.current = null;
      }

      // Reset states if component is still mounted
      if (isComponentMounted.current) {
        setLocalTracks({});
        setRemoteUsers([]);
        setIsScreenSharing(false);
        setIsAudioMuted(false);
        setIsVideoMuted(false);
      }

      console.log('Cleanup completed successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const initializeCall = async () => {
    if (initializationInProgress.current) {
      console.log('Initialization already in progress, skipping...');
      return;
    }

    try {
      initializationInProgress.current = true;
      setIsConnecting(true);
      console.log('Initializing call...', { channelName, isVideo, attempt: initAttempts.current + 1 });

      // First, ensure we're cleaned up
      await handleCleanup();

      if (!isComponentMounted.current) {
        console.log('Component unmounted during initialization, aborting...');
        return;
      }

      // Get Agora token
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName }),
      });
      
      if (!response.ok) throw new Error('Failed to get token');
      const { token } = await response.json();

      if (!isComponentMounted.current) return;

      // Join the channel
      console.log('Joining channel...');
      await client.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        token,
        null
      );

      if (!isComponentMounted.current) {
        await client.leave();
        return;
      }

      // Create and publish tracks
      if (isVideo) {
        console.log('Creating audio and video tracks...');
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

        if (!isComponentMounted.current) {
          await audioTrack.stop();
          await audioTrack.close();
          await videoTrack.stop();
          await videoTrack.close();
          await client.leave();
          return;
        }

        await client.publish([audioTrack, videoTrack]);
        setLocalTracks({ audioTrack, videoTrack });
        videoTrack.play('local-video');
      } else {
        console.log('Creating audio track...');
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        if (!isComponentMounted.current) {
          await audioTrack.stop();
          await audioTrack.close();
          await client.leave();
          return;
        }

        await client.publish([audioTrack]);
        setLocalTracks({ audioTrack });
      }

      if (isComponentMounted.current) {
        setIsConnecting(false);
        toast({
          title: "Connected to Call",
          description: "Your media has been initialized successfully",
        });
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      
      // Clean up any partial initialization
      await handleCleanup();
      
      // Attempt retry if under max attempts
      if (initAttempts.current < maxAttempts && isComponentMounted.current) {
        initAttempts.current++;
        console.log(`Retrying initialization (${initAttempts.current}/${maxAttempts})...`);
        setTimeout(initializeCall, 2000);
      } else if (isComponentMounted.current) {
        toast({
          title: "Connection Failed",
          description: "Failed to initialize call. Please try again.",
          variant: "destructive",
        });
        onEndCall();
      }
    } finally {
      initializationInProgress.current = false;
    }
  };

  useEffect(() => {
    // Set up event listeners
    client.on('user-published', async (user, mediaType) => {
      if (!isComponentMounted.current) return;
      
      try {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          setRemoteUsers(prev => [...prev, user]);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      } catch (error) {
        console.error('Error subscribing to remote user:', error);
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (!isComponentMounted.current) return;
      
      if (mediaType === 'video') {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      }
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
    });

    client.on('user-left', async (user) => {
      if (!isComponentMounted.current) return;
      
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      toast({
        title: "User Left",
        description: "The other participant has left the call",
      });
      await handleCleanup();
      onEndCall();
    });

    client.on('connection-state-change', (curState, prevState) => {
      console.log('Connection state changed:', prevState, '->', curState);
      if (curState === 'DISCONNECTED' && isComponentMounted.current) {
        if (prevState === 'CONNECTING' && initAttempts.current < maxAttempts) {
          console.log('Disconnected while connecting, retrying...');
          setTimeout(initializeCall, 2000);
        }
      }
    });

    // Initialize the call
    initializeCall();

    return () => {
      client.removeAllListeners();
      handleCleanup();
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
      screenTrackRef.current = screenTrack;
      setIsScreenSharing(true);
    } else {
      await client.unpublish(screenTrackRef.current);
      await client.publish(localTracks.videoTrack);
      screenTrackRef.current = null;
      setIsScreenSharing(false);
    }
  };

  const handleEndCall = async () => {
    await handleCleanup();
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