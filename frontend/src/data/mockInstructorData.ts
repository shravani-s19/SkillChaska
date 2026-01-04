// src/data/mockInstructorData.ts

// --- Interfaces ---
export interface SmartNote {
  note_id: string;
  timestamp_seconds: number;
  formatted_time: string;
  note_text: string;
}

export interface Flashcard {
  card_id: string;
  front_text: string;
  back_text: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface ModuleResource {
  resource_id: string;
  resource_name: string;
  resource_type: 'pdf' | 'link' | 'code' | 'zip';
  resource_size?: string;
  resource_url: string;
}

export interface ModuleMaterialsResponse {
  ai_smart_notes: SmartNote[];
  ai_flashcards: Flashcard[];
  ai_mind_map: MindMapNode;
  module_resources: ModuleResource[];
}

export interface ModuleEntity {
  module_id: string;
  module_title: string;
  module_description: string;
  module_video_url: string;
  module_duration_seconds: number;
  module_is_published: boolean;
  module_materials: ModuleMaterialsResponse;
}

export interface CourseEntity {
  course_id: string;
  course_title: string;
  course_progress: number;
  course_description: string;
  course_difficulty: 'Beginner' | 'Intermediate' | 'Pro';
  course_price_inr: number;
  course_instructor_id: string;
  course_is_published: boolean;
  course_thumbnail_url: string;
  course_modules: ModuleEntity[];
}

// --- INITIAL STATE (Private Variable) ---
let courses: CourseEntity[] = [
  {
    course_id: "c_001",
    course_title: "Python Masterclass: Zero to Hero",
    course_progress: 45,
    course_description: "The complete guide to Python programming for beginners.",
    course_difficulty: "Beginner",
    course_price_inr: 4999,
    course_instructor_id: "inst_001",
    course_is_published: true,
    course_thumbnail_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800",
    course_modules: [
      {
        module_id: "m_001",
        module_title: "Introduction to Variables",
        module_description: "Understanding how to store data.",
        module_video_url: "dummy.mp4",
        module_duration_seconds: 600,
        module_is_published: true,
        module_materials: {
            ai_smart_notes: [{ note_id: '1', timestamp_seconds: 10, formatted_time: '00:10', note_text: 'Intro' }],
            ai_flashcards: [{ card_id: '1', front_text: 'Var?', back_text: 'Data container' }],
            ai_mind_map: { 
              id: 'root', 
              label: 'Python Variables', 
              children: [
                { id: 'c1', label: 'Integers' },
                { id: 'c2', label: 'Strings' }
              ] 
            },
            module_resources: []
        }
      }
    ]
  }
];

export const instructorStats = [
  { label: "Total Students", value: "1,204", change: "+12%" },
  { label: "Active Courses", value: "3", change: "0%" },
  { label: "Total Revenue", value: "₹45,200", change: "+8%" },
  { label: "Avg. Completion", value: "78%", change: "+5%" },
];

// --- MUTATION FUNCTIONS (The API Layer) ---

// 1. Get All Courses
export const getCourses = () => [...courses];

// 2. Get Single Course
export const getCourseById = (id: string) => courses.find(c => c.course_id === id);

// 3. Create Course (Using Math.random for ID)
export const createCourse = (courseData: Partial<CourseEntity>) => {
  const newCourse: CourseEntity = {
    course_id: `c_${Math.random().toString(36).substr(2, 9)}`,
    course_title: courseData.course_title || "Untitled Course",
    course_description: courseData.course_description || "",
    course_difficulty: courseData.course_difficulty || "Beginner",
    course_price_inr: courseData.course_price_inr || 0,
    course_thumbnail_url: courseData.course_thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    course_progress: 0,
    course_instructor_id: "inst_001",
    course_is_published: false,
    course_modules: []
  };
  courses = [newCourse, ...courses];
  return newCourse;
};

// 4. Add Module (Using Math.random for ID)
export const addModuleToCourse = (courseId: string, moduleData: Partial<ModuleEntity>) => {
  const courseIndex = courses.findIndex(c => c.course_id === courseId);
  if (courseIndex === -1) return null;

  const newModule: ModuleEntity = {
    module_id: `m_${Math.random().toString(36).substr(2, 9)}`,
    module_title: moduleData.module_title || "New Module",
    module_description: "AI Generated Description based on upload...",
    module_video_url: "uploaded_video.mp4",
    module_duration_seconds: 0, 
    module_is_published: false,
    module_materials: {
        ai_smart_notes: [],
        ai_flashcards: [],
        ai_mind_map: { id: 'root', label: 'Processing...', children: [] },
        module_resources: []
    }
  };

  courses[courseIndex].course_modules.push(newModule);
  return newModule;
};

// 5. Publish Module
export const publishModule = (courseId: string, moduleId: string) => {
    const course = courses.find(c => c.course_id === courseId);
    if (!course) return;
    const module = course.course_modules.find(m => m.module_id === moduleId);
    if (module) module.module_is_published = true;
};