from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token

achievement_bp = Blueprint('achievement', __name__)
db = DatabaseManager()

@achievement_bp.route('/badges', methods=['GET'])
@require_token
def get_badges():
    """
    Get Badges Status
    """
    try:
        badges = db.get_all_badges()
        # In a real app, you would check logic to set 'isLocked' based on user stats
        return jsonify(badges), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@achievement_bp.route('/certificates', methods=['POST'])
@require_token
def get_certificates_details():
    """
    Get Certificates Details
    Payload: { "ids": ["cert_id_1"] }
    """
    try:
        data = request.json
        ids = data.get('ids', [])
        certs = db.get_certificates_by_ids(ids)
        return jsonify(certs), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500