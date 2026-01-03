import { Play, Lock, CheckCircle2, FileText, Unlock, Video } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useProgressStore } from '../../store/useProgressStore';
import { ModuleEntity } from '../../types';

interface SyllabusProps {
  modules: ModuleEntity[];
}

export const Syllabus = ({ modules }: SyllabusProps) => {
  // Use new simple helper
  const { isModuleCompleted, setActiveModule, activeCourseId, activeModuleId } = useProgressStore();

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden sticky top-24">
      <div className="p-6 border-b border-border bg-white/5">
        <h3 className="font-bold text-lg">Course Content</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-textSecondary">{modules.length} Lessons</span>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        <div className="py-2">
          {modules.map((module, index) => {
            
            // --- LOGIC MOVED HERE ---
            const isCompleted = isModuleCompleted(activeCourseId, module.module_id);
            const isCurrent = activeModuleId === module.module_id;

            // Unlock Logic: 
            // 1. First module is always unlocked.
            // 2. Or if the PREVIOUS module is completed.
            // 3. Or if this module is already completed.
            const previousModule = index > 0 ? modules[index - 1] : null;
            const isUnlocked = index === 0 || isCompleted || (previousModule && isModuleCompleted(activeCourseId, previousModule.module_id));
            
            const isLocked = !isUnlocked;

            return (
              <button
                key={module.module_id}
                disabled={isLocked}
                onClick={() => setActiveModule(module.module_id)}
                className={cn(
                  "w-full px-6 py-4 flex items-start gap-4 transition-all group text-left border-b border-border/50 last:border-0",
                  isCurrent ? "bg-secondary/10" : "hover:bg-white/5",
                  isLocked && "opacity-50 cursor-not-allowed bg-transparent"
                )}
              >
                <div className="mt-1 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-textSecondary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-secondary flex items-center justify-center">
                      {isCurrent ? (
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      ) : (
                          <Unlock className="w-3 h-3 text-secondary" /> 
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-0.5 block">
                    Module {index + 1}
                  </span>
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isCurrent ? "text-secondary" : "text-text"
                  )}>
                    {module.module_title}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    {module.module_resource_type === 'video' ? (
                      <Video className="w-3 h-3 text-textSecondary" />
                    ) : (
                      <FileText className="w-3 h-3 text-textSecondary" />
                    )}
                  </div>
                </div>

                {!isLocked && (
                  <Play className={cn(
                    "w-4 h-4 transition-all opacity-0 group-hover:opacity-100 shrink-0 mt-2",
                    isCurrent ? "text-secondary opacity-100" : "text-textSecondary"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};