'use client';

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import Pusher from 'pusher-js';
import { useEffect, useState } from "react";
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
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('calling');
    }
  }, [isOpen]);

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

    channel.bind('call-accepted', () => {
      setCallStatus('connected');
    });

    channel.bind('call-ended', () => {
      setCallStatus('ended');
      onClose();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`call-${channelName}`);
    };
  }, [channelName, isOpen, onClose]);

  const handleAcceptCall = async () => {
    try {
      await fetch('/api/call/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
        }),
      });
      
      setCallStatus('connected');
    } catch (error) {
      console.error('Error accepting call:', error);
      onClose();
    }
  };

  const handleEndCall = async () => {
    try {
      await fetch('/api/call/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
        }),
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }
    
    setCallStatus('ended');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
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