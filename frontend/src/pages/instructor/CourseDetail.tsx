import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, addModuleToCourse } from '../../data/mockInstructorData';
import { ArrowLeft, Clock, FileText, Play, BrainCircuit, Plus, Video, File as FileIcon, X, Check, Loader2, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(getCourseById(courseId || ''));
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  
  useEffect(() => {
    setCourse(getCourseById(courseId || ''));
  }, [courseId, showAddModuleModal]);

  if (!course) return <div>Loading...</div>;

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="space-y-6 relative"
    >
      {/* ... Header and Info Card (Same as before) ... */}
      <button onClick={() => navigate('/instructor/courses')} className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors">
        <ArrowLeft size={18} /> Back to Courses
      </button>

      <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <img src={course.course_thumbnail_url} alt="" className="w-full md:w-64 h-40 object-cover rounded-2xl border border-border" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
               <h1 className="text-3xl font-bold text-text mb-2">{course.course_title}</h1>
               <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-background border border-border rounded text-xs font-medium text-textSecondary">{course.course_difficulty}</span>
                  <span className="px-2 py-1 bg-background border border-border rounded text-xs font-medium text-textSecondary">₹{course.course_price_inr}</span>
               </div>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">Edit Details</button>
          </div>
          <p className="text-textSecondary">{course.course_description}</p>
        </div>
      </div>

      {/* Modules Header */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold text-text">Course Modules</h2>
        <button 
          onClick={() => setShowAddModuleModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-transform active:scale-95"
        >
          <Plus size={16} /> Add Module
        </button>
      </div>

      {/* Module List (Loop) */}
      <div className="space-y-4">
        <AnimatePresence>
            {course.course_modules.map((module, index) => (
            <motion.div 
                key={module.module_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface p-5 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-4 hover:border-primary/50 transition-colors group"
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-background text-textSecondary font-bold text-lg flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-text group-hover:text-primary transition-colors">{module.module_title}</h3>
                        <div className="flex items-center gap-4 text-xs text-textSecondary mt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> {module.module_duration_seconds > 0 ? `${Math.floor(module.module_duration_seconds / 60)} mins` : 'Pending'}</span>
                        <span className="flex items-center gap-1"><FileText size={12} /> {module.module_is_published ? 'Published' : 'Draft'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                        {module.module_materials.ai_mind_map?.children && module.module_materials.ai_mind_map.children.length > 0 ? (
                            <><BrainCircuit size={14} className="text-accent" /> <span className="text-accent">AI Ready</span></>
                        ) : (
                            <span className="text-warning text-xs">Processing</span>
                        )}
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(`/instructor/review/${courseId}/${module.module_id}`)}
                        className="bg-text text-background px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Play size={16} /> Review Studio
                    </button>
                </div>
            </motion.div>
            ))}
        </AnimatePresence>
        {course.course_modules.length === 0 && (
            <div className="text-center py-12 text-textSecondary border-2 border-dashed border-border rounded-2xl">
                No modules yet. Click "Add Module" to start.
            </div>
        )}
      </div>

      {/* Add Module Modal */}
      <AnimatePresence>
        {showAddModuleModal && (
            <AddModuleModal 
                onClose={() => setShowAddModuleModal(false)} 
                courseId={courseId || ''} 
                onSuccess={() => {
                    setCourse(getCourseById(courseId || '')); 
                    setShowAddModuleModal(false);
                }}
            />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- SUB-COMPONENT: Add Module Modal ---
const AddModuleModal = ({ onClose, courseId, onSuccess }: { onClose: () => void, courseId: string, onSuccess: () => void }) => {
    const [step, setStep] = useState<'select' | 'uploading' | 'success'>('select');
    const [uploadType, setUploadType] = useState<'video' | 'doc'>('video');
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Hidden Input Refs
    const videoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    // 1. Triggered when user selects a file from explorer
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'doc') => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadType(type);
            startUploadProcess(file, type);
        }
    };

    // 2. Simulate Upload & AI Processing
    const startUploadProcess = (file: File, type: 'video' | 'doc') => {
        setStep('uploading');
        
        // Generate Blob URL (Simulating cloud URL)
        const blobUrl = URL.createObjectURL(file);

        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p > 100) {
                p = 100;
                clearInterval(interval);
                
                // Add to Mock Store
                addModuleToCourse(courseId, { 
                    module_title: file.name.split('.')[0] || `New ${type === 'video' ? 'Video' : 'Document'}`,
                    module_video_url: blobUrl // Store the local blob URL
                });
                
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            }
            setProgress(p);
        }, 300);
    };

    const triggerFileSelect = (type: 'video' | 'doc') => {
        if(type === 'video') videoInputRef.current?.click();
        else docInputRef.current?.click();
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface w-full max-w-lg rounded-3xl p-8 relative border border-border shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-textSecondary hover:text-text bg-background p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Hidden Inputs */}
            <input 
                type="file" 
                ref={videoInputRef} 
                onChange={(e) => handleFileChange(e, 'video')} 
                accept="video/mp4,video/webm" 
                className="hidden" 
            />
            <input 
                type="file" 
                ref={docInputRef} 
                onChange={(e) => handleFileChange(e, 'doc')} 
                accept=".pdf,.doc,.docx,application/pdf,image/*" 
                className="hidden" 
            />

            {step === 'select' && (
                <>
                    <h2 className="text-2xl font-bold text-text mb-2">Add Content Module</h2>
                    <p className="text-textSecondary mb-8">Choose content type. Our AI will generate the lesson.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => triggerFileSelect('video')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-textSecondary group-hover:text-primary group-hover:scale-110 transition-transform">
                                <Video size={24} />
                            </div>
                            <span className="font-bold text-text">Upload Video</span>
                            <span className="text-[10px] text-textSecondary">MP4, WebM</span>
                        </button>

                        <button onClick={() => triggerFileSelect('doc')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-textSecondary group-hover:text-primary group-hover:scale-110 transition-transform">
                                <FileIcon size={24} />
                            </div>
                            <span className="font-bold text-text">Upload Document</span>
                            <span className="text-[10px] text-textSecondary">PDF, Images</span>
                        </button>
                    </div>
                </>
            )}

            {step === 'uploading' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        {uploadType === 'video' ? <Video size={32} className="text-primary" /> : <FileIcon size={32} className="text-primary" />}
                        <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-1 border border-border">
                            <Loader2 size={16} className="animate-spin text-primary" />
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-text mb-2">Processing {selectedFile?.name}...</h3>
                    <p className="text-textSecondary text-sm mb-6">Analysing content and generating interactive checkpoints.</p>
                    
                    <div className="w-full bg-background rounded-full h-3 overflow-hidden border border-border relative">
                        <div className="bg-primary h-full transition-all duration-300 relative overflow-hidden" style={{ width: `${progress}%` }}>
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <p className="text-right text-xs font-bold mt-2 text-primary">{Math.round(progress)}%</p>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Check size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-text">AI Generation Complete!</h3>
                    <p className="text-textSecondary text-sm">Module added successfully.</p>
                </div>
            )}

          </motion.div>
        </motion.div>
    );
};

export default CourseDetail;