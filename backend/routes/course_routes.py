from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token

course_bp = Blueprint('course', __name__)
db = DatabaseManager()

# --- Scope 2: Course Management (Student View) ---

@course_bp.route('', methods=['GET'])
def get_all_courses():
    """
    3. Get All Courses
    Method: GET
    Endpoint: /api/courses
    Query Params: ?search=python&level=beginner
    """
    search_query = request.args.get('search')
    level = request.args.get('level')
    
    try:
        # Filter logic should handle None values inside db_manager
        courses = db.get_courses_filtered(search_query, level)
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@course_bp.route('/<course_id>', methods=['GET'])
def get_course_details(course_id):
    """
    4. Get Course Details
    Method: GET
    Endpoint: /api/courses/<course_id>
    """
    try:
        # Fetch full metadata
        course_data = db.get_course_full(course_id)
        
        if not course_data:
            return jsonify({"status": "error", "message": "Course not found"}), 404

        # Logic: If user is NOT enrolled (checked via token if present, or generic), hide video URLs
        # For simplicity in this endpoint:
        # We assume frontend checks enrollment via /auth/me or separate logic.
        # Ideally, we verify token here to determine if we show video URLs.
        
        return jsonify(course_data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@course_bp.route('/enroll', methods=['POST'])
@require_token
def enroll_in_course():
    """
    5. Enroll in Course
    Method: POST
    Endpoint: /api/courses/enroll
    Payload: { "course_id": "...", "payment_reference": "..." }
    """
    try:
        data = request.json
        course_id = data.get('course_id')
        payment_ref = data.get('payment_reference')
        
        if not course_id or not payment_ref:
            return jsonify({"status": "error", "message": "Missing fields"}), 400

        # Logic: Validate payment with Gateway (Mocked here)
        payment_valid = True 
        
        if payment_valid:
            db.enroll_student(g.user_uid, course_id)
            return jsonify({"status": "enrolled", "access_granted": True}), 200
        else:
            return jsonify({"status": "error", "message": "Payment failed"}), 402
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500