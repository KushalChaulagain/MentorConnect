'use client';

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from "react";
import { CallInterface } from "./CallInterface";
import { CallingOverlay } from "./CallingOverlay";

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  isVideo: boolean;
  callerName: string;
  callerImage: string;
  isIncoming?: boolean;
}

export function CallDialog({ 
  isOpen, 
  onClose, 
  channelName, 
  isVideo,
  callerName,
  callerImage,
  isIncoming = false,
}: CallDialogProps) {
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [pusherChannel, setPusherChannel] = useState<any>(null);
  const mediaTracksRef = useRef<MediaStreamTrack[]>([]);

  // Reset call status when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCallStatus('calling');
      // Request permissions early to handle user's choice
      if (isVideo) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            mediaTracksRef.current = stream.getTracks();
          })
          .catch(error => {
            console.error('Error accessing media devices:', error);
            toast({
              title: "Permission Error",
              description: "Failed to access camera or microphone",
              variant: "destructive",
            });
            handleCleanupAndClose();
          });
      } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            mediaTracksRef.current = stream.getTracks();
          })
          .catch(error => {
            console.error('Error accessing microphone:', error);
            toast({
              title: "Permission Error",
              description: "Failed to access microphone",
              variant: "destructive",
            });
            handleCleanupAndClose();
          });
      }
    }
  }, [isOpen, isVideo]);

  useEffect(() => {
    if (!channelName || !isOpen) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.error('Pusher configuration is missing');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe(`call-${channelName}`);

    channel.bind('call-accepted', (data: any) => {
      console.log('Call accepted event received');
      setCallStatus('connected');
      toast({
        title: "Call Connected",
        description: "You are now connected to the call",
      });
    });

    channel.bind('call-ended', (data: any) => {
      console.log('Call ended event received');
      setCallStatus('ended');
      toast({
        title: "Call Ended",
        description: "The call has been ended",
      });
      handleCleanupAndClose();
    });

    channel.bind('call-rejected', (data: any) => {
      console.log('Call rejected event received');
      setCallStatus('ended');
      toast({
        title: "Call Rejected",
        description: "The call was rejected",
        variant: "destructive",
      });
      handleCleanupAndClose();
    });

    setPusherChannel(channel);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`call-${channelName}`);
    };
  }, [channelName, isOpen]);

  const cleanupMediaTracks = () => {
    // Stop all media tracks
    mediaTracksRef.current.forEach(track => {
      track.stop();
    });
    mediaTracksRef.current = [];
  };

  const handleCleanupAndClose = () => {
    cleanupMediaTracks();
    setCallStatus('ended');
    onClose();
  };

  const handleAcceptCall = async () => {
    try {
      console.log('Accepting call...', { channelName });
      const response = await fetch('/api/call/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept call');
      }

      console.log('Call accepted successfully');
      setCallStatus('connected');
      toast({
        title: "Call Accepted",
        description: "You have joined the call",
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: "Error",
        description: "Failed to accept call",
        variant: "destructive",
      });
      handleCleanupAndClose();
    }
  };

  const handleEndCall = async () => {
    try {
      console.log('Ending call...', { isIncoming, callStatus });
      if (isIncoming && callStatus === 'calling') {
        // If it's an incoming call and still in calling state, send reject
        const response = await fetch('/api/call/reject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to reject call');
        }

        toast({
          title: "Call Rejected",
          description: "You have rejected the call",
        });
      } else {
        // Otherwise send normal end call
        const response = await fetch('/api/call/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to end call');
        }

        toast({
          title: "Call Ended",
          description: "You have ended the call",
        });
      }
      console.log('Call ended successfully');
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: "Error",
        description: "Failed to end call properly",
        variant: "destructive",
      });
    }
    
    handleCleanupAndClose();
  };

  const handleDialogClose = () => {
    // Only allow closing if the call has ended
    if (callStatus === 'connected') {
      toast({
        title: "Cannot Close",
        description: "Please end the call before closing",
        variant: "destructive",
      });
      return;
    }
    
    // If the call is still in calling state, end it properly
    if (callStatus === 'calling') {
      handleEndCall();
    } else {
      handleCleanupAndClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="max-w-4xl h-[80vh] p-0"
        aria-describedby="call-dialog-description"
      >
        <div id="call-dialog-description" className="sr-only">
          {isIncoming ? 'Incoming call interface' : 'Outgoing call interface'}
        </div>
        {callStatus === 'calling' ? (
          <CallingOverlay
            callerName={callerName}
            callerImage={callerImage}
            isVideo={isVideo}
            onAccept={handleAcceptCall}
            onDecline={handleEndCall}
            isIncoming={isIncoming}
          />
        ) : (
          <CallInterface
            channelName={channelName}
            isVideo={isVideo}
            onEndCall={handleEndCall}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 