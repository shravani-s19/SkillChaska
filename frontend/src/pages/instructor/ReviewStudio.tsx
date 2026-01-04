import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instructorService } from '../../services/instructor.service';
import { CourseEntity, ModuleEntity } from '../../types';
import { Play, Save, Brain, List, FileText, Layers, Video } from 'lucide-react';
import { motion } from 'framer-motion';

// Import the MindMapRenderer we defined previously or in the component file
// Ensure MindMapNode type is imported from types

const ReviewStudio = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleEntity | null>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'mindmap' | 'flashcards' | 'notes'>('mindmap');
  const [isSaving, setIsSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Fetch Real Data
  useEffect(() => {
    const fetchData = async () => {
        if (!courseId || !moduleId) return;
        try {
            const course = await instructorService.getCourseById(courseId);
            const foundModule = course.course_modules.find(m => m.module_id === moduleId);
            if (foundModule) {
                setModule(foundModule);
                
                // Handle Video URL (If relative from backend, prepend base URL)
                let vUrl = foundModule.module_media_url;
                if (vUrl && vUrl.startsWith('/')) {
                   vUrl = `http://localhost:5000${vUrl}`; // Or use env variable
                }
                setVideoUrl(vUrl);
            }
        } catch (e) { console.error(e); }
    };
    fetchData();
  }, [courseId, moduleId]);

  if (!module) return <div className="p-8 text-text">Loading Module Data...</div>;

  // Extract Materials safely
  // The backend stores them in 'module_ai_materials'.
  // Depending on your schema updates, it might be nested or direct. 
  // Based on models.py: module['module_ai_materials']
  const materials = module.module_ai_materials || {};
  const mindMap = materials.ai_mind_map;
  const notes = materials.ai_smart_notes || [];
  const interactions = module.module_ai_interaction_points || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Review Studio</h1>
          <p className="text-textSecondary text-sm">Reviewing: <span className="text-primary font-medium">{module.module_title}</span></p>
        </div>
        <button 
            onClick={() => navigate(`/instructor/course/${courseId}`)}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all"
        >
            <Save size={16} /> Return to Course
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: Video Player */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
          <div className="bg-black rounded-2xl flex-1 relative overflow-hidden group flex items-center justify-center border border-border/20">
             {videoUrl ? (
                <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                />
             ) : (
                <div className="text-center">
                    <Video size={48} className="mx-auto mb-2 text-textSecondary" />
                    <p className="text-textSecondary">Video processing or not available</p>
                </div>
             )}
          </div>
          
          {/* Timeline / Interactions Preview */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <h4 className="font-bold text-sm mb-3">AI Interaction Points ({interactions.length})</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {interactions.map((point, idx) => (
                    <div key={idx} className="flex-shrink-0 px-3 py-2 bg-background border border-border rounded-lg text-xs">
                        <span className="font-bold text-secondary block">{point.interaction_timestamp_seconds}s</span>
                        <span className="text-textSecondary truncate max-w-[150px] block">{point.interaction_question_text}</span>
                    </div>
                ))}
                {interactions.length === 0 && <p className="text-xs text-textSecondary">No quizzes generated.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Assets Panel */}
        <div className="col-span-12 lg:col-span-4 bg-surface rounded-2xl border border-border flex flex-col overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'mindmap', icon: Brain, label: 'Mind Map' },
              { id: 'notes', icon: FileText, label: 'Smart Notes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 
                  ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-textSecondary hover:text-text'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-background">
            
            {/* Mind Map */}
            {activeTab === 'mindmap' && (
              <div className="h-full flex flex-col items-center">
                {mindMap ? (
                    <div className="w-full overflow-auto">
                        <MindMapRenderer node={mindMap} />
                    </div>
                ) : (
                    <p className="text-textSecondary text-sm mt-10">No Mind Map Generated</p>
                )}
              </div>
            )}

            {/* Smart Notes */}
            {activeTab === 'notes' && (
               <div className="space-y-3">
                   {notes.length > 0 ? notes.map((note: any, i: number) => (
                       <div key={i} className="p-3 bg-surface border border-border rounded-lg text-sm">
                           <span className="text-xs font-bold text-primary block mb-1">{note.formatted_time || '00:00'}</span>
                           <p className="text-textSecondary">{note.note_text}</p>
                       </div>
                   )) : (
                       <p className="text-textSecondary text-sm mt-10 text-center">No Notes Generated</p>
                   )}
               </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper Renderer
const MindMapRenderer = ({ node, level = 0 }: { node: any; level?: number }) => {
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
            {node.children.map((child: any, idx: number) => (
              <MindMapRenderer key={idx} node={child} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStudio;