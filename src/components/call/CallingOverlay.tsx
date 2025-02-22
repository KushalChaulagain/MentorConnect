import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useEffect, useRef } from "react";

interface CallingOverlayProps {
  callerName: string;
  callerImage: string;
  isVideo: boolean;
  onAccept: () => void;
  onDecline: () => void;
  isIncoming?: boolean;
}

export function CallingOverlay({
  callerName,
  callerImage,
  isVideo,
  onAccept,
  onDecline,
  isIncoming = false,
}: CallingOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for ringtone
    const audio = new Audio("/sounds/ringtone.mp3");
    audio.loop = true;
    audio.volume = 0.3; // Set volume to 30%

    // Test if audio can be played
    audio.load();
    audio.addEventListener('canplaythrough', () => {
      audio.play().catch(error => {
        console.error('Error playing ringtone:', error);
      });
    });

    audio.addEventListener('error', (e: Event) => {
      const target = e.target as HTMLAudioElement;
      if (target.error) {
        console.error('Audio error:', target.error.message);
      }
    });

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage src={callerImage} alt={callerName} />
            <AvatarFallback className="text-4xl">
              {callerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold text-white">{callerName}</h2>
          <p className="text-gray-300">
            {isIncoming 
              ? `Incoming ${isVideo ? 'video' : 'voice'} call...` 
              : `Calling${'.'.repeat(3)}`}
          </p>
        </div>

        <div className="flex items-center justify-center gap-6">
          {isIncoming ? (
            <>
              <Button
                size="lg"
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  onDecline();
                }}
              >
                <PhoneOff className="h-8 w-8" />
              </Button>
              <Button
                size="lg"
                className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  onAccept();
                }}
              >
                <Phone className="h-8 w-8" />
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                onDecline();
              }}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 