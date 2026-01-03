from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token

course_bp = Blueprint('course', __name__)
db = DatabaseManager()

# backend/routes/course_routes.py

@course_bp.route('', methods=['GET'])
def get_all_courses():
    """
    3. Get All Courses
    Method: GET
    Endpoint: /api/courses
    Query Params: ?search=python&level=beginner
    
    Logic:
    - If params exist -> Filter result.
    - If params are missing -> Return ALL published courses.
    """
    search_query = request.args.get('search')
    level = request.args.get('level')
    
    try:
        # Call the DB method (now implemented below)
        courses = db.get_courses_filtered(search_query, level)
        print(courses)
        return jsonify({
            "status": "success", 
            "count": len(courses),
            "data": courses
        }), 200

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


# backend/routes/course_routes.py

@course_bp.route('/<course_id>/certificate', methods=['POST'])
@require_token
def generate_course_certificate(course_id):
    """
    Generate Certificate upon completion
    """
    try:
        # 1. STRICT CHECK: Verify Course Completion
        is_completed = db.check_course_completion(g.user_uid, course_id)
        
        if not is_completed:
            return jsonify({
                "status": "error", 
                "message": "Certificate denied. You have not completed all modules in this course."
            }), 403
        
        # 2. Generate Certificate
        cert_data = db.generate_certificate(g.user_uid, course_id)
        
        return jsonify({
            "status": "success", 
            "certificate": cert_data
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500