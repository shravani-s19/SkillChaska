import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, publishModule, MindMapNode } from '../../data/mockInstructorData';
import { Play, Save, Brain, List, FileText, Layers, Edit2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewStudio = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'quizzes' | 'mindmap' | 'flashcards' | 'notes'>('mindmap');
  const [isSaving, setIsSaving] = useState(false);
  
  const course = getCourseById(courseId || '');
  const module = course?.course_modules.find(m => m.module_id === moduleId);

  if (!module) return <div className="p-8 text-text">Module not found or loading...</div>;

  const handlePublish = () => {
    setIsSaving(true);
    setTimeout(() => {
        if (courseId && moduleId) {
            publishModule(courseId, moduleId);
        }
        setIsSaving(false);
        navigate(`/instructor/course/${courseId}`);
    }, 1000);
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-8rem)] flex flex-col gap-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Review Studio</h1>
          <p className="text-textSecondary text-sm">Reviewing: <span className="text-primary font-medium">{module.module_title}</span></p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-textSecondary hover:bg-surface rounded-lg text-sm font-medium transition-colors">Discard</button>
          <button 
            onClick={handlePublish}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? 'Publishing...' : <><Save size={16} /> Save & Publish</>}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: Video Player & Timeline */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
          <div className="bg-black rounded-2xl flex-1 relative overflow-hidden group flex items-center justify-center shadow-xl border border-border/20">
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
             
             {/* Center Play Button */}
             <button className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
               <Play size={32} fill="currentColor" />
             </button>

             {/* Controls Overlay */}
             <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex justify-between text-sm font-medium mb-2">
                   <span>00:00</span>
                   <span>10:00</span>
                </div>
                {/* Custom Timeline with AI Markers */}
                <div className="h-2 bg-white/20 rounded-full relative cursor-pointer group/timeline">
                   <div className="absolute top-0 left-0 h-full bg-primary w-[30%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                   
                   {/* AI Checkpoints Dots */}
                   <div className="absolute top-1/2 -translate-y-1/2 left-[30%] w-4 h-4 bg-accent rounded-full border-2 border-black hover:scale-150 transition-transform z-10" title="AI Quiz Here"></div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT: AI Assets Panel */}
        <div className="col-span-12 lg:col-span-4 bg-surface rounded-2xl border border-border flex flex-col overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'mindmap', icon: Brain, label: 'Mind Map' },
              { id: 'flashcards', icon: Layers, label: 'Cards' },
              { id: 'notes', icon: FileText, label: 'Notes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 
                  ${activeTab === tab.id 
                    ? 'border-primary text-primary bg-primary/5' 
                    : 'border-transparent text-textSecondary hover:text-text hover:bg-background'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            
            {/* 1. Mind Map View */}
            {activeTab === 'mindmap' && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-text">AI Generated Graph</h3>
                  <button className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">Regenerate</button>
                </div>
                <div className="flex-1 overflow-auto border border-border rounded-xl bg-surface p-4 relative flex items-center justify-center">
                  <MindMapRenderer node={module.module_materials.ai_mind_map} />
                </div>
              </div>
            )}

            {/* 2. Flashcards View */}
            {activeTab === 'flashcards' && (
               <div className="flex items-center justify-center h-full text-textSecondary">
                   <p>No Flashcards generated for this demo module.</p>
               </div>
            )}

             {/* 3. Notes View */}
             {activeTab === 'notes' && (
               <div className="flex items-center justify-center h-full text-textSecondary">
                   <p>No Notes generated for this demo module.</p>
               </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Helper Component for Mind Map ---
const MindMapRenderer = ({ node, level = 0 }: { node: MindMapNode; level?: number }) => {
  if (!node) return null;
  return (
    <div className={`flex flex-col items-center ${level > 0 ? 'mt-4' : ''}`}>
      <div className={`
        px-4 py-2 rounded-full border-2 text-sm font-bold shadow-sm z-10 relative
        ${level === 0 ? 'bg-primary text-white border-primary' : 'bg-surface text-text border-border'}
      `}>
        {node.label}
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="relative mt-4 flex gap-4">
          <div className="absolute top-[-1rem] left-1/2 -translate-x-1/2 w-0.5 h-4 bg-border"></div>
          <div className="flex gap-6 pt-2 border-t-2 border-border relative">
            {node.children.map((child) => (
              <MindMapRenderer key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStudio;