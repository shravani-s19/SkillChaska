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
            
            # --- New Profile Fields ---
            "student_bio": "I am a passionate learner.",
            "student_website": "",
            "student_social_github": "",
            
            "student_stats": {
                "stat_days_streak": 0,
                "stat_total_xp": 0,
                "stat_modules_completed": 0,
                "stat_certificates_earned": [], # List of Cert IDs
                "stat_total_watch_time_hours": 0.0,
                "stat_total_quizzes_completed": 0
            },
            
            "student_enrolled_courses": [], 
            # Structure for enrolled course items:
            # {
            #    "course_id": "...",
            #    "progress_percent": 0,
            #    "is_completed": False
            # }

            "student_learning_progress": {}
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
            "course_is_published": True,
            "course_modules": [] 
        }

class ModuleModel:
    @staticmethod
    def create_new(title, seq_num, resource_type="video"):
        return {
            "module_id": generate_id("mod"),
            "module_title": title,
            "module_sequence_number": seq_num,
            "module_resource_type": resource_type,
            "module_media_url": "",
            "module_status": "draft",
            "module_ai_interaction_points": [],
            
            # --- New AI Material Fields ---
            "module_ai_materials": {
                "ai_smart_notes": [],
                "ai_flashcards": [],
                "ai_mind_map": { "id": "root", "label": title, "children": [] },
                "module_resources": []
            }
        }

class InteractionRequestModel:
    @staticmethod
    def create_new(student_id, student_name, instructor_id, course_id, module_id, query_text, timestamp_context):
        return {
            "request_id": generate_id("req"),
            "request_student_id": student_id,
            "request_student_name": student_name,
            "request_instructor_id": instructor_id,
            "request_course_id": course_id,
            "request_module_id": module_id,
            "request_query_text": query_text,
            "request_video_timestamp": timestamp_context, 
            "request_status": "pending",                 
            "request_created_at": get_utc_now(),
            "request_instructor_reply": "",              
            "request_meeting_link": ""                   
        }

class InstructorModel:
    @staticmethod
    def create_new(uid, email, full_name):
        return {
            "instructor_id": uid,
            "instructor_full_name": full_name,
            "instructor_email": email,
            "role": "instructor",
            "instructor_specialization": "", 
            "instructor_courses_created_ids": [],
            "instructor_joined_at": get_utc_now()
        }