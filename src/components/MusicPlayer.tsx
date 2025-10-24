import { Music, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Note: You'll need to add your music file to public/music.mp3
    audioRef.current = new Audio("/music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) {
      toast.error("Music file not found. Add music.mp3 to the public folder.");
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      toast("Music paused");
    } else {
      audioRef.current.play().catch(() => {
        toast.error("Could not play music. Please interact with the page first.");
      });
      toast("Music playing 🎵");
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Button
      onClick={toggleMusic}
      size="icon"
      className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full shadow-glow bg-primary hover:bg-primary/90 animate-glow-pulse"
      aria-label="Toggle background music"
    >
      {isPlaying ? (
        <Volume2 className="h-6 w-6" />
      ) : (
        <VolumeX className="h-6 w-6" />
      )}
    </Button>
  );
};
