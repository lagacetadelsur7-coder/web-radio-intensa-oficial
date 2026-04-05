"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  streamUrl?: string;
  className?: string;
}

export function AudioPlayer({
  className,
  streamUrl = "https://stream.zeno.fm/oyazo5oex4ytv",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = volume;
    
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const handlePause = () => setIsPlaying(false);

    const currentAudio = audioRef.current;
    
    currentAudio.addEventListener("canplay", handleCanPlay);
    currentAudio.addEventListener("waiting", handleWaiting);
    currentAudio.addEventListener("playing", handlePlaying);
    currentAudio.addEventListener("pause", handlePause);

    return () => {
      currentAudio.removeEventListener("canplay", handleCanPlay);
      currentAudio.removeEventListener("waiting", handleWaiting);
      currentAudio.removeEventListener("playing", handlePlaying);
      currentAudio.removeEventListener("pause", handlePause);
      currentAudio.pause();
      currentAudio.src = "";
    };
  }, [streamUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setIsLoading(false);
          setIsPlaying(false);
        });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]", className)}>
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground hover:from-primary hover:to-primary/60 hover:scale-105 transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.3)] z-10 disabled:opacity-70 disabled:hover:scale-100"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current ml-1" />
        )}
      </button>

      {/* Basic Visualizer / Waveform effect */}
      <div className="flex h-8 items-center gap-1 opacity-70">
        {[20, 40, 60, 80, 100, 70, 50, 30].map((height, i) => (
          <div
            key={i}
            className={cn(
              "w-1 bg-primary rounded-full transition-all duration-300",
              isPlaying && !isLoading && !isMuted ? "animate-pulse" : ""
            )}
            style={{ 
              height: isPlaying && !isLoading && !isMuted ? `${height}%` : '20%',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button 
          onClick={toggleMute}
          className="text-primary hover:text-primary/70 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 md:w-24 accent-primary h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
