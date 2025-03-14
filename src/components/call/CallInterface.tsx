'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';
import { Expand, Mic, MicOff, Monitor, PhoneOff, Signal, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CallInterfaceProps {
  channelName: string;
  isVideo: boolean;
  onEndCall: () => void;
}

interface CallStats {
  networkQuality: {
    uplink: number;
    downlink: number;
  };
  packetLossRate: number;
  latency: number;
}

export function CallInterface({ channelName, isVideo, onEndCall }: CallInterfaceProps) {
  const [client, setClient] = useState<any>(null);
  const [localTracks, setLocalTracks] = useState<{
    audioTrack?: IMicrophoneAudioTrack;
    videoTrack?: ICameraVideoTrack;
  }>({});
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStats, setCallStats] = useState<CallStats>({
    networkQuality: { uplink: 0, downlink: 0 },
    packetLossRate: 0,
    latency: 0,
  });
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const durationIntervalRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Agora client
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const agoraClient = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8',
        });
        
        // Disable Agora logging
        AgoraRTC.setLogLevel(4);
        AgoraRTC.disableLogUpload();
        
        setClient(agoraClient);
      }
    } catch (error) {
      console.error('Error initializing Agora client:', error);
    }
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isConnected) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isConnected]);

  // Format duration to HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Network quality indicator
  const getNetworkQualityLabel = (quality: number) => {
    switch (quality) {
      case 1: return 'Excellent';
      case 2: return 'Good';
      case 3: return 'Fair';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  };

  const getNetworkQualityColor = (quality: number) => {
    switch (quality) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-green-400';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const cleanup = async () => {
    if (!mountedRef.current) return;

    try {
      // Stop and close all local tracks first
      if (localTracks.audioTrack) {
        localTracks.audioTrack.stop();
        localTracks.audioTrack.close();
      }
      if (localTracks.videoTrack) {
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
      }
      if (screenTrack) {
        screenTrack.stop();
        screenTrack.close();
      }

      setLocalTracks({});
      setScreenTrack(null);

      // Clear remote users
      setRemoteUsers([]);

      // Remove all event listeners
      client.removeAllListeners();

      // Check connection state before leaving
      const currentState = client.connectionState;
      if (currentState === 'CONNECTED' || currentState === 'CONNECTING') {
        await client.leave();
      }

      setIsConnected(false);
      setCallDuration(0);
      clearInterval(durationIntervalRef.current);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  useEffect(() => {
    if (!client) return;

    mountedRef.current = true;
    let initTimeout: NodeJS.Timeout;

    const initCall = async () => {
      if (initializingRef.current || !mountedRef.current || !client) return;
      initializingRef.current = true;

      try {
        // Ensure proper cleanup first
        await cleanup();

        // Add a delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 1500));

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

        // Check client state before joining
        if (['CONNECTED', 'CONNECTING'].includes(client.connectionState)) {
          await client.leave();
        }

        // Join the channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          token,
          null
        );

        if (!mountedRef.current) {
          await cleanup();
          return;
        }

        setIsConnected(true);

        // Create and publish tracks with improved error handling
        try {
          if (isVideo) {
            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
              {
                AEC: true,
                ANS: true,
                AGC: true,
              },
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
              audioTrack.close();
              videoTrack.close();
              await cleanup();
              return;
            }

            if (client.connectionState === 'CONNECTED') {
              await client.publish([audioTrack, videoTrack]);
              
              if (mountedRef.current) {
                setLocalTracks({ audioTrack, videoTrack });
                // Increased delay for DOM readiness
                initTimeout = setTimeout(() => {
                  if (mountedRef.current && videoTrack) {
                    videoTrack.play('local-video');
                  }
                }, 1000);
              }
            }
          } else {
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
              AEC: true,
              ANS: true,
              AGC: true,
            });

            if (!mountedRef.current) {
              audioTrack.close();
              await cleanup();
              return;
            }

            if (client.connectionState === 'CONNECTED') {
              await client.publish([audioTrack]);
              if (mountedRef.current) {
                setLocalTracks({ audioTrack });
              }
            }
          }
        } catch (error) {
          console.error('Error creating tracks:', error);
          if (mountedRef.current) {
            await cleanup();
            onEndCall();
          }
          return;
        }

        // Set up event handlers with improved error handling
        client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          if (!mountedRef.current) return;
          
          try {
            await client.subscribe(user, mediaType);
            
            if (mediaType === 'video' && mountedRef.current) {
              // Prevent duplicate users
              setRemoteUsers(prev => {
                if (prev.some(u => u.uid === user.uid)) {
                  return prev;
                }
                return [...prev, user];
              });

              // Increased delay for DOM readiness
              setTimeout(() => {
                if (mountedRef.current && user.videoTrack) {
                  user.videoTrack.play(`remote-video-${user.uid}`);
                }
              }, 1000);
            }
            
            if (mediaType === 'audio' && user.audioTrack && mountedRef.current) {
              user.audioTrack.play();
            }
          } catch (error) {
            console.error('Error handling remote user:', error);
          }
        });

        client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          if (!mountedRef.current) return;
          if (mediaType === 'video') {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
          }
        });

        client.on('user-left', (user: IAgoraRTCRemoteUser) => {
          if (!mountedRef.current) return;
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
          // If no users left, end the call
          if (remoteUsers.length === 0) {
            handleEndCall();
          }
        });

        // Add network quality monitoring
        client.on('network-quality', (stats: { 
          uplinkNetworkQuality: number;
          downlinkNetworkQuality: number;
        }) => {
          setCallStats(prev => ({
            ...prev,
            networkQuality: {
              uplink: stats.uplinkNetworkQuality,
              downlink: stats.downlinkNetworkQuality,
            }
          }));
        });

        // Add connection state change monitoring
        client.on('connection-state-change', (
          curState: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTING', 
          prevState: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTING',
          reason?: string
        ) => {
          console.log('Connection state changed:', curState, prevState, reason);
          setIsConnected(curState === 'CONNECTED');
        });

      } catch (error) {
        console.error('Error initializing call:', error);
        if (mountedRef.current) {
          await cleanup();
          onEndCall();
        }
      } finally {
        initializingRef.current = false;
      }
    };

    if (client) {
      initCall();
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimeout);
      cleanup().catch(console.error);
    };
  }, [client]);

  const toggleAudio = async () => {
    if (localTracks.audioTrack) {
      setIsAudioMuted(!isAudioMuted);
      await localTracks.audioTrack.setEnabled(isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      setIsVideoMuted(!isVideoMuted);
      await localTracks.videoTrack.setEnabled(isVideoMuted);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const track = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: {
            width: 1920,
            height: 1080,
            frameRate: 30,
            bitrateMin: 600,
            bitrateMax: 2000,
          }
        }) as ILocalVideoTrack;
        
        if (mountedRef.current) {
          await client.unpublish(localTracks.videoTrack);
          await client.publish(track);
          setScreenTrack(track);
          setIsScreenSharing(true);
        } else {
          track.close();
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      try {
        if (screenTrack) {
          await client.unpublish(screenTrack);
          screenTrack.close();
          if (mountedRef.current && localTracks.videoTrack) {
            await client.publish(localTracks.videoTrack);
          }
          setScreenTrack(null);
          setIsScreenSharing(false);
        }
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
    <div ref={containerRef} className="relative h-full w-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Connection Status */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
        <Badge variant="secondary" className={`${getNetworkQualityColor(callStats.networkQuality.downlink)}`}>
          <Signal className="w-4 h-4 mr-1" />
          {getNetworkQualityLabel(callStats.networkQuality.downlink)}
        </Badge>
      </div>

      {/* Call Duration */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="outline" className="text-white">
          {formatDuration(callDuration)}
        </Badge>
      </div>

      {/* Video Containers */}
      {isVideo ? (
        <div className="grid grid-cols-2 gap-4 p-4 h-full">
          {/* Local Video */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <div className="absolute inset-0" id="local-video"></div>
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              You {isAudioMuted && '(Muted)'}
            </div>
          </div>

          {/* Remote Videos */}
          {remoteUsers.map(user => (
            <div key={user.uid} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute inset-0" id={`remote-video-${user.uid}`}></div>
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                Participant {user.uid} {user.hasAudio === false && '(Muted)'}
              </div>
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

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Expand className="h-5 w-5" />
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