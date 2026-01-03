from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token
from schemas.models import StudentModel, InstructorModel # Assuming you have InstructorModel in schemas

auth_bp = Blueprint('auth', __name__)
db = DatabaseManager()

# --- Scope 1: User & Auth Management ---

@auth_bp.route('/register', methods=['POST'])
def register_user():
    """
    1. Register User
    Method: POST
    Endpoint: /api/auth/register
    Payload: uid, email, full_name, role
    
    Logic: Handles both Student (self-register) and Instructor (admin-registered).
    """
    try:
        data = request.json
        uid = data.get('uid')
        email = data.get('email')
        full_name = data.get('full_name')
        role = data.get('role', 'student') # Default to student

        if not uid or not email:
            return jsonify({"status": "error", "message": "Missing uid or email"}), 400

        # Check if user already exists
        existing_user = db.get_user(uid)
        if existing_user:
            return jsonify({"status": "success", "message": "User already exists", "user": existing_user}), 200

        # Create Model based on Role
        if role == 'instructor':
            # Note: For security, ensure only Admins can set role='instructor' via a middleware check if needed
            # For now, we trust the payload as per requirements
            new_user = InstructorModel.create_new(uid, email, full_name) # You need to add this to models.py
        else:
            new_user = StudentModel.create_new(uid, email, full_name, role="student")

        # Save to DB
        db.create_user_force(new_user) # Assuming create_user_force saves without checking

        return jsonify({
            "status": "success", 
            "user": new_user
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@require_token
def get_current_profile():
    """
    2. Get Current Profile
    Method: GET
    Endpoint: /api/auth/me
    Headers: Authorization: Bearer <firebase_token>
    """
    try:
        # g.user_uid is populated by @require_token
        user_data = db.get_user(g.user_uid)
        
        if not user_data:
            return jsonify({"status": "error", "message": "User not found"}), 404
            
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500