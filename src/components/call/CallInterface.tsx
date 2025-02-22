'use client';

import { Button } from '@/components/ui/button';
import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
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

// Configure Agora client logging
AgoraRTC.setLogLevel(1); // Set to 0 for more detailed logs if needed
AgoraRTC.enableLogUpload();

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
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    mountedRef.current = true;
    let tracks: any[] = [];

    const initCall = async () => {
      if (initializingRef.current || !mountedRef.current) return;
      initializingRef.current = true;

      try {
        // Clean up any existing call first
        await cleanup();

        // Wait a bit before initializing new call
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!mountedRef.current) return;

        // Get Agora token
        const response = await fetch('/api/agora/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName }),
        });
        
        if (!response.ok) throw new Error('Failed to get token');
        const { token } = await response.json();

        if (!mountedRef.current) return;

        // Join the channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          token,
          null
        );

        if (!mountedRef.current) {
          await client.leave();
          return;
        }

        // Create and publish tracks
        if (isVideo) {
          tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
            undefined,
            {
              encoderConfig: {
                width: 640,
                height: 360,
                frameRate: 30,
                bitrateMin: 400,
                bitrateMax: 1000,
              },
            }
          );

          if (!mountedRef.current) {
            tracks.forEach(track => track.close());
            await client.leave();
            return;
          }

          const [audioTrack, videoTrack] = tracks;
          await client.publish([audioTrack, videoTrack]);
          
          if (mountedRef.current) {
            setLocalTracks({ audioTrack, videoTrack });
            setTimeout(() => {
              if (mountedRef.current && videoTrack) {
                videoTrack.play('local-video');
              }
            }, 100);
          }
        } else {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          tracks = [audioTrack];

          if (!mountedRef.current) {
            audioTrack.close();
            await client.leave();
            return;
          }

          await client.publish([audioTrack]);
          if (mountedRef.current) {
            setLocalTracks({ audioTrack });
          }
        }

        // Set up event handlers
        client.on('user-published', async (user, mediaType) => {
          if (!mountedRef.current) return;
          
          try {
            await client.subscribe(user, mediaType);
            
            if (mediaType === 'video') {
              setRemoteUsers(prev => [...prev, user]);
              setTimeout(() => {
                if (mountedRef.current && user.videoTrack) {
                  user.videoTrack.play(`remote-video-${user.uid}`);
                }
              }, 100);
            }
            if (mediaType === 'audio' && user.audioTrack) {
              user.audioTrack.play();
            }
          } catch (error) {
            console.error('Error handling remote user:', error);
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (!mountedRef.current) return;
          if (mediaType === 'video') {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
          }
        });

        client.on('user-left', (user) => {
          if (!mountedRef.current) return;
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

      } catch (error) {
        console.error('Error initializing call:', error);
        if (mountedRef.current) {
          cleanup();
          onEndCall();
        }
      } finally {
        initializingRef.current = false;
      }
    };

    const cleanup = async () => {
      // Stop and close all local tracks
      Object.values(localTracks).forEach(track => {
        track?.stop();
        track?.close();
      });
      setLocalTracks({});

      // Clear remote users
      setRemoteUsers([]);

      // Remove all event listeners
      client.removeAllListeners();

      // Leave the channel if connected
      if (client.connectionState === 'CONNECTED') {
        await client.leave();
      }
    };

    // Initialize the call
    initCall();

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }

      // Delay cleanup slightly to ensure proper handling
      cleanupTimeoutRef.current = setTimeout(() => {
        cleanup();
      }, 100);
    };
  }, [channelName, isVideo]);

  const toggleAudio = async () => {
    if (localTracks.audioTrack) {
      await localTracks.audioTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      await localTracks.videoTrack.setEnabled(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
        if (mountedRef.current) {
          await client.unpublish(localTracks.videoTrack);
          await client.publish(screenTrack);
          setScreenTrack(screenTrack);
          setIsScreenSharing(true);
        } else {
          screenTrack.close();
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      try {
        await client.unpublish(screenTrack);
        if (mountedRef.current && localTracks.videoTrack) {
          await client.publish(localTracks.videoTrack);
        }
        screenTrack.stop();
        setScreenTrack(null);
        setIsScreenSharing(false);
      } catch (error) {
        console.error('Error stopping screen share:', error);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      await cleanup();
      onEndCall();
    } catch (error) {
      console.error('Error ending call:', error);
      onEndCall();
    }
  };

  return (
    <div className="relative h-full w-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Containers */}
      {isVideo ? (
        <div className="grid grid-cols-2 gap-4 p-4 h-full">
          {/* Local Video */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <div className="absolute inset-0" id="local-video"></div>
          </div>

          {/* Remote Videos */}
          {remoteUsers.map(user => (
            <div key={user.uid} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute inset-0" id={`remote-video-${user.uid}`}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="text-2xl font-semibold text-white">Voice Call</div>
            <div className="text-gray-400">Call in progress...</div>
          </div>
        </div>
      )}

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
            <>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={toggleVideo}
              >
                {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={toggleScreenShare}
              >
                <Monitor className="h-5 w-5" />
              </Button>
            </>
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