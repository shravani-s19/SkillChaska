import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { USER_DATA, StudentLearningProgress } from "../data/mockData";

interface ProgressState {
  activeCourseId: string;
  activeModuleId: string;
  learningProgress: StudentLearningProgress;

  initializeCourse: (courseId: string) => void;
  setActiveModule: (moduleId: string) => void;
  updateVideoProgress: (courseId: string, moduleId: string, timestamp: number) => void;
  
  // Updated: Now accepts nextModuleId explicitly
  completeModule: (courseId: string, moduleId: string, nextModuleId?: string | null) => void;

  // Getters
  isModuleCompleted: (courseId: string, moduleId: string) => boolean;
  getLastTimestamp: (courseId: string) => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      activeCourseId: "py-adv-01",
      activeModuleId: "mod_01",
      learningProgress: USER_DATA.student_learning_progress,

      initializeCourse: (courseId) => {
        set((state) => {
          if (state.learningProgress[courseId]) {
            return {
              activeCourseId: courseId,
              activeModuleId: state.learningProgress[courseId].last_accessed_module_id,
            };
          }
          return {
            activeCourseId: courseId,
            activeModuleId: "mod_01", // Default fallback if no data
            learningProgress: {
              ...state.learningProgress,
              [courseId]: {
                last_accessed_module_id: "mod_01",
                last_timestamp_seconds: 0,
                completed_modules: [],
              },
            },
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
              },
            },
          };
        });
      },

      updateVideoProgress: (courseId, moduleId, timestamp) => {
        set((state) => ({
          learningProgress: {
            ...state.learningProgress,
            [courseId]: {
              ...state.learningProgress[courseId],
              modules: {
                ...state.learningProgress[courseId]?.completed_modules,
                [moduleId]: {
                  last_timestamp_seconds: timestamp,
                },
              },
            },
          },
        }));
      },

      // FIXED: Decoupled from Mock Data
      completeModule: (courseId, moduleId, nextModuleId) => {
        const state = get();
        const courseProgress = state.learningProgress[courseId];

        // 1. Mark current module as complete (if not already)
        let newCompleted = courseProgress?.completed_modules || [];
        if (!newCompleted.includes(moduleId)) {
          newCompleted = [...newCompleted, moduleId];
        }

        // 2. Determine state updates
        const updates: any = {
          learningProgress: {
            ...state.learningProgress,
            [courseId]: {
              ...courseProgress,
              completed_modules: newCompleted,
            },
          },
        };

        // 3. If a valid next module is provided, move to it
        if (nextModuleId) {
          updates.activeModuleId = nextModuleId;
          updates.learningProgress[courseId].last_accessed_module_id = nextModuleId;
          updates.learningProgress[courseId].last_timestamp_seconds = 0;
        }

        set(updates);
      },

      // Helper to check completion status
      isModuleCompleted: (courseId, moduleId) => {
        const state = get();
        return state.learningProgress[courseId]?.completed_modules.includes(moduleId) || false;
      },

      getLastTimestamp: (courseId) => {
        const state = get();
        return state.learningProgress[courseId]?.last_timestamp_seconds || 0;
      },
    }),
    {
      name: "codemaska-learning-progress",
      storage: createJSONStorage(() => localStorage),
    }
  )
);