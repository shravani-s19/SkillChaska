// File: src/pages/Classroom.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Sparkles } from 'lucide-react';
import { VideoPlayer } from '../components/Classroom/VideoPlayer';
import { LearningHub } from '../components/Classroom/LearningHub';
import { Syllabus } from '../components/Classroom/Syllabus';
import { AIChat } from '../components/Classroom/AIChat';
import { useProgressStore } from '../store/useProgressStore';
import { courseService } from '../services/course.service';
import { learnService } from '../services/learn.service';
import { CourseEntity, InteractionPoint } from '../types';

const Classroom = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseEntity | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [interactionPoints, setInteractionPoints] = useState<InteractionPoint[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [serverResumeTime, setServerResumeTime] = useState(0);

  const { initializeCourse, completeModule, activeModuleId, activeCourseId } = useProgressStore();

  useEffect(() => {
    if (id) {
        const init = async () => {
            setIsLoading(true);
            try {
                await initializeCourse(id);
                const data = await courseService.getById(id);
                setCourseData(data);
            } catch (e) { console.error(e); }
            setIsLoading(false);
        };
        init();
    }
  }, [id, initializeCourse]);

  useEffect(() => {
     if (activeCourseId && activeModuleId) {
        learnService.getPlayerContent(activeCourseId, activeModuleId).then(data => {
            setVideoUrl(data.video_url);
            setInteractionPoints(data.interaction_points);
            setServerResumeTime(data.watched_history);
        }).catch(console.error);
    }
  }, [activeCourseId, activeModuleId]);

  const currentModule = courseData?.course_modules.find(m => m.module_id === activeModuleId);

  const handleComplete = async () => {
    if (!courseData || !currentModule || !activeCourseId) return;
    try {
        await learnService.markModuleComplete(activeCourseId, activeModuleId);
        const currentIndex = courseData.course_modules.findIndex(m => m.module_id === activeModuleId);
        if (currentIndex < courseData.course_modules.length - 1) {
            completeModule(activeCourseId, activeModuleId, courseData.course_modules[currentIndex + 1].module_id);
        } else {
            completeModule(activeCourseId, activeModuleId, null);
            navigate(`/completion/${id}`);
        }
    } catch (e) { console.error(e); }
  };

  if (isLoading || !courseData || !currentModule) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* --- Glass Header --- */}
      <header className="h-20 border-b border-white/5 bg-surface/60 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group">
            <ChevronLeft className="w-5 h-5 text-textSecondary group-hover:text-white" />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">{courseData.course_title}</h1>
            <p className="text-sm text-textSecondary flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
               Module {currentModule.module_sequence_number}: <span className="text-white">{currentModule.module_title}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                isChatOpen 
                ? 'bg-secondary/10 border-secondary/50 text-secondary shadow-[0_0_15px_rgba(var(--secondary),0.2)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            {isChatOpen ? <Sparkles className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            AI Tutor
          </button>
          
          <button 
            onClick={handleComplete}
            className="btn-primary py-2.5 text-sm shadow-lg shadow-secondary/20"
          >
            Next Lesson
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isChatOpen ? 'pr-[400px]' : ''}`}>
          <div className="max-w-[1800px] mx-auto p-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3 space-y-8">
                <VideoPlayer 
                  key={activeModuleId} 
                  courseId={activeCourseId}
                  moduleId={activeModuleId}
                  videoUrl={videoUrl} 
                  interactionPoints={interactionPoints} 
                  initialStartTime={serverResumeTime} 
                  onTimeUpdate={setCurrentTime} 
                  onComplete={handleComplete}
                />
                <LearningHub />
              </div>
              <div className="xl:col-span-1">
                <Syllabus modules={courseData.course_modules} />
              </div>
            </div>
          </div>
        </main>
        
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