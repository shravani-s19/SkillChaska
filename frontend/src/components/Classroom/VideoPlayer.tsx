// File: src/components/Classroom/VideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Settings, Maximize, 
  RotateCcw, CheckCircle2, XCircle, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Services & Utils
import { learnService } from '../../services/learn.service';
import { cn } from '../../lib/utils';
import { useProgressStore } from '../../store/useProgressStore';
import { InteractionPoint } from '../../types';

interface VideoPlayerProps {
  moduleId: string;
  courseId: string;
  videoUrl: string; // New Prop: Real Signed URL
  interactionPoints: InteractionPoint[]; // New Prop: Real Interaction Data
  initialStartTime?: number;
  onComplete?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export const VideoPlayer = ({ 
  moduleId, 
  courseId, 
  videoUrl,
  interactionPoints,
  initialStartTime = 0, 
  onComplete, 
  onTimeUpdate 
}: VideoPlayerProps) => {
  
  // Store Action (Handles Optimistic UI + Backend Heartbeat)
  const updateVideoProgress = useProgressStore(state => state.updateVideoProgress);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Anti-Seek & Resume State
  const [maxWatchedTime, setMaxWatchedTime] = useState(initialStartTime);
  const [showSeekWarning, setShowSeekWarning] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<InteractionPoint | null>(null);
  const [quizCompletedIds, setQuizCompletedIds] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{isCorrect: boolean, msg: string} | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Handle Initial Resume Logic
  useEffect(() => {
    const video = videoRef.current;
    if (video && !isReady && videoUrl) {
      // Set the video time to where they left off
      video.currentTime = initialStartTime;
      setCurrentTime(initialStartTime);
      setMaxWatchedTime(initialStartTime);
      setIsReady(true);
    }
  }, [initialStartTime, videoUrl, isReady]);

  // 2. Handle Time Update & Checkpoints
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      onTimeUpdate?.(time);
      setCurrentTime(time);

      // Update Max Watched Time
      if (time > maxWatchedTime) {
        setMaxWatchedTime(time);
      }

      // Checkpoint Save (Every 5 seconds approx)
      if (Math.floor(time) % 5 === 0) {
        // This action now calls learnService.sendHeartbeat internally in the store
        updateVideoProgress(courseId, moduleId, time);
      }

      // Interaction Points Logic (Quiz Trigger)
      const interaction = interactionPoints.find(
        p => Math.floor(time) === p.interaction_timestamp_seconds && !quizCompletedIds.has(p.interaction_id)
      );

      if (interaction && !activeQuiz) {
        video.pause();
        setIsPlaying(false);
        setActiveQuiz(interaction);
      }
    };

    // Anti-Seek Logic
    const handleSeeking = () => {
      // Allow seeking BACKWARDS or within maxWatchedTime + buffer
      if (video.currentTime > maxWatchedTime + 2) {
        video.currentTime = maxWatchedTime;
        setShowSeekWarning(true);
        setTimeout(() => setShowSeekWarning(false), 2000);
      }
    };

    const handleEnded = () => {
      updateVideoProgress(courseId, moduleId, duration); 
      onComplete?.();
    };

    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [maxWatchedTime, activeQuiz, quizCompletedIds, onComplete, interactionPoints, courseId, moduleId, updateVideoProgress, duration, onTimeUpdate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    // Strict seek restriction
    if (time <= maxWatchedTime) {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    } else {
      setShowSeekWarning(true);
      setTimeout(() => setShowSeekWarning(false), 2000);
    }
  };

  // 3. Quiz Handling with Real API
  const handleQuizSubmit = async () => {
    if (!selectedOption || !activeQuiz) return;
    setIsValidating(true);

    try {
      const result = await learnService.validateAnswer(
        moduleId,
        activeQuiz.interaction_id,
        selectedOption
      );

      setQuizFeedback({ isCorrect: result.is_correct, msg: result.feedback });
      setIsValidating(false);

      if (result.is_correct) {
        // Auto continue after short delay if correct
        setTimeout(() => {
          setQuizCompletedIds(prev => new Set(prev).add(activeQuiz.interaction_id));
          setActiveQuiz(null);
          setQuizFeedback(null);
          setSelectedOption(null);
          videoRef.current?.play();
          setIsPlaying(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Quiz Validation Error", error);
      setIsValidating(false);
      setQuizFeedback({ isCorrect: false, msg: "Failed to validate answer. Please try again." });
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-border group shadow-2xl select-none"
    >
      <video 
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        onClick={togglePlay}
        playsInline
      />

      {/* Seek Warning Toast */}
      <AnimatePresence>
        {showSeekWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 z-50 backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4" />
            Fast forwarding is disabled
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Overlay */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-surface border border-border p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16" />

              <div className="flex items-center gap-2 mb-6 relative">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-secondary text-xs font-bold uppercase tracking-widest">Interaction Point</span>
              </div>
              
              {/* Updated: Use Real API fields */}
              <h3 className="text-xl font-bold mb-6 relative">{activeQuiz.interaction_question_text}</h3>
              
              <div className="space-y-3 mb-8 relative">
                {activeQuiz.interaction_options_list.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => !quizFeedback?.isCorrect && setSelectedOption(option)}
                    disabled={isValidating || (quizFeedback?.isCorrect ?? false)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group",
                      selectedOption === option 
                        ? quizFeedback 
                          ? quizFeedback.isCorrect 
                            ? 'border-success bg-success/10 text-success' 
                            : 'border-error bg-error/10 text-error'
                          : 'border-secondary bg-secondary/10 text-secondary' 
                        : 'border-white/5 hover:border-white/20 bg-white/5'
                    )}
                  >
                    <span className="font-medium text-sm">{option}</span>
                    {selectedOption === option && (
                      quizFeedback 
                        ? (quizFeedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)
                        : <div className="w-5 h-5 rounded-full border-2 border-secondary border-t-transparent animate-spin" style={{ animation: 'none' }} />
                    )}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={cn(
                    "mb-6 text-sm font-bold flex items-center gap-2",
                    quizFeedback.isCorrect ? "text-success" : "text-error"
                  )}
                >
                  {quizFeedback.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {quizFeedback.msg}
                </motion.div>
              )}

              <button 
                onClick={handleQuizSubmit}
                disabled={!selectedOption || isValidating || (quizFeedback?.isCorrect ?? false)}
                className="w-full py-4 bg-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
              >
                {isValidating ? 'Checking...' : quizFeedback?.isCorrect ? 'Continuing...' : 'Submit Answer'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-30">
        
        {/* Progress Bar with MaxWatched Logic */}
        <div className="relative h-1.5 w-full bg-white/20 rounded-full mb-6 group/progress cursor-pointer">
          {/* Seek Input */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          
          {/* Max Watched Track (Gray) */}
          <div 
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full" 
            style={{ width: `${(maxWatchedTime / duration) * 100}%` }}
          />

          {/* Current Progress (Colored) */}
          <div 
            className="absolute top-0 left-0 h-full bg-secondary rounded-full relative" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform z-10" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={togglePlay} className="hover:scale-110 transition-transform focus:outline-none">
              {isPlaying ? <Pause className="w-6 h-6 text-white fill-current" /> : <Play className="w-6 h-6 text-white fill-current" />}
            </button>
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:-rotate-45 transition-transform">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3 group/volume">
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
              <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if(videoRef.current) videoRef.current.volume = val;
                  }}
                  className="w-full accent-white h-1"
                />
              </div>
            </div>

            <span className="text-sm font-mono text-white/90 tabular-nums">
              {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={cn("hover:rotate-45 transition-transform", showSettings && "text-secondary")}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-4 w-40 bg-surface/90 border border-white/10 rounded-xl p-2 shadow-2xl backdrop-blur-xl overflow-hidden"
                  >
                    <div className="p-2 text-[10px] font-bold text-textSecondary uppercase tracking-widest">Speed</div>
                    {[1, 1.25, 1.5, 2].map(s => (
                      <button 
                        key={s}
                        onClick={() => { 
                          setPlaybackRate(s); 
                          if(videoRef.current) videoRef.current.playbackRate = s;
                          setShowSettings(false); 
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between",
                          playbackRate === s ? "bg-secondary/20 text-secondary font-bold" : "hover:bg-white/5 text-text"
                        )}
                      >
                        {s}x
                        {playbackRate === s && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
              <Maximize className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};