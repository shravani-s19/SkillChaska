// File: src/types/index.ts

export interface StudentStats {
  stat_days_streak: number;
  stat_total_xp: number;
  stat_modules_completed: number;
  stat_total_watch_time_hours: number;
  stat_total_quizzes_completed: number;
  stat_certificates_earned: string[];
}

export interface StudentEntity {
  student_id: string;
  student_full_name: string;
  student_email: string;
  role: 'student' | 'instructor';
  student_subscription_tier: 'basic' | 'pro' | 'premium';
  student_avatar_url: string;
  student_joined_at: string;
  
  // -- NEW OPTIONAL FIELDS FOR PROFILE UI --
  student_bio?: string;
  student_website?: string;
  student_social_github?: string;
  student_social_twitter?: string;

  student_stats: StudentStats;
  student_enrolled_courses: (string | { course_id: string; progress_percent?: number; is_completed?: boolean })[];
  student_learning_progress: Record<string, {
    last_accessed_module_id: string;
    last_timestamp_seconds: number;
  }>;
}

export interface InteractionPoint {
  interaction_id: string;
  interaction_timestamp_seconds: number;
  interaction_type: 'quiz_mcq';
  interaction_question_text: string;
  interaction_options_list: string[];
  interaction_hint_text?: string;
}

export interface ModuleEntity {
  module_id: string;
  module_title: string;
  module_sequence_number: number;
  module_resource_type: 'video' | 'document';
  module_media_url: string;
  module_status: 'processing' | 'ready_for_review' | 'published';
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

export interface PlayerContentResponse {
  video_url: string;
  interaction_points: InteractionPoint[];
  watched_history: number;
}

export interface ValidateResponse {
  is_correct: boolean;
  feedback: string;
  action: 'continue_video' | 'rewind_to_start';
  updated_xp: number;
}

export interface SmartNote {
  note_id: string;
  timestamp_seconds: number;
  formatted_time: string; // e.g., "02:15"
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
  resource_size?: string; // e.g. "2.5 MB"
  resource_url: string;
}

export interface ModuleMaterialsResponse {
  ai_smart_notes: SmartNote[];
  ai_flashcards: Flashcard[];
  ai_mind_map: MindMapNode;
  module_resources: ModuleResource[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or URL
  color: string; // Tailwind class
  earnedAt: string | null; // ISO Date or null
  isLocked: boolean;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  credentialId: string;
  thumbnail: string;
}

export interface AchievementsResponse {
  badges: Badge[];
  certificates: Certificate[];
}

export interface AuthResponse {
  status: string;
  user: StudentEntity;
  uuid: string; // The backend-generated session ID
}