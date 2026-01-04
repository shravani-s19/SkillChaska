// File: src/components/Classroom/Syllabus.tsx
import { Play, Lock, CheckCircle2, Video, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useProgressStore } from '../../store/useProgressStore';
import { ModuleEntity } from '../../types';
import { motion } from 'framer-motion';

interface SyllabusProps {
  modules: ModuleEntity[];
}

export const Syllabus = ({ modules }: SyllabusProps) => {
  const { isModuleCompleted, setActiveModule, activeCourseId, activeModuleId } = useProgressStore();

  return (
    <div className="glass-card rounded-[2rem] h-[calc(100vh-140px)] flex flex-col overflow-hidden sticky top-24">
      <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md z-10">
        <h3 className="font-bold text-lg">Course Content</h3>
        <p className="text-xs text-textSecondary mt-1">{modules.length} Modules</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {modules.map((module, index) => {
          const isCompleted = isModuleCompleted(activeCourseId, module.module_id);
          const isCurrent = activeModuleId === module.module_id;
          const previousModule = index > 0 ? modules[index - 1] : null;
          const isUnlocked = index === 0 || isCompleted || (previousModule && isModuleCompleted(activeCourseId, previousModule.module_id));
          const isLocked = !isUnlocked;

          return (
            <button
              key={module.module_id}
              disabled={isLocked}
              onClick={() => setActiveModule(module.module_id)}
              className={cn(
                "w-full p-4 rounded-xl flex items-start gap-4 transition-all duration-300 text-left group relative overflow-hidden",
                isCurrent 
                  ? "bg-secondary/10 border border-secondary/30 shadow-[0_0_15px_rgba(var(--secondary),0.1)]" 
                  : "hover:bg-white/5 border border-transparent",
                isLocked && "opacity-40 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {/* Active Indicator Line */}
              {isCurrent && (
                <motion.div 
                  layoutId="active-module-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"
                />
              )}

              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5 text-textSecondary" />
                ) : (
                   <div className={cn(
                     "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                     isCurrent ? "border-secondary" : "border-textSecondary/50"
                   )}>
                     {isCurrent && <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />}
                   </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-0.5 block">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1} • {formatDuration(15)} {/* Mock Duration */}
                </span>
                <p className={cn(
                  "text-sm font-bold truncate transition-colors",
                  isCurrent ? "text-secondary" : "text-text group-hover:text-white"
                )}>
                  {module.module_title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-textSecondary border border-white/5 flex items-center gap-1">
                        {module.module_resource_type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {module.module_resource_type}
                    </span>
                </div>
              </div>

              {!isLocked && isCurrent && (
                 <Play className="w-4 h-4 text-secondary fill-current shrink-0 self-center" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Helper for visual polish
const formatDuration = (mins: number) => `${mins} min`;