import React, { forwardRef } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onProgress: (state: { playedSeconds: number }) => void;
  onDuration: (duration: number) => void;
}

const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  ({ url, isPlaying, setIsPlaying, onProgress, onDuration }, ref) => {
    return (
      <div className="bg-black rounded-3xl flex-1 relative overflow-hidden group shadow-2xl border border-border/20">
        <ReactPlayer
          ref={ref}
          url={url}
          width="100%"
          height="100%"
          playing={isPlaying}
          onProgress={onProgress}
          onDuration={onDuration}
          className="absolute inset-0"
        />
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-auto transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-black/40"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-primary transition-all shadow-2xl">
            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
          </button>
        </div>
      </div>
    );
  }
);

export default VideoPlayer;