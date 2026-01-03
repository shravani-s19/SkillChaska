from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token

achievement_bp = Blueprint('achievement', __name__)
db = DatabaseManager()

@achievement_bp.route('/badges', methods=['GET'])
@require_token
def get_badges():
    """
    Get Badges Status based on Real User Stats
    """
    try:
        # 1. Fetch User Stats
        user = db.get_user(g.user_uid)
        stats = user.get('student_stats', {})
        
        total_xp = stats.get('stat_total_xp', 0)
        modules_done = stats.get('stat_modules_completed', 0)
        certs_earned = len(stats.get('stat_certificates_earned', []))
        
        # 2. Define Badge Logic
        # In a real app, these definitions would be in a DB collection
        badge_definitions = [
            {
                "id": "badge_start", 
                "name": "Fast Starter", 
                "description": "Completed your first learning module.",
                "icon": "🚀", 
                "color": "from-orange-400 to-red-500", 
                "condition": modules_done >= 1
            },
            {
                "id": "badge_xp_100", 
                "name": "Knowledge Seeker", 
                "description": "Earned 100 XP points.",
                "icon": "⚡", 
                "color": "from-yellow-400 to-orange-500", 
                "condition": total_xp >= 100
            },
            {
                "id": "badge_cert_1", 
                "name": "Certified Pro", 
                "description": "Earned your first Certificate.",
                "icon": "🏆", 
                "color": "from-blue-400 to-indigo-500", 
                "condition": certs_earned >= 1
            },
            {
                "id": "badge_master", 
                "name": "Course Master", 
                "description": "Completed 10 Modules.",
                "icon": "👑", 
                "color": "from-purple-400 to-pink-500", 
                "condition": modules_done >= 10
            }
        ]

        # 3. Process Logic
        results = []
        for b in badge_definitions:
            is_unlocked = b['condition']
            results.append({
                "id": b['id'],
                "name": b['name'],
                "description": b['description'],
                "icon": b['icon'],
                "color": b['color'],
                "earnedAt": "2024" if is_unlocked else None, # Mock date for now
                "isLocked": not is_unlocked
            })

        return jsonify(results), 200
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