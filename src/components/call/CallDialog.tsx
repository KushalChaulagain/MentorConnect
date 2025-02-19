'use client';

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
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

  const handleAcceptCall = () => {
    setCallStatus('connected');
  };

  const handleEndCall = () => {
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