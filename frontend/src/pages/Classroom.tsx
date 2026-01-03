import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare } from 'lucide-react';
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
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [interactionPoints, setInteractionPoints] = useState<InteractionPoint[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [serverResumeTime, setServerResumeTime] = useState(0);

  const { 
    initializeCourse, 
    completeModule, 
    activeModuleId, 
    activeCourseId
  } = useProgressStore();

  useEffect(() => {
    if (id) {
      const init = async () => {
        setIsLoading(true);
        try {
          await initializeCourse(id);
          const data = await courseService.getById(id);
          setCourseData(data);
        } catch (error) {
          console.error("Failed to load course", error);
        }
        setIsLoading(false);
      };
      init();
    }
  }, [id, initializeCourse]);

  useEffect(() => {
    if (activeCourseId && activeModuleId) {
      const loadModuleContent = async () => {
        try {
          const content = await learnService.getPlayerContent(activeCourseId, activeModuleId);
          setVideoUrl(content.video_url);
          setInteractionPoints(content.interaction_points);
          setServerResumeTime(content.watched_history);
        } catch (error) {
          console.error("Failed to load module content", error);
        }
      };
      loadModuleContent();
    }
  }, [activeCourseId, activeModuleId]);

  const currentModule = courseData?.course_modules.find(m => m.module_id === activeModuleId);

  // --- FIXED LOGIC HERE ---
  const handleComplete = () => {
    if (!courseData || !currentModule) return;

    // 1. Find index of current module in the REAL course list
    const currentIndex = courseData.course_modules.findIndex(m => m.module_id === activeModuleId);
    
    // 2. Check if there is a next module
    const hasNextModule = currentIndex !== -1 && currentIndex < courseData.course_modules.length - 1;

    if (hasNextModule) {
      // 3a. Move to next module
      const nextModuleId = courseData.course_modules[currentIndex + 1].module_id;
      completeModule(activeCourseId, activeModuleId, nextModuleId);
    } else {
      // 3b. Course Complete! (No next module)
      completeModule(activeCourseId, activeModuleId, null); // Pass null for nextId
      navigate(`/completion/${id}`);
    }
  };

  if (isLoading || !courseData || !currentModule) {
    return (
      <div className="min-h-screen min-w-[100dvw] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[100dvw] bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-lg text-textSecondary hover:text-text">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-bold text-sm hidden sm:block">{courseData.course_title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase tracking-wider">
                Module {currentModule.module_sequence_number}
              </span>
              <p className="text-xs text-textSecondary truncate max-w-[200px]">{currentModule.module_title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-surface border border-border hover:bg-white/5"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>
          
          <button 
            onClick={handleComplete}
            className="ml-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 shadow-lg shadow-secondary/20"
          >
            {/* Dynamic Button Text */}
            {courseData.course_modules.findIndex(m => m.module_id === activeModuleId) === courseData.course_modules.length - 1 
              ? "Finish Course" 
              : "Next Lesson"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto p-4 lg:p-8 transition-all duration-300 ${isChatOpen ? 'lg:mr-96' : ''}`}>
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3 space-y-6">
                <VideoPlayer 
                  key={activeModuleId} 
                  courseId={activeCourseId}
                  moduleId={activeModuleId}
                  videoUrl={videoUrl} 
                  interactionPoints={interactionPoints} 
                  initialStartTime={serverResumeTime} 
                  onTimeUpdate={(time) => setCurrentTime(time)} 
                  onComplete={handleComplete} // Updated Handler
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