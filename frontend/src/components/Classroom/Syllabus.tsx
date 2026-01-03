import React from 'react';
import { Play, Lock, CheckCircle2, Clock, Unlock } from 'lucide-react';
import { SYLLABUS } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { useProgressStore } from '../../store/useProgressStore';

export const Syllabus = () => {
  // Using the new store hooks
  const { getModuleStatus, setActiveModule, activeCourseId, activeModuleId } = useProgressStore();

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden sticky top-24">
      <div className="p-6 border-b border-border bg-white/5">
        <h3 className="font-bold text-lg">Course Content</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-textSecondary">12 Lessons</span>
          <div className="w-1 h-1 bg-textSecondary rounded-full" />
          <span className="text-xs text-textSecondary">4h 20m total</span>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        {SYLLABUS.map((module, mIdx) => (
          <div key={module.id} className="border-b border-border last:border-0">
            <div className="px-6 py-4 bg-white/[0.02]">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Module {mIdx + 1}</span>
              <h4 className="font-bold text-sm mt-1">{module.title}</h4>
            </div>
            <div className="py-2">
              {module.lessons.map((lesson) => {
                const status = getModuleStatus(activeCourseId, lesson.id); // 'locked' | 'current' | 'completed' | 'unlocked'
                
                const isLocked = status === 'locked';
                const isCompleted = status === 'completed';
                const isCurrent = activeModuleId === lesson.id; // Check strictly against store active ID

                return (
                  <button
                    key={lesson.id}
                    disabled={isLocked}
                    onClick={() => setActiveModule(lesson.id)}
                    className={cn(
                      "w-full px-6 py-4 flex items-start gap-4 transition-all group text-left",
                      isCurrent ? "bg-secondary/10" : "hover:bg-white/5",
                      isLocked && "opacity-50 cursor-not-allowed bg-transparent"
                    )}
                  >
                    <div className="mt-1">
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
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCurrent ? "text-secondary" : "text-text"
                      )}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-textSecondary" />
                        <span className="text-xs text-textSecondary">{lesson.duration}</span>
                      </div>
                    </div>
                    {!isLocked && (
                      <Play className={cn(
                        "w-4 h-4 transition-all opacity-0 group-hover:opacity-100",
                        isCurrent ? "text-secondary opacity-100" : "text-textSecondary"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};