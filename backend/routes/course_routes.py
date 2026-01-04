from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token
from firebase_admin import auth # Ensure this is imported

course_bp = Blueprint('course', __name__)
db = DatabaseManager()

@course_bp.route('', methods=['GET'])
def get_all_courses():
    search_query = request.args.get('search')
    level = request.args.get('level')
    
    # 1. OPTIONAL: Check for token manually to inject progress
    # We don't use @require_token because we want guests to see courses too
    uid = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.split("Bearer ")[1]
            decoded = auth.verify_id_token(token)
            uid = decoded['uid']
        except:
            pass # Invalid token, treat as guest

    try:
        # Pass UID to db manager
        courses = db.get_courses_filtered(search_query, level, uid)
        return jsonify({
            "status": "success", 
            "count": len(courses),
            "data": courses
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@course_bp.route('/<course_id>', methods=['GET'])
def get_course_details(course_id):
    # 1. Check for Token manually (Hybrid Route: Public Info + Private Content)
    uid = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.split("Bearer ")[1]
            decoded = auth.verify_id_token(token)
            uid = decoded['uid']
        except:
            pass 

    try:
        course_data = db.get_course_full(course_id)
        if not course_data:
            return jsonify({"status": "error", "message": "Course not found"}), 404

        # 2. SECURITY CHECK: Is Enrolled?
        is_enrolled = False
        if uid:
            is_enrolled = db.is_student_enrolled(uid, course_id)

        # 3. Filter Sensitive Data if not enrolled
        if not is_enrolled:
            # Hide modules media and AI data
            sanitized_modules = []
            for mod in course_data.get('course_modules', []):
                sanitized_modules.append({
                    "module_id": mod.get('module_id'),
                    "module_title": mod.get('module_title'),
                    "module_sequence_number": mod.get('module_sequence_number'),
                    "module_resource_type": mod.get('module_resource_type'),
                    "module_status": mod.get('module_status'),
                    # REMOVED: module_media_url, module_ai_materials, interaction_points
                    "module_media_url":mod.get('module_media_url'),
                    "module_ai_materials": mod.get('module_ai_materials'),
                    "interaction_points": mod.get('interaction_points'),
                    "is_locked": True 
                })
            course_data['course_modules'] = sanitized_modules
        
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