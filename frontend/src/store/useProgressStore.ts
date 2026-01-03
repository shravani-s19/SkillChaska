import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { USER_DATA, SYLLABUS, StudentLearningProgress } from '../data/mockData';

interface ProgressState {
  // Course Context
  activeCourseId: string;
  activeModuleId: string;
  
  // Data matching Backend Structure
  learningProgress: StudentLearningProgress;

  // Actions
  initializeCourse: (courseId: string) => void;
  setActiveModule: (moduleId: string) => void;
  updateVideoProgress: (courseId: string, timestamp: number) => void;
  completeModule: (courseId: string, moduleId: string) => void;
  
  // Getters
  getModuleStatus: (courseId: string, moduleId: string) => 'locked' | 'current' | 'completed' | 'unlocked';
  getLastTimestamp: (courseId: string) => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      activeCourseId: "py-adv-01",
      activeModuleId: USER_DATA.student_learning_progress["py-adv-01"]?.last_accessed_module_id || "mod_01",
      
      // Initialize with Mock Data
      // Note: Persist will overwrite this with localStorage data if it exists
      learningProgress: USER_DATA.student_learning_progress,

      initializeCourse: (courseId) => {
        set((state) => {
          // If we already have progress for this course in our state (persisted or initial), use it
          if (state.learningProgress[courseId]) {
            return { 
              activeCourseId: courseId,
              // Ensure we stay on the module the user was last on
              activeModuleId: state.learningProgress[courseId].last_accessed_module_id
            };
          }
          
          // New course initialization
          return {
            activeCourseId: courseId,
            activeModuleId: "mod_01",
            learningProgress: {
              ...state.learningProgress,
              [courseId]: {
                last_accessed_module_id: "mod_01",
                last_timestamp_seconds: 0,
                completed_modules: []
              }
            }
          };
        });
      },

      setActiveModule: (moduleId) => {
        set((state) => {
          const courseId = state.activeCourseId;
          return {
            activeModuleId: moduleId,
            learningProgress: {
              ...state.learningProgress,
              [courseId]: {
                ...state.learningProgress[courseId],
                last_accessed_module_id: moduleId,
                // Do NOT reset timestamp here, otherwise switching modules resets progress
              }
            }
          };
        });
      },

      updateVideoProgress: (courseId, timestamp) => {
        set((state) => ({
          learningProgress: {
            ...state.learningProgress,
            [courseId]: {
              ...state.learningProgress[courseId],
              last_timestamp_seconds: timestamp
            }
          }
        }));
      },

      completeModule: (courseId, moduleId) => {
        const state = get();
        const courseProgress = state.learningProgress[courseId];
        
        if (courseProgress.completed_modules.includes(moduleId)) return;

        const newCompleted = [...courseProgress.completed_modules, moduleId];
        
        // Find next module
        const allLessons = SYLLABUS.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === moduleId);
        let nextModuleId = state.activeModuleId;

        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
          nextModuleId = allLessons[currentIndex + 1].id;
        }

        set({
          activeModuleId: nextModuleId,
          learningProgress: {
            ...state.learningProgress,
            [courseId]: {
              ...courseProgress,
              completed_modules: newCompleted,
              last_accessed_module_id: nextModuleId,
              last_timestamp_seconds: 0 // Reset timestamp for the NEW module
            }
          }
        });
      },

      getModuleStatus: (courseId, moduleId) => {
        const state = get();
        const progress = state.learningProgress[courseId];
        
        if (!progress) return 'locked';

        if (progress.completed_modules.includes(moduleId)) return 'completed';
        if (state.activeModuleId === moduleId) return 'current';
        
        // Check if unlocked (previous completed)
        const allLessons = SYLLABUS.flatMap(m => m.lessons);
        const modIndex = allLessons.findIndex(l => l.id === moduleId);
        
        if (modIndex > 0) {
            const prevModId = allLessons[modIndex - 1].id;
            if (progress.completed_modules.includes(prevModId)) return 'unlocked';
        } else {
            return 'unlocked'; // First module
        }

        return 'locked';
      },

      getLastTimestamp: (courseId) => {
        const state = get();
        return state.learningProgress[courseId]?.last_timestamp_seconds || 0;
      }
    }),
    {
      name: 'codemaska-learning-progress', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      
      // Optional: Filter what gets persisted if you don't want everything
      // partialize: (state) => ({ learningProgress: state.learningProgress }),
    }
  )
);