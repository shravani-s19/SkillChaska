# backend/routes/auth_routes.py

import os
import uuid
import requests
from werkzeug.utils import secure_filename # <--- Added missing import
from flask import Blueprint, request, jsonify, g
from firebase_admin import auth
from core.db_manager import DatabaseManager
from core.security import require_token
from core.config import Config
from schemas.models import StudentModel, InstructorModel

# Assuming these exist in your project based on your code usage
# from core.utils import upload_file_to_cloud, TEMP_DIR 

auth_bp = Blueprint('auth', __name__)
db = DatabaseManager()

# --- 1. REGISTRATION ---
@auth_bp.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        role = data.get('role', 'student') 

        if not email or not password or not full_name:
            return jsonify({"status": "error", "message": "Missing email, password, or name"}), 400

        # Create User in Firebase
        try:
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=full_name
            )
            new_uid = user_record.uid
        except auth.EmailAlreadyExistsError:
            return jsonify({"status": "error", "message": "Email already exists"}), 409
        except Exception as e:
            return jsonify({"status": "error", "message": f"Auth Error: {str(e)}"}), 500

        # Create User in Firestore
        if role == 'instructor':
            new_user = InstructorModel.create_new(new_uid, email, full_name)
        else:
            new_user = StudentModel.create_new(new_uid, email, full_name, role="student")

        db.create_user_if_not_exists(new_user)

        return jsonify({
            "status": "success", 
            "message": "User registered successfully",
            "uid": new_uid
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# --- 2. LOGIN ---
@auth_bp.route('/login', methods=['POST'])
def login_user():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"status": "error", "message": "Missing credentials"}), 400
        print(Config.FIREBASE_WEB_API_KEY)
        request_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={Config.FIREBASE_WEB_API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }

        r = requests.post(request_url, json=payload)
        
        if r.status_code == 200:
            google_response = r.json()
            id_token = google_response['idToken']
            uid = google_response['localId']
            
            user_data = db.get_user(uid)
            
            return jsonify({
                "status": "success",
                "token": id_token,
                "user": user_data
            }), 200
        else:
            # Return the actual error from Google for debugging
            err_msg = r.json().get('error', {}).get('message', 'Invalid credentials')
            return jsonify({"status": "error", "message": err_msg}), 401

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# --- 3. GET PROFILE ---
@auth_bp.route('/me', methods=['GET'])
@require_token 
def get_current_profile():
    try:
        user_data = db.get_user(g.user_uid)
        
        if not user_data:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        # Returns the user object directly.
        # Frontend service expects this exact structure.
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@auth_bp.route('/me', methods=['PATCH'])
@require_token
def update_profile():
    """
    Update Profile Details
    Payload: { "student_full_name": "...", "student_bio": "..." }
    """
    try:
        data = request.json
        updated_user = db.update_student_profile(g.user_uid, data)
        return jsonify({"status": "success", "user": updated_user}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@auth_bp.route('/me/avatar', methods=['POST'])
@require_token
def upload_avatar():
    """
    Upload Avatar
    Form Data: file
    """
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "No file selected"}), 400

        filename = secure_filename(file.filename)
        unique_name = f"avatar_{g.user_uid}_{uuid.uuid4().hex[:6]}_{filename}"
        local_path = os.path.join(TEMP_DIR, unique_name)
        file.save(local_path)
        
        # Upload to Firebase
        storage_path = f"users/{g.user_uid}/avatar_{filename}"
        public_url = upload_file_to_cloud(local_path, storage_path, file.content_type)
        
        # Update DB
        db.update_student_avatar(g.user_uid, public_url)
        
        # Clean up
        if os.path.exists(local_path):
            os.remove(local_path)

        return jsonify({"status": "success", "avatar_url": public_url}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500