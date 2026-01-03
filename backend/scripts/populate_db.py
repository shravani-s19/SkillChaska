import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from core.db_manager import DatabaseManager
from schemas.models import StudentModel, InstructorModel, CourseModel, ModuleModel, generate_id

# 1. Initialize manually to avoid app.py conflicts
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db_manager = DatabaseManager()
print("🔥 Connected to Firestore...")

def create_auth_user(email, password, display_name):
    """Creates a user in Firebase Auth and returns the UID"""
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        print(f"✅ Auth User Created: {email} (UID: {user.uid})")
        return user.uid
    except auth.EmailAlreadyExistsError:
        print(f"⚠️ Auth User already exists: {email}. Fetching UID...")
        user = auth.get_user_by_email(email)
        return user.uid

def populate():
    # --- 1. Create Instructor ---
    inst_email = "instructor@codemaska.com"
    inst_uid = create_auth_user(inst_email, "pass123", "Dr. Angela Yu")
    
    inst_model = InstructorModel.create_new(inst_uid, inst_email, "Dr. Angela Yu")
    # Add specialization
    inst_model['instructor_specialization'] = "Python & Web Development"
    db_manager.create_instructor_if_not_exists(inst_model)
    print(f"✅ DB Profile Created: Instructor")

    # --- 2. Create Student ---
    stu_email = "student@codemaska.com"
    stu_uid = create_auth_user(stu_email, "pass123", "Rahul Kumar")
    
    stu_model = StudentModel.create_new(stu_uid, stu_email, "Rahul Kumar", role="student")
    # Give him some dummy stats
    stu_model['student_stats']['stat_total_xp'] = 500
    db_manager.create_user_if_not_exists(stu_model)
    print(f"✅ DB Profile Created: Student")

    # --- 3. Create a Course ---
    course_data = CourseModel.create_new(
        title="Complete Python Pro Bootcamp",
        description="Master Python by building 100 projects in 100 days. Learn automation, game, app and web development.",
        price=4999.00,
        instructor_id=inst_uid
    )
    # Hardcode a Thumbnail
    course_data['course_thumbnail_url'] = "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg"
    course_data['course_is_published'] = True
    
    course_id = db_manager.create_course(course_data)
    print(f"✅ Course Created: {course_data['course_title']} (ID: {course_id})")

    # --- 4. Add Modules with AI Data ---
    
    # Module 1: Video (Variables)
    mod1 = ModuleModel.create_new("Variables & Data Types", 1, "video")
    mod1['module_status'] = "published"
    mod1['module_media_url'] = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" # Dummy Video
    
    # Add Dummy AI Quiz
    mod1['module_ai_interaction_points'] = [
        {
            "interaction_id": generate_id("q"),
            "interaction_timestamp_seconds": 10,
            "interaction_type": "quiz_mcq",
            "interaction_question_text": "What keyword is used to define a function in Python?",
            "interaction_options_list": ["func", "def", "function", "define"],
            "interaction_correct_option": "def", # Backend Only
            "interaction_hint_text": "It starts with d"
        },
        {
            "interaction_id": generate_id("q"),
            "interaction_timestamp_seconds": 30,
            "interaction_type": "quiz_mcq",
            "interaction_question_text": "What is 2 + 2?",
            "interaction_options_list": ["3", "4", "5", "22"],
            "interaction_correct_option": "4",
            "interaction_hint_text": "Basic Math"
        }
    ]
    
    # Add Dummy AI Materials
    mod1['module_ai_materials'] = {
        "ai_smart_notes": [
            {"note_id": "n1", "timestamp_seconds": 5, "formatted_time": "00:05", "note_text": "Python is dynamically typed."}
        ],
        "ai_flashcards": [
             {"card_id": "f1", "front_text": "Integer", "back_text": "Whole number without decimals"}
        ],
        "ai_mind_map": {
            "id": "root", "label": "Variables", "children": [
                {"id": "c1", "label": "Strings", "children": []},
                {"id": "c2", "label": "Integers", "children": []}
            ]
        }
    }
    
    db_manager.add_module_to_course(course_id, mod1)
    print("✅ Module 1 Added (Video + Quiz)")

    # Module 2: PDF (Cheatsheet)
    mod2 = ModuleModel.create_new("Python Cheatsheet", 2, "document")
    mod2['module_status'] = "published"
    mod2['module_media_url'] = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    
    db_manager.add_module_to_course(course_id, mod2)
    print("✅ Module 2 Added (PDF)")

    # --- 5. Enroll the Student ---
    db_manager.enroll_student(stu_uid, course_id)
    print(f"✅ Student Enrolled in Course")

    print("\n🎉 DUMMY DATA POPULATED SUCCESSFULLY!")
    print(f"👉 Login as Instructor: {inst_email} / pass123")
    print(f"👉 Login as Student:    {stu_email} / pass123")

if __name__ == "__main__":
    populate()