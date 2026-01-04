import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Play,
  BrainCircuit,
  Plus,
  Video,
  File as FileIcon,
  X,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  GitGraph,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { instructorService } from "../../services/instructor.service";
import { CourseEntity, MindMapNode as MindMapNodeType, Flashcard as FlashcardType } from "../../types";

// --- HELPERS FROM LEARNING HUB ---
const CARD_THEMES = [
  "from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-100",
  "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-100",
  "from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-100",
  "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-100",
];

// --- SUB-COMPONENTS FROM LEARNING HUB ---

const FlashCard = ({ card, index }: { card: FlashcardType; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  return (
    <div className="group perspective-1000 h-48 cursor-pointer w-full" onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        <div className={`absolute inset-0 backface-hidden rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg border bg-gradient-to-br ${theme}`}>
          <div className="prose prose-invert prose-sm line-clamp-3 select-none">
            <ReactMarkdown>{card.front_text}</ReactMarkdown>
          </div>
          <p className="text-[10px] opacity-60 mt-2 uppercase font-bold">Tap to flip</p>
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-background border border-border rounded-xl p-4 flex items-center justify-center text-center overflow-y-auto custom-scrollbar">
          <div className="prose prose-invert prose-sm text-textSecondary">
            <ReactMarkdown>{card.back_text}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MindMapNode = ({ node, depth = 0 }: { node: MindMapNodeType; depth?: number }) => {
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div className="flex flex-col items-center">
      <div className={`px-3 py-2 rounded-lg border font-bold text-xs transition-all mx-1 whitespace-nowrap ${
        depth === 0 ? "bg-primary text-white border-primary shadow-lg" : 
        depth === 1 ? "bg-surface border-border text-text" : "bg-background border-border text-textSecondary"
      }`}>
        {node.label}
      </div>
      {hasChildren && (
        <div className="flex pt-4 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
          {node.children!.map((child, index) => (
            <div key={child.id} className="flex flex-col items-center relative px-1">
              {index > 0 && <div className="absolute top-0 left-0 w-1/2 h-px bg-border" />}
              {index < node.children!.length - 1 && <div className="absolute top-0 right-0 w-1/2 h-px bg-border" />}
              <div className="w-px h-4 bg-border -mt-4 mb-0" />
              <MindMapNode node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState<CourseEntity | null>(null);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (courseId) {
      try {
        const data = await instructorService.getCourseById(courseId);
        setCourse(data);
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => { fetchCourse(); }, [courseId]);

  if (!course) return <div className="p-8">Loading Course...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl min-w-[82dvw] mx-auto pb-20">
      <button onClick={() => navigate("/instructor/courses")} className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors">
        <ArrowLeft size={18} /> Back to Courses
      </button>

      {/* Course Header */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <img src={course.course_thumbnail_url || "https://via.placeholder.com/300"} alt="" className="w-full md:w-48 h-32 object-cover rounded-xl border border-border" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text mb-1">{course.course_title}</h1>
          <p className="text-sm text-textSecondary mb-4 line-clamp-2">{course.course_description}</p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-background border border-border rounded text-[10px] uppercase font-bold text-textSecondary">{course.course_difficulty}</span>
            <span className="px-2 py-1 bg-background border border-border rounded text-[10px] uppercase font-bold text-textSecondary">₹{course.course_price_inr}</span>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold text-text">Course Modules</h2>
        <button onClick={() => setShowAddModuleModal(true)} className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-transform active:scale-95">
          <Plus size={16} /> Add Module
        </button>
      </div>

      <div className="space-y-4">
        {course.course_modules.map((module, index) => {
          const isExpanded = expandedModuleId === module.module_id;
          const hasAiData = !!module.module_ai_materials?.ai_mind_map;

          return (
            <div key={module.module_id} className="bg-surface rounded-2xl border border-border overflow-hidden transition-all hover:border-primary/30">
              <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-background text-textSecondary font-bold flex items-center justify-center border border-border">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-text">{module.module_title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        module.module_status === 'processing' ? 'text-warning border-warning/30' : 'text-success border-success/30'
                      }`}>
                        {module.module_status === 'processing' ? 'AI Processing' : module.module_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasAiData && (
                    <button 
                      onClick={() => setExpandedModuleId(isExpanded ? null : module.module_id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? "Hide Preview" : "Preview AI Data"}
                    </button>
                  )}
                  
                  <button
                    disabled={module.module_status === 'processing'}
                    onClick={() => navigate(`/instructor/review/${courseId}/${module.module_id}`)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform ${
                      module.module_status === 'processing' 
                      ? 'bg-background text-textSecondary cursor-not-allowed opacity-50' 
                      : 'bg-text text-background hover:scale-105'
                    }`}
                  >
                    {module.module_status === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    Studio
                  </button>
                </div>
              </div>

              {/* AI CONTENT PREVIEW PANEL */}
              <AnimatePresence>
                {isExpanded && module.module_ai_materials && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-background/50"
                  >
                    <div className="p-6 space-y-8">
                      {/* Mind Map Section */}
                      <section>
                        <div className="flex items-center gap-2 mb-4 text-accent">
                          <GitGraph size={18} />
                          <h4 className="font-bold uppercase tracking-wider text-xs">AI Generated Mind Map</h4>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-8 overflow-x-auto custom-scrollbar">
                           <div className="min-w-fit flex justify-center">
                             <MindMapNode node={module.module_ai_materials.ai_mind_map} />
                           </div>
                        </div>
                      </section>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Flashcards Preview */}
                        <section>
                          <div className="flex items-center gap-2 mb-4 text-primary">
                            <Layers size={18} />
                            <h4 className="font-bold uppercase tracking-wider text-xs">Flashcards Preview</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {module.module_ai_materials.ai_flashcards.slice(0, 4).map((card, idx) => (
                              <FlashCard key={idx} card={card} index={idx} />
                            ))}
                          </div>
                        </section>

                        {/* Smart Notes Preview */}
                        <section>
                          <div className="flex items-center gap-2 mb-4 text-success">
                            <FileText size={18} />
                            <h4 className="font-bold uppercase tracking-wider text-xs">Smart Notes Snippet</h4>
                          </div>
                          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                            {module.module_ai_materials.ai_smart_notes.slice(0, 3).map((note, idx) => (
                              <div key={idx} className="flex gap-3 text-xs border-b border-border pb-3 last:border-0 last:pb-0">
                                <span className="text-primary font-mono shrink-0">{note.formatted_time}</span>
                                <p className="text-textSecondary line-clamp-2">{note.note_text}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAddModuleModal && (
          <AddModuleModal
            onClose={() => setShowAddModuleModal(false)}
            courseId={courseId || ""}
            onSuccess={() => { setShowAddModuleModal(false); fetchCourse(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- SUB-COMPONENT: Add Module Modal ---
const AddModuleModal = ({
  onClose,
  courseId,
  onSuccess,
}: {
  onClose: () => void;
  courseId: string;
  onSuccess: () => void;
}) => {
  const [step, setStep] = useState<"select" | "uploading" | "processing" | "success">("select");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("Initializing AI...");
  
  // Refs for hidden inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // 1. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "doc") => {
    const file = e.target.files?.[0];
    if (file) {
      startUploadProcess(file, type);
    }
  };

  // 2. Upload Logic
  const startUploadProcess = async (file: File, type: "video" | "doc") => {
    setStep("uploading");
    try {
        const response = await instructorService.uploadModuleMedia(
            courseId,
            file,
            file.name.split('.')[0], // Default title
            type === 'video' ? 'video' : 'document',
            (percent) => setUploadProgress(percent)
        );

        // Upload done, now poll for AI status
        setStep("processing");
        pollProcessingStatus(response.module_id);

    } catch (error) {
        console.error("Upload Error:", error);
        alert("Upload failed. Please try again.");
        setStep("select");
    }
  };

  // 3. Polling Logic (Waits for Backend Thread)
  const pollProcessingStatus = (moduleId: string) => {
    const interval = setInterval(async () => {
        try {
            const course = await instructorService.getCourseById(courseId);
            const module = course.course_modules.find(m => m.module_id === moduleId);

            if (module) {
                if (module.module_status === 'ready_for_review' || module.module_status === 'published') {
                    clearInterval(interval);
                    setStep('success');
                    setTimeout(() => onSuccess(), 1000); // Close modal after 1s success
                } else if (module.module_status.startsWith("Error")) {
                    clearInterval(interval);
                    alert("AI Processing Failed: " + module.module_status);
                    setStep("select");
                } else {
                    // Update status text (e.g. "Generating Quizzes...")
                    // You could add specific status strings in the backend model to display here
                    setProcessingStatus("AI is analyzing content...");
                }
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 3000); // Poll every 3 seconds
  };

  const triggerSelect = (type: "video" | "doc") => {
    if(type === 'video') videoInputRef.current?.click();
    else docInputRef.current?.click();
  }

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

        <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, "video")} accept="video/*" className="hidden" />
        <input type="file" ref={docInputRef} onChange={(e) => handleFileChange(e, "doc")} accept=".pdf,application/pdf" className="hidden" />

        {step === "select" && (
          <>
            <h2 className="text-2xl font-bold text-text mb-2">Add Content</h2>
            <p className="text-textSecondary mb-8">Upload media. AI will generate the quizzes and mind maps.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => triggerSelect("video")} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-textSecondary group-hover:text-primary transition-colors">
                  <Video size={24} />
                </div>
                <span className="font-bold text-text">Upload Video</span>
              </button>
              <button onClick={() => triggerSelect("doc")} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-textSecondary group-hover:text-primary transition-colors">
                  <FileIcon size={24} />
                </div>
                <span className="font-bold text-text">Upload PDF</span>
              </button>
            </div>
          </>
        )}

        {step === "uploading" && (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold mb-2">Uploading...</h3>
            <div className="w-full bg-background rounded-full h-3 overflow-hidden border border-border">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-right text-xs font-bold mt-2 text-primary">{uploadProgress}%</p>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">AI is Thinking...</h3>
            <p className="text-textSecondary text-sm">{processingStatus}</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <Check size={48} className="text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-success">Done!</h3>
            <p className="text-textSecondary text-sm">Content generated successfully.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CourseDetail;