import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, MoreVertical, MessageSquare } from 'lucide-react';
import { VideoPlayer } from '../components/Classroom/VideoPlayer';
import { LearningHub } from '../components/Classroom/LearningHub';
import { Syllabus } from '../components/Classroom/Syllabus';
import { AIChat } from '../components/Classroom/AIChat';
import { COURSE_DETAILS } from '../data/mockData';
import { useProgressStore } from '../store/useProgressStore';

const Classroom = () => {
  const { id } = useParams(); // This is the Course ID (e.g., 'python-mastery')
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Access the Global Progress Store
  const { 
    initializeCourse, 
    completeModule, 
    activeModuleId, 
    activeCourseId,
    getLastTimestamp // Action to get specific timestamp for a course
  } = useProgressStore();

  // 1. Initialize Course Data on Mount
  useEffect(() => {
    if (id) {
      // In a real app, map the URL slug (id) to a real UUID (e.g., 'py-adv-01')
      // For this demo, we assume the user is viewing the 'py-adv-01' course
      const targetCourseId = 'py-adv-01'; 
      initializeCourse(targetCourseId);
    }
  }, [id, initializeCourse]);

  // 2. Find the Active Module Data
  // We look through the COURSE_DETAILS to find the module matching the active ID from the store
  const currentModule = COURSE_DETAILS.course_modules.find(m => m.module_id === activeModuleId);

  // 3. Get Resume Time
  // This pulls the persisted timestamp from localStorage via the store
  const resumeTime = getLastTimestamp(activeCourseId);

  const handleComplete = () => {
    if (currentModule) {
      completeModule(activeCourseId, currentModule.module_id);
      navigate(`/completion/${id}`);
    }
  };

  // Safe loading state if store hasn't initialized or data is missing
  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-textSecondary">Loading Classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[100dvw] bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-textSecondary hover:text-text">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-bold text-sm hidden sm:block">{COURSE_DETAILS.course_title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase tracking-wider">
                Module {activeModuleId.split('_')[1]}
              </span>
              <p className="text-xs text-textSecondary truncate max-w-[200px]">{currentModule.module_title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
              isChatOpen 
                ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20' 
                : 'bg-surface border-border hover:bg-white/5 text-text'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>
          
          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
          
          <div className="hidden sm:flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-textSecondary hover:text-text">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-textSecondary hover:text-text">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={handleComplete}
            className="ml-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95"
          >
            Mark Complete
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto p-4 lg:p-8 transition-all duration-300 ${isChatOpen ? 'lg:mr-96' : ''}`}>
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Left Column: Video & Hub */}
              <div className="xl:col-span-3 space-y-6">
                {/* 
                  KEY PROP IS CRITICAL:
                  By passing activeModuleId as 'key', we force React to unmount the old player 
                  and mount a new one whenever the module changes. 
                  This ensures initialStartTime is applied correctly to the new video.
                */}
                <VideoPlayer 
                  key={activeModuleId} 
                  courseId={activeCourseId}
                  moduleId={activeModuleId}
                  initialStartTime={resumeTime}
                  onTimeUpdate={(time) => setCurrentTime(time)} 
                  onComplete={() => completeModule(activeCourseId, activeModuleId)}
                />
                
                {/* Learning Hub handles tabs (Notes, Resources, etc) */}
                <LearningHub />
              </div>

              {/* Right Column: Syllabus */}
              <div className="xl:col-span-1">
                <Syllabus />
              </div>
            </div>
          </div>
        </main>

        {/* AI Chat Sidebar */}
        <AIChat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          currentTimestamp={currentTime}
          moduleContext={currentModule.module_title}
        />
      </div>
    </div>
  );
};

export default Classroom;