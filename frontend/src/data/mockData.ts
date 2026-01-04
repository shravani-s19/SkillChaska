// --- Types based on Backend Models ---
export interface StudentLearningProgress {
  [courseId: string]: {
    last_accessed_module_id: string;
    last_timestamp_seconds: number;
    completed_modules: string[];
  }
}

// --- Mock Data ---

export const USER_DATA = {
  student_id: "u_123456",
  student_full_name: "Rahul Sharma",
  student_email: "rahul.sharma@example.com",
  role: "student",
  student_subscription_tier: "pro", 
  student_avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
  student_joined_at: "2023-09-15T10:00:00Z",
  
  student_stats: {

    total_badges: 23,
    stat_days_streak: 5,
    stat_total_xp: 12500,
    stat_modules_completed: 42,
    stat_certificates_earned: ["cert_001", "cert_002"],
    stat_total_watch_time_hours: 128.5,
    stat_total_quizzes_completed: 45
  },

  student_enrolled_courses: ["py-adv-01"],

  // NEW: Precise Resume Tracking based on backend spec
  student_learning_progress: {
    "py-adv-01": {
      last_accessed_module_id: "mod_01", // The user is currently watching this
      last_timestamp_seconds: 45,        // They left off at 45 seconds
      completed_modules: []              // No modules fully completed yet
    }
  } as StudentLearningProgress
};