from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth
from core.firebase_setup import initialize_firebase

# Ensure firebase is ready
initialize_firebase()

def require_token(f):
    """
    Decorator to verify Firebase ID Token in Authorization Header.
    Populates g.user_uid, g.user_email, and g.token_payload
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized", "message": "Missing Bearer Token"}), 401

        token = auth_header.split("Bearer ")[1]
        
        try:
            # Verify token with Firebase
            decoded_token = auth.verify_id_token(token)
            g.user_uid = decoded_token['uid']
            g.user_email = decoded_token.get('email')
            g.token_payload = decoded_token
            return f(*args, **kwargs)
            
        except auth.ExpiredIdTokenError:
            return jsonify({"error": "Unauthorized", "message": "Token Expired"}), 401
        except auth.InvalidIdTokenError:
            return jsonify({"error": "Unauthorized", "message": "Invalid Token"}), 401
        except Exception as e:
            return jsonify({"error": "Internal Error", "message": str(e)}), 500

    return decorated_function

def require_role(role_name):
    """
    Decorator to enforce RBAC (e.g., @require_role('instructor'))
    Note: Requires @require_token to run first.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # In a real app, you might fetch role from DB or Custom Claims.
            # For Phase 1, we will trust the role sent in body or rely on DB fetch in route.
            # This is a placeholder for Phase 2 hardening.
            return f(*args, **kwargs)
        return decorated_function
    return decorator