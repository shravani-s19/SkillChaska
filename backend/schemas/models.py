import uuid
from datetime import datetime

def get_utc_now():
    return datetime.utcnow().isoformat() + "Z"

def generate_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

class StudentModel:
    @staticmethod
    def create_new(uid, email, full_name, role="student", avatar_url=""):
        return {
            "student_id": uid,
            "student_full_name": full_name,
            "student_email": email,
            "role": role, 
            "student_subscription_tier": "basic",
            "student_avatar_url": avatar_url,
            "student_joined_at": get_utc_now(),
            
            "student_stats": {
                "stat_days_streak": 0,
                "stat_total_xp": 0,
                "stat_modules_completed": 0,
                "stat_certificates_earned": [],
                "stat_total_watch_time_hours": 0.0,
                "stat_total_quizzes_completed": 0
            },
            
            "student_enrolled_courses": [], # List of course IDs
            
            # --- NEW: Precise Resume Tracking ---
            "student_learning_progress": {
                # Format:
                "course_id_101": {
                    "last_accessed_module_id": "mod_05",
                    "last_timestamp_seconds": 145,
                    "completed_modules": ["mod_01", "mod_02"]
                }
            }
        }

class CourseModel:
    @staticmethod
    def create_new(title, description, price, instructor_id):
        return {
            "course_id": generate_id("course"),
            "course_title": title,
            "course_description": description,
            "course_thumbnail_url": "",
            "course_price_inr": price,
            "course_instructor_id": instructor_id,
            "course_created_at": get_utc_now(),
            "course_is_published": False,
            "course_modules": [] 
        }