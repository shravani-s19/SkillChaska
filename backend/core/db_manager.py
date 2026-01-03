import datetime
import tempfile
import os
from core.firebase_setup import get_db
from google.cloud import firestore
from schemas.models import generate_id, get_utc_now
from core.certificate_template import get_certificate_html # <--- Import new file
from core.file_handler import upload_file_to_cloud   

class DatabaseManager:
    def __init__(self):
        self.db = get_db()
        self.users_ref = self.db.collection('users')
        self.courses_ref = self.db.collection('courses')

    # --- User Operations ---
    def get_user(self, uid):
        doc = self.users_ref.document(uid).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def create_user_if_not_exists(self, user_data):
        uid = user_data['student_id']
        doc_ref = self.users_ref.document(uid)
        doc = doc_ref.get()
        if not doc.exists:
            doc_ref.set(user_data)
            return user_data, True
        return doc.to_dict(), False

    def create_instructor_if_not_exists(self, user_data):
        uid = user_data['instructor_id']
        doc_ref = self.users_ref.document(uid)
        doc = doc_ref.get()
        if not doc.exists:
            doc_ref.set(user_data)
            return user_data, True
        return doc.to_dict(), False

    def update_student_profile(self, uid, update_data):
        """Updates bio, social links, name, etc."""
        self.users_ref.document(uid).update(update_data)
        return self.get_user(uid)

    def update_student_avatar(self, uid, url):
        self.users_ref.document(uid).update({"student_avatar_url": url})
        return url

    # --- Course & Module Operations ---
    def create_course(self, course_data):
        course_id = course_data['course_id']
        self.courses_ref.document(course_id).set(course_data)
        return course_id

    def add_module_to_course(self, course_id, module_data):
        course_ref = self.courses_ref.document(course_id)
        # Use ArrayUnion to append
        course_ref.update({
            "course_modules": firestore.ArrayUnion([module_data])
        })

    def get_all_courses_preview(self):
        docs = self.courses_ref.where("course_is_published", "==", True).stream()
        catalog = []
        for doc in docs:
            data = doc.to_dict()
            catalog.append({
                "course_id": data.get('course_id'),
                "course_title": data.get('course_title'),
                "course_description": data.get('course_description'),
                "course_price_inr": data.get('course_price_inr'),
                "course_instructor_id": data.get('course_instructor_id')
            })
        return catalog

    def get_course_full(self, course_id):
        doc = self.courses_ref.document(course_id).get()
        return doc.to_dict() if doc.exists else None

    def get_module_by_id(self, course_id, module_id):
        course = self.get_course_full(course_id)
        if course:
            for mod in course.get('course_modules', []):
                if mod['module_id'] == module_id:
                    return mod
        return None
    
    def get_module_materials(self, course_id, module_id):
        mod = self.get_module_by_id(course_id, module_id)
        if mod:
            return mod.get('module_ai_materials', {})
        return {}

    # --- Enrollment & Progress ---
    def enroll_student(self, uid, course_id):
        user_ref = self.users_ref.document(uid)
        # Add to enrolled list with initial progress
        enrollment_obj = {
            "course_id": course_id,
            "progress_percent": 0,
            "is_completed": False,
            "enrolled_at": get_utc_now()
        }
        user_ref.update({
            "student_enrolled_courses": firestore.ArrayUnion([enrollment_obj])
        })

    def is_student_enrolled(self, uid, course_id):
        user = self.get_user(uid)
        if not user: return False
        # Check in array
        for item in user.get('student_enrolled_courses', []):
            if isinstance(item, dict) and item.get('course_id') == course_id:
                return True
            if isinstance(item, str) and item == course_id: # Legacy check
                return True
        return False

    def update_learning_heartbeat(self, user_id, course_id, module_id, timestamp):
        user_ref = self.users_ref.document(user_id)
        
        # 1. Update Detailed Progress
        key = f"student_learning_progress.{course_id}"
        user_ref.update({
            f"{key}.last_accessed_module_id": module_id,
            f"{key}.last_timestamp_seconds": timestamp,
            f"{key}.last_updated_at": firestore.SERVER_TIMESTAMP
        })

        # 2. Update Course % (Simple Logic: Count unique modules accessed / Total Modules)
        # In a real app, you'd calculate this strictly. Here we mock increment logic or rely on 'completed_modules' set.
        # For now, we assume frontend or separate logic marks modules as complete.

    def get_course_resume_point(self, user_id, course_id):
        user_doc = self.users_ref.document(user_id).get()
        if not user_doc.exists: return None
        data = user_doc.to_dict()
        progress = data.get('student_learning_progress', {}).get(course_id)
        if progress:
            return {
                "module_id": progress.get('last_accessed_module_id'),
                "timestamp": progress.get('last_timestamp_seconds', 0)
            }
        return None

    def mark_interaction_complete(self, uid, module_id, interaction_id):
        # Placeholder for more complex analytics
        pass

    def increment_student_xp(self, uid, amount):
        user_ref = self.users_ref.document(uid)
        user_ref.update({"student_stats.stat_total_xp": firestore.Increment(amount)})
        return amount

    def get_correct_answer(self, module_id, interaction_id):
        # Scan all courses is inefficient, in prod use module_id query.
        # Here assuming we have context, but for MVP we search:
        # NOTE: This implementation assumes you know the course_id. 
        # Ideally, pass course_id to this function. 
        # For simplicity, returning a mock or needing refactor if course_id is missing.
        return "Option A", "Mock Feedback" # Needs course_id to find efficiently

    # --- Instructor & AI ---
    def update_module_status(self, course_id, module_id, status_message, percent_complete):
        log_ref = self.db.collection('processing_logs').document(module_id)
        log_ref.set({
            "status": status_message,
            "progress": percent_complete,
            "updated_at": firestore.SERVER_TIMESTAMP
        }, merge=True)

    def update_module_video_url(self, course_id, module_id, public_url):
        course_ref = self.courses_ref.document(course_id)
        doc = course_ref.get()
        if doc.exists:
            data = doc.to_dict()
            modules = data.get('course_modules', [])
            for mod in modules:
                if mod['module_id'] == module_id:
                    mod['module_media_url'] = public_url
                    break
            course_ref.update({"course_modules": modules})

    def update_module_ai_data(self, course_id, module_id, ai_interaction_list, ai_materials=None):
        course_ref = self.courses_ref.document(course_id)
        doc = course_ref.get()
        if doc.exists:
            data = doc.to_dict()
            modules = data.get('course_modules', [])
            for mod in modules:
                if mod['module_id'] == module_id:
                    mod['module_ai_interaction_points'] = ai_interaction_list
                    if ai_materials:
                        mod['module_ai_materials'] = ai_materials
                    mod['module_status'] = 'ready_for_review'
                    break
            course_ref.update({"course_modules": modules})

    # --- Certificates & Badges ---
    def get_all_badges(self):
        # Static definition as requested
        return [
            {
                "id": "badge_1", "name": "Fast Starter", "description": "Completed first module",
                "icon": "🚀", "color": "from-orange-400 to-red-500", "earnedAt": get_utc_now(), "isLocked": False
            },
            {
                "id": "badge_2", "name": "Python Pro", "description": "Completed Python Course",
                "icon": "🐍", "color": "from-blue-400 to-green-500", "earnedAt": None, "isLocked": True
            }
        ]

    def generate_certificate(self, uid, course_id):
        # 1. Verify Completion (Mock logic: assume if requested, it's valid or check progress)
        course = self.get_course_full(course_id)
        user = self.get_user(uid)
        
        cert_id = generate_id("cert")
        cert_data = {
            "id": cert_id,
            "courseTitle": course.get('course_title', 'Unknown Course'),
            "issueDate": datetime.now().strftime("%Y-%m-%d"),
            "credentialId": f"CM-{cert_id.upper()}",
            "thumbnail": "https://via.placeholder.com/600x400?text=Certificate+of+Completion" # Placeholder
        }
        
        # Save to user stats
        self.users_ref.document(uid).update({
            "student_stats.stat_certificates_earned": firestore.ArrayUnion([cert_id])
        })
        
        # Ideally store full cert details in a 'certificates' collection
        self.db.collection('certificates').document(cert_id).set(cert_data)
        
        return cert_data

    def get_certificates_by_ids(self, cert_ids):
        certs = []
        for cid in cert_ids:
            doc = self.db.collection('certificates').document(cid).get()
            if doc.exists:
                certs.append(doc.to_dict())
        return certs
    
    def generate_certificate(self, uid, course_id):
        # 1. Fetch Data
        user = self.get_user(uid)
        course = self.get_course_full(course_id)
        
        if not user or not course:
            raise ValueError("User or Course not found")

        student_name = user.get('student_full_name', 'Student')
        course_name = course.get('course_title', 'Course')
        cert_id = generate_id("cert")
        issue_date = datetime.now().strftime("%B %d, %Y")

        # 2. Generate HTML String
        html_content = get_certificate_html(student_name, course_name, issue_date, cert_id)

        # 3. Save to Temporary HTML File
        # We use a temp file because your file_handler expects a file path
        fd, temp_path = tempfile.mkstemp(suffix=".html")
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as tmp:
                tmp.write(html_content)
            
            # 4. Upload to Firebase Storage
            storage_path = f"certificates/{uid}/{course_id}_cert.html"
            public_url = upload_file_to_cloud(temp_path, storage_path, "text/html")
            
        finally:
            # Cleanup temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

        # 5. Create Certificate Record
        cert_data = {
            "id": cert_id,
            "courseTitle": course_name,
            "issueDate": issue_date,
            "credentialId": cert_id.upper(),
            "certificateUrl": public_url, # <--- The URL Frontend needs
            "thumbnail": "https://cdn-icons-png.flaticon.com/512/2912/2912761.png" # Generic Icon for UI list
        }

        # 6. Save Metadata to Firestore
        # Add to User Profile
        self.users_ref.document(uid).update({
            "student_stats.stat_certificates_earned": firestore.ArrayUnion([cert_id])
        })
        
        # Save independent Cert document
        self.db.collection('certificates').document(cert_id).set(cert_data)

        return cert_data
    
    def check_course_completion(self, uid, course_id):
        """
        Validates if the user has completed all modules in a course.
        Returns: Boolean
        """
        # 1. Get Course to count total modules
        course = self.get_course_full(course_id)
        if not course:
            return False
        course_modules = course.get('course_modules', [])
        total_modules_count = len(course_modules)
        
        if total_modules_count == 0:
            return False # Empty course cannot be "completed" for certificate

        # 2. Get User Progress
        user = self.get_user(uid)
        if not user:
            return False

        # 3. Retrieve Progress Data
        # Access: student_learning_progress -> course_id -> completed_modules (List)
        progress_map = user.get('student_learning_progress', {})
        course_progress = progress_map.get(course_id, {})
        
        completed_modules_list = course_progress.get('completed_modules', [])
        
        # 4. Compare
        # We use a set to ensure unique module IDs are counted
        unique_completed = set(completed_modules_list)
        
        # Check if user has completed at least as many modules as exist in the course
        if len(unique_completed) >= total_modules_count:
            return True
        print(f"Completed Modules: {len(unique_completed)} / {total_modules_count}")
        return False
    
    def get_courses_filtered(self, search_query=None, level=None):
    # Only get published courses
        query = self.courses_ref.where("course_is_published", "==", True)

        docs = query.stream()  # Now filtered on server-side

        results = []
        for doc in docs:
            data = doc.to_dict()

            # Apply additional client-side filters if needed
            if level:
                course_lvl = data.get('course_level', '').lower()
                if course_lvl != level.lower():
                    continue

            if search_query:
                query_lower = search_query.lower()
                title = data.get('course_title', '').lower()
                desc = data.get('course_description', '').lower()
                if query_lower not in title and query_lower not in desc:
                    continue

            # Format output (add any missing fields like course_level if you plan to use it)
            results.append({
                "course_id": data.get('course_id'),
                "course_title": data.get('course_title'),
                "course_description": data.get('course_description'),
                "course_price_inr": data.get('course_price_inr'),
                "course_instructor_id": data.get('course_instructor_id'),
                "course_thumbnail_url": data.get('course_thumbnail_url', ''),
                "course_level": data.get('course_level', 'Beginner'),  # will default if missing
                "course_total_modules": len(data.get('course_modules', []))
            })

        return results