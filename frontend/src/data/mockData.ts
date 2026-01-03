import { Link as LinkIcon } from 'lucide-react';

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

export const COURSE_DETAILS = {
  course_id: "py-adv-01",
  course_title: "Advanced Python Patterns",
  course_description: "Master advanced Python concepts like Memory Management, GIL, and Design Patterns.",
  course_instructor_id: "inst_001",
  course_created_at: "2024-01-01T10:00:00Z",
  course_is_published: true,
  
  // We flatten the structure slightly for the UI, or the UI maps 'modules' -> 'lessons'
  course_modules: [
    {
      module_id: "mod_01",
      module_title: "Memory Management & Variables",
      video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: 596, 
      
      module_ai_interaction_points: [
        {
          id: "q1",
          timestamp: 10,
          type: "quiz",
          question: "How does Python handle memory management for integers?",
          options: ["Manual allocation", "Automatic reference counting", "No storage", "Direct addressing"],
          correct_answer: "Automatic reference counting"
        }
      ],
      
      ai_smart_notes: [
        { time: "00:15", text: "Python uses a private heap containing all Python objects." },
        { time: "01:30", text: "The memory manager manages the chunk of memory." }
      ],

      ai_revision: {
        mind_map: {
          id: "root", label: "Python Memory",
          children: [
            { id: "1", label: "Heap", children: [{ id: "1-1", label: "Private" }] },
            { id: "2", label: "Stack", children: [{ id: "2-1", label: "Refs" }] }
          ]
        },
        flashcards: [
          { id: "fc1", front: "What is Reference Counting?", back: "Technique where Python tracks references to an object." }
        ]
      },

      resources: [
        { name: "Docs", size: "URL", type: "URL", icon: LinkIcon }
      ]
    },
    {
      module_id: "mod_02",
      module_title: "Global Interpreter Lock (GIL)",
      video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: 420,
      module_ai_interaction_points: [],
      ai_smart_notes: [],
      ai_revision: { mind_map: { id: "r2", label: "GIL" }, flashcards: [] },
      resources: []
    }
  ]
};

// Simplified Syllabus structure for UI rendering
export const SYLLABUS = [
  {
    id: "m1",
    title: "Python Internals",
    lessons: [
      { id: "mod_01", title: "Memory Management", duration: "10:15" },
      { id: "mod_02", title: "Global Interpreter Lock", duration: "07:00" },
    ]
  },
  {
    id: "m2",
    title: "Design Patterns",
    lessons: [
      { id: "mod_03", title: "Singleton Pattern", duration: "12:00" },
    ]
  }
];

// Helper to keep other components working
export const BADGES = [
  { id: 1, name: "Fast Learner", description: "Completed 5 modules in a day", icon: "🚀", color: "from-orange-400 to-pink-500", earnedAt: "Oct 2023", isLocked: false },
];
export const CERTIFICATES = [];
export const ENROLLED_COURSES = [
  { id: "py-adv-01", title: "Advanced Python Patterns", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", difficulty: "Pro", progress: 65 }
];