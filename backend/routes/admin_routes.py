# backend/routes/admin_routes.py
from flask import Blueprint, request, jsonify, g
from firebase_admin import auth
from core.db_manager import DatabaseManager
from core.security import require_token
from schemas.models import InstructorModel

admin_bp = Blueprint('admin', __name__)
db = DatabaseManager()

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    # In a real app, verify admin claims via ID Token. 
    # For MVP, we validate hardcoded credentials or check a specific DB flag.
    data = request.json
    if data.get('email') == 'admin@codemaska.com' and data.get('password') == 'adminpassword':
        return jsonify({"status": "success", "token": "mock-admin-token-xyz"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@admin_bp.route('/instructors', methods=['GET'])
# @require_token # Uncomment to secure
def get_instructors():
    try:
        instructors = db.get_all_instructors()
        return jsonify(instructors), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/instructors', methods=['POST'])
# @require_token
def add_instructor():
    try:
        data = request.json
        email = data.get('email')
        name = data.get('name')
        # Default password for manually added instructors
        password = "password123" 

        # 1. Create in Firebase Auth
        try:
            user_record = auth.create_user(email=email, password=password, display_name=name)
            uid = user_record.uid
        except auth.EmailAlreadyExistsError:
            return jsonify({"status": "error", "message": "Email already exists"}), 409

        # 2. Create in Firestore
        new_instructor = InstructorModel.create_new(uid, email, name)
        db.create_instructor_if_not_exists(new_instructor)

        return jsonify({"status": "success", "id": uid, "name": name}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/instructors/<uid>', methods=['DELETE'])
# @require_token
def delete_instructor(uid):
    try:
        # 1. Delete from Auth
        auth.delete_user(uid)
        # 2. Delete from Firestore
        db.delete_user(uid)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500