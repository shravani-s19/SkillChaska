// File: src/components/Classroom/VideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Settings, Maximize, 
  RotateCcw, CheckCircle2, XCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { learnService } from '../../services/learn.service';
import { cn } from '../../lib/utils';
import { useProgressStore } from '../../store/useProgressStore';
import { InteractionPoint } from '../../types';

interface VideoPlayerProps {
  moduleId: string;
  courseId: string;
  videoUrl: string;
  interactionPoints: InteractionPoint[];
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
  const updateVideoProgress = useProgressStore(state => state.updateVideoProgress);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
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

  // --- Initial Resume & Event Logic (Same as before, just kept cleaner) ---
  useEffect(() => {
    const video = videoRef.current;
    if (video && !isReady && videoUrl) {
      video.currentTime = initialStartTime;
      setCurrentTime(initialStartTime);
      setMaxWatchedTime(initialStartTime);
      setIsReady(true);
    }
  }, [initialStartTime, videoUrl, isReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      onTimeUpdate?.(time);
      setCurrentTime(time);
      if (time > maxWatchedTime) setMaxWatchedTime(time);
      if (Math.floor(time) % 5 === 0) updateVideoProgress(courseId, moduleId, time);

      const interaction = interactionPoints.find(
        p => Math.floor(time) === p.interaction_timestamp_seconds && !quizCompletedIds.has(p.interaction_id)
      );

      if (interaction && !activeQuiz) {
        video.pause();
        setIsPlaying(false);
        setActiveQuiz(interaction);
      }
    };

    const handleSeeking = () => {
      if (video.currentTime > maxWatchedTime + 2) {
        video.currentTime = maxWatchedTime;
        setShowSeekWarning(true);
        setTimeout(() => setShowSeekWarning(false), 2000);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('loadedmetadata', () => setDuration(video.duration));
    video.addEventListener('ended', () => {
        updateVideoProgress(courseId, moduleId, video.duration); 
        onComplete?.();
    });
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('loadedmetadata', () => {});
      video.removeEventListener('ended', () => {});
    };
  }, [maxWatchedTime, activeQuiz, quizCompletedIds, onComplete, interactionPoints, courseId, moduleId, updateVideoProgress]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (time <= maxWatchedTime) {
      if (videoRef.current) videoRef.current.currentTime = time;
      setCurrentTime(time);
    } else {
      setShowSeekWarning(true);
      setTimeout(() => setShowSeekWarning(false), 2000);
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedOption || !activeQuiz) return;
    setIsValidating(true);
    try {
      const result = await learnService.validateAnswer(moduleId, activeQuiz.interaction_id, selectedOption);
      setQuizFeedback({ isCorrect: result.is_correct, msg: result.feedback });
      setIsValidating(false);
      if (result.is_correct) {
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
      setIsValidating(false);
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
      className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group select-none ring-1 ring-white/5"
    >
      <video 
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        onClick={togglePlay}
        playsInline
      />

      {/* --- Seek Warning Toast --- */}
      <AnimatePresence>
        {showSeekWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-error/90 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 z-50 border border-white/20 shadow-xl"
          >
            <AlertCircle className="w-5 h-5" />
            Fast forwarding is disabled during first watch
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Quiz Overlay (Glassmorphism) --- */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#18181b]/90 border border-white/10 p-8 rounded-[2rem] max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -mr-20 -mt-20" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_currentColor]" />
                  <span className="text-secondary text-xs font-bold uppercase tracking-widest">Knowledge Check</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-8">{activeQuiz.interaction_question_text}</h3>
                
                <div className="space-y-3 mb-8">
                  {activeQuiz.interaction_options_list.map((option) => (
                    <button
                      key={option}
                      onClick={() => !quizFeedback?.isCorrect && setSelectedOption(option)}
                      disabled={isValidating || (quizFeedback?.isCorrect ?? false)}
                      className={cn(
                        "w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between group relative overflow-hidden",
                        selectedOption === option 
                          ? quizFeedback 
                            ? quizFeedback.isCorrect 
                              ? 'border-success bg-success/10 text-success' 
                              : 'border-error bg-error/10 text-error'
                            : 'border-secondary bg-secondary/10 text-secondary' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      )}
                    >
                      <span className="font-medium text-base relative z-10">{option}</span>
                      {selectedOption === option && (
                        quizFeedback 
                          ? (quizFeedback.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />)
                          : <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                     {quizFeedback && (
                        <motion.p 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn("text-sm font-bold", quizFeedback.isCorrect ? "text-success" : "text-error")}
                        >
                           {quizFeedback.msg}
                        </motion.p>
                     )}
                  </div>
                  <button 
                    onClick={handleQuizSubmit}
                    disabled={!selectedOption || isValidating || (quizFeedback?.isCorrect ?? false)}
                    className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Controls Overlay --- */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-6 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
        
        {/* Scrub Bar */}
        <div className="relative h-1.5 w-full bg-white/10 rounded-full mb-6 group/progress cursor-pointer hover:h-2 transition-all">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-white/20 rounded-full" 
            style={{ width: `${(maxWatchedTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-0 left-0 h-full bg-secondary rounded-full relative" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-0 group-hover/progress:scale-100 transition-transform z-10" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="hover:scale-110 transition-transform text-white/90 hover:text-white">
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
            </button>
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:-rotate-12 transition-transform text-white/70 hover:text-white">
              <RotateCcw className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 group/volume">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                <input 
                  type="range" 
                  min="0" max="1" step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if(videoRef.current) videoRef.current.volume = val;
                  }}
                  className="w-full h-1 accent-white bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <span className="text-sm font-mono text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={cn("p-2 rounded-full hover:bg-white/10 transition-colors", showSettings && "text-secondary bg-white/10")}
              >
                <Settings className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-4 w-32 bg-[#18181b]/95 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-xl overflow-hidden"
                  >
                    {[1, 1.25, 1.5, 2].map(s => (
                      <button 
                        key={s}
                        onClick={() => { setPlaybackRate(s); if(videoRef.current) videoRef.current.playbackRate = s; setShowSettings(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex justify-between items-center",
                          playbackRate === s ? "bg-secondary text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
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
            <button onClick={() => containerRef.current?.requestFullscreen()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};