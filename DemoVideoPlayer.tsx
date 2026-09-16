import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, AlertCircle, Loader2 } from "lucide-react";

interface DemoVideoPlayerProps {
  videoUrl?: string;
  src?: string; // alias for videoUrl
  title: string;
  niche: string;
  id: string;
  aspectRatio?: "16/9" | "9/16";
  posterUrl?: string;
  poster?: string; // alias for posterUrl
  isFallback?: boolean;
  fallbackReason?: string;
  onClick?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function DemoVideoPlayer({ 
  videoUrl, 
  src,
  title, 
  niche, 
  id, 
  aspectRatio = "16/9",
  posterUrl,
  poster,
  isFallback = false,
  fallbackReason,
  onClick,
  onClose,
  showCloseButton = false
}: DemoVideoPlayerProps) {
  const actualVideoUrl = src || videoUrl || "";
  const actualPosterUrl = poster || posterUrl;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // If an external onClick is provided, let it handle the event (e.g., opening a lightbox)
    if (onClick) {
      onClick();
      return;
    }

    if (!videoRef.current || hasError) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        setHasError(true);
        setErrorMsg("Playback failed: Please make sure the video file exists and is accessible.");
        console.error("Video playback failed", err);
      });
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(current);
    setProgress(dur > 0 ? (current / dur) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    setIsLoaded(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !duration) return;
    const newPercent = parseFloat(e.target.value);
    const newTime = (newPercent / 100) * duration;
    videoRef.current.currentTime = newTime;
    setProgress(newPercent);
    setCurrentTime(newTime);
  };

  const handleError = () => {
    setHasError(true);
    setErrorMsg("Demo video currently unavailable");
  };

  // Safe time formatting helper
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs) || !isFinite(timeInSecs)) return "0:00";
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Re-evaluate error state if video URL changes
  useEffect(() => {
    setHasError(false);
    setErrorMsg("");
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setIsLoaded(false);
  }, [actualVideoUrl]);

  if (isFallback) {
    return (
      <div className={`relative w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-900 flex flex-col justify-between p-6 select-none ${aspectRatio === "9/16" ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
        {posterUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-35 filter blur-xs scale-105 pointer-events-none"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-slate-950/80 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center space-y-4 p-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg animate-pulse">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-slate-100 leading-snug">{title || `${niche} Demo`} Coming Soon</h4>
            <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
              {fallbackReason || `This cinematic concept template for ${niche} is prepared. Enquire below to see custom storyboard drafts.`}
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-900/40">
          <span className="text-[10px] font-semibold text-blue-500 tracking-wider uppercase bg-blue-500/10 px-2 py-0.5 rounded">
            Asset Status
          </span>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
            {niche}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-900 group select-none ${aspectRatio === "9/16" ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 z-20 space-y-3">
          <AlertCircle className="h-10 w-10 text-blue-500/80 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">{errorMsg}</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Please upload <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">{actualVideoUrl.split('/').pop()}</code> to the <code className="text-slate-400">/public/demos/</code> directory to enable playback.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Video Element */}
          <video
            ref={videoRef}
            src={actualVideoUrl}
            poster={actualPosterUrl}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
            playsInline
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
            aria-label={`${title} for ${niche} Demo Advert`}
          />

          {/* Big Play Button Overlay when paused */}
          {!isPlaying && isLoaded && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-slate-950/20 hover:bg-slate-950/40 transition-colors cursor-pointer group-hover:opacity-100"
              aria-label="Play Video"
            >
              <div className="h-14 w-14 rounded-full bg-blue-600/90 hover:bg-blue-500 flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 active:scale-95">
                <Play className="h-6 w-6 fill-current ml-1" />
              </div>
            </button>
          )}

          {/* Loading overlay */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Premium Custom Player Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 space-y-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10">
            
            {/* Seek Slider Progress Control */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400 min-w-[32px]">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleSeekChange}
                className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                aria-label="Seek Video Timeline"
              />
              <span className="text-[10px] font-mono text-slate-400 min-w-[32px]">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause control */}
                <button
                  onClick={togglePlay}
                  className="text-slate-300 hover:text-white transition-colors p-1 rounded hover:bg-slate-900/60 cursor-pointer focus:ring-1 focus:ring-blue-500"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                {/* Mute/Unmute control */}
                <button
                  onClick={toggleMute}
                  className="text-slate-300 hover:text-white transition-colors p-1 rounded hover:bg-slate-900/60 cursor-pointer focus:ring-1 focus:ring-blue-500"
                  aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>

              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                {niche}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
