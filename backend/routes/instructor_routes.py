# backend/routes/instructor_routes.py
import os
import threading
import uuid
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token
from services.ai_engine import AIEngine
from schemas.models import ModuleModel
from datetime import datetime # <--- Ensure this is imported at the top

instructor_bp = Blueprint('instructor', __name__)
db = DatabaseManager()
ai_engine = AIEngine()

# Ensure temp directory exists
TEMP_DIR = os.path.join(os.getcwd(), 'temp_uploads')
os.makedirs(TEMP_DIR, exist_ok=True)

@instructor_bp.route('/module/upload', methods=['POST'])
# @require_token # Uncomment for security
def upload_media_trigger_ai():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file part"}), 400
        
        file = request.files['file']
        course_id = request.form.get('course_id')
        title = request.form.get('title')
        m_type = request.form.get('type', 'video')

        if not course_id or not title:
            return jsonify({"status": "error", "message": "Missing metadata"}), 400

        # 1. Create DB Entry (Status: processing)
        # Determine sequence number (simple logic: get current count + 1)
        # For now, we default to 99, assuming frontend or DB logic handles reordering
        new_module = ModuleModel.create_new(title, seq_num=99, resource_type=m_type)
        new_module['module_status'] = 'processing'
        
        # Add to Firestore immediately so it appears in the list
        db.add_module_to_course(course_id, new_module)
        module_id = new_module['module_id']

        # 2. Save Temp File
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex[:6]}_{filename}"
        temp_path = os.path.join(TEMP_DIR, unique_filename)
        file.save(temp_path)

        # 3. Start AI Thread
        thread = threading.Thread(
            target=ai_engine.process_content_background,
            args=(course_id, module_id, temp_path, filename, file.content_type)
        )
        thread.start()

        return jsonify({
            "status": "success", 
            "module_id": module_id,
            "message": "Upload successful. AI processing started."
        }), 200

    except Exception as e:
        print(f"Upload Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    

# Add this endpoint for Frontend to poll status (fallback if not using Firestore Listeners)
@instructor_bp.route('/module/<module_id>/status', methods=['GET'])
@require_token
def get_processing_status(module_id):
    """
    Fetches the status from the processing_logs collection
    """
    status = db.db.collection('processing_logs').document(module_id).get()
    if status.exists:
        return jsonify(status.to_dict()), 200
    return jsonify({"status": "unknown"}), 404

# --- LIVE SESSIONS ---

@instructor_bp.route('/sessions', methods=['GET'])
@require_token
def get_student_sessions():
    try:
        # Query bookings for this student
        bookings_ref = db.db.collection('bookings').where('student_id', '==', g.user_uid).stream()
        
        user_sessions = []
        for doc in bookings_ref:
            data = doc.to_dict()
            user_sessions.append(data)
            
        return jsonify(user_sessions), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instructor_bp.route('/book-session', methods=['POST'])
@require_token
def book_mentor_session():
    """
    Book a 1:1 session
    """
    try:
        data = request.json
        topic = data.get('topic')
        date_str = data.get('date') # e.g. "2024-03-25 10:00 AM"
        mentor_name = data.get('mentor_name', 'Dr. Angela Yu')

        # FIX: Generate a real string for the timestamp
        created_at_iso = datetime.utcnow().isoformat()

        booking_data = {
            "id": str(uuid.uuid4()),
            "student_id": g.user_uid,
            "title": f"1:1 Mentorship: {topic}",
            "time": date_str,
            "type": "Mentorship",
            "mentor": mentor_name,
            "status": "confirmed",
            "created_at": created_at_iso # <--- Use string, NOT firestore.SERVER_TIMESTAMP
        }

        # Save to DB
        db.db.collection('bookings').add(booking_data)

        # Now this dictionary is safe to return as JSON
        return jsonify({"status": "success", "booking": booking_data}), 201

    except Exception as e:
        print(f"Booking Error: {e}") 
        return jsonify({"status": "error", "message": str(e)}), 500
    
    # backend/routes/instructor_routes.py
# ... imports (keep existing) ...
from schemas.models import CourseModel # Add this import

# ... keep existing /module/upload route ...

@instructor_bp.route('/courses', methods=['GET'])
@require_token
def get_my_courses():
    try:
        courses = db.get_courses_by_instructor(g.user_uid)
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instructor_bp.route('/courses', methods=['POST'])
@require_token
def create_course():
    try:
        data = request.json
        
        # Create Schema object
        course_data = CourseModel.create_new(
            title=data.get('course_title'),
            description=data.get('course_description'),
            price=data.get('course_price_inr', 0),
            instructor_id=g.user_uid
        )
        
        # Add extra fields
        course_data['course_difficulty'] = data.get('course_difficulty', 'Beginner')
        course_data['course_thumbnail_url'] = data.get('course_thumbnail_url', '')

        course_id = db.create_course(course_data)
        
        # Return full object for frontend
        return jsonify(course_data), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instructor_bp.route('/stats', methods=['GET'])
@require_token
def get_instructor_stats():
    # Placeholder for real stats aggregation
    return jsonify([
        { "label": "Total Students", "value": "120", "change": "+12%" },
        { "label": "Total Revenue", "value": "₹45,000", "change": "+5%" },
        { "label": "Active Courses", "value": "3", "change": "+0%" },
        { "label": "Avg Rating", "value": "4.8", "change": "+2%" }
    ]), 200