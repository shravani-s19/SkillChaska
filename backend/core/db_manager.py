from core.firebase_setup import get_db
from google.cloud import firestore

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
        
        # Transactional check to prevent overwriting
        doc = doc_ref.get()
        if not doc.exists:
            doc_ref.set(user_data)
            return user_data, True # Created
        return doc.to_dict(), False # Existed

    # --- Course Operations ---
    def create_course(self, course_data):
        course_id = course_data['course_id']
        self.courses_ref.document(course_id).set(course_data)
        return course_id

    def get_all_courses_preview(self):
        # Fetch only necessary fields for catalog
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
    
    def update_learning_heartbeat(self, user_id, course_id, module_id, timestamp):
        """
        Updates where the user currently is. Called every 30s or on pause.
        """
        user_ref = self.users_ref.document(user_id)
        
        # We use dot notation to update nested fields in Firestore map
        key = f"student_learning_progress.{course_id}"
        
        user_ref.update({
            f"{key}.last_accessed_module_id": module_id,
            f"{key}.last_timestamp_seconds": timestamp,
            f"{key}.last_updated_at": firestore.SERVER_TIMESTAMP
        })

    def get_course_resume_point(self, user_id, course_id):
        """
        Returns { module_id, timestamp } for a specific course
        """
        user_doc = self.users_ref.document(user_id).get()
        if not user_doc.exists:
            return None
            
        data = user_doc.to_dict()
        progress_map = data.get('student_learning_progress', {})
        course_progress = progress_map.get(course_id)
        
        if course_progress:
            return {
                "module_id": course_progress.get('last_accessed_module_id'),
                "timestamp": course_progress.get('last_timestamp_seconds', 0)
            }
        
        # Default: Start at the beginning
        return None
    
    def get_courses_by_instructor(self, instructor_id):
        """
        Fetches all courses created by this instructor.
        """
        docs = self.courses_ref.where("course_instructor_id", "==", instructor_id).stream()
        courses = []
        for doc in docs:
            courses.append(doc.to_dict())
        return courses

    def get_instructor_pending_requests(self, instructor_id):
        """
        Fetches unresolved doubts/interaction requests.
        """
        # Assuming you create a new collection 'interaction_requests'
        requests_ref = self.db.collection('interaction_requests')
        docs = requests_ref.where("request_instructor_id", "==", instructor_id)\
                           .where("request_status", "==", "pending")\
                           .order_by("request_created_at", direction=firestore.Query.DESCENDING)\
                           .stream()
        return [doc.to_dict() for doc in docs]

    def resolve_interaction_request(self, request_id, reply_text=None, meeting_link=None):
        """
        Updates the request status to resolved.
        """
        req_ref = self.db.collection('interaction_requests').document(request_id)
        
        update_data = {
            "request_status": "resolved",
            "request_resolved_at": firestore.SERVER_TIMESTAMP
        }
        if reply_text:
            update_data["request_instructor_reply"] = reply_text
        if meeting_link:
            update_data["request_meeting_link"] = meeting_link
            update_data["request_status"] = "scheduled" # Change status if meeting

        req_ref.update(update_data)

    def update_module_ai_data(self, course_id, module_id, ai_interaction_list):
        """
        Updates the module with AI-generated questions and sets status to 'ready_for_review'
        """
        course_ref = self.courses_ref.document(course_id)
        
        # Firestore array update is tricky for nested objects.
        # We must read the course, find the module, update it, and write back.
        # (For production, sub-collections for modules are better, but adhering to your schema):
        
        doc = course_ref.get()
        if doc.exists:
            data = doc.to_dict()
            modules = data.get('course_modules', [])
            
            for mod in modules:
                if mod['module_id'] == module_id:
                    mod['module_ai_interaction_points'] = ai_interaction_list
                    mod['module_status'] = 'ready_for_review' # Instructor can now see it
                    break
            
            course_ref.update({"course_modules": modules})

    def update_module_status(self, course_id, module_id, status_message, percent_complete):
        """
        Updates the module status for Real-time Frontend feedback.
        """
        # We need to find the specific module inside the array or subcollection.
        # Note: In a scalable app, modules should be a subcollection. 
        # Assuming your structure, we update the main course doc or a specific module log.
        
        # Recommended: Use a separate "processing_logs" collection for transient status 
        # to avoid write-contention on the main course object.
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