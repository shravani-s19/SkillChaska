from flask import Blueprint, request, jsonify, g
from core.db_manager import DatabaseManager
from core.security import require_token

learn_bp = Blueprint('learn', __name__)
db = DatabaseManager()

# --- Scope 3: Learning & AI Progress ---

@learn_bp.route('/<course_id>/<module_id>', methods=['GET'])
@require_token
def get_module_content(course_id, module_id):
    try:
        # 1. Check Enrollment
        if not db.is_student_enrolled(g.user_uid, course_id):
            return jsonify({"status": "error", "message": "Not enrolled"}), 403

        # 2. Get Module Data
        module_data = db.get_module_by_id(course_id, module_id)
        if not module_data:
            return jsonify({"status": "error", "message": "Module not found"}), 404

        # 3. Get User Progress (Pass course_id now!)
        user_progress = db.get_user_module_progress(g.user_uid, course_id, module_id)

        # 4. Sanitize
        sanitized_interactions = []
        for point in module_data.get('module_ai_interaction_points', []):
            sanitized_interactions.append({
                "interaction_id": point['interaction_id'],
                "timestamp": point['interaction_timestamp_seconds'],
                "interaction_question_text": point['interaction_question_text'], # Fix key name if inconsistent
                "interaction_options_list": point['interaction_options_list']
            })

        return jsonify({
            "video_url": module_data.get('module_media_url'),
            "interaction_points": sanitized_interactions,
            "watched_history": user_progress.get('last_timestamp', 0)
        }), 200

    except Exception as e:
        print(f"Learn Route Error: {e}") # Debug log
        return jsonify({"status": "error", "message": str(e)}), 500
    
@learn_bp.route('/validate', methods=['POST'])
@require_token
def validate_answer():
    """
    7. Validate Answer (The "Judge")
    Method: POST
    Endpoint: /api/learn/validate
    Payload: module_id, interaction_id, selected_option
    """
    try:
        data = request.json
        module_id = data.get('module_id')
        interaction_id = data.get('interaction_id')
        user_answer = data.get('selected_option')

        # 1. Fetch Correct Answer from DB (Private field)
        correct_answer, feedback = db.get_correct_answer(module_id, interaction_id)
        
        is_correct = (user_answer == correct_answer)
        
        # 2. Update Stats
        updated_xp = 0
        if is_correct:
            updated_xp = db.increment_student_xp(g.user_uid, amount=10)
            db.mark_interaction_complete(g.user_uid, module_id, interaction_id)

        return jsonify({
            "is_correct": is_correct,
            "feedback": feedback if not is_correct else "Correct!",
            "action": "continue_video" if is_correct else "rewind_to_start",
            "updated_xp": updated_xp
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@learn_bp.route('/heartbeat', methods=['POST'])
@require_token
def update_heartbeat():
    """
    8. Update Heartbeat
    Method: POST
    Endpoint: /api/learn/heartbeat
    Payload: { "module_id": "...", "current_timestamp": 45 }
    """
    try:
        data = request.json
        # db.update_watch_time(g.user_uid, data.get('module_id'), data.get('current_timestamp'))
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@learn_bp.route('/<course_id>/<module_id>/materials', methods=['GET'])
@require_token
def get_learning_materials(course_id, module_id):
    """
    Returns AI Smart Notes, Flashcards, Mindmaps
    """
    try:
        # Check enrollment first
        if not db.is_student_enrolled(g.user_uid, course_id):
            return jsonify({"status": "error", "message": "Not enrolled"}), 403
            
        materials = db.get_module_materials(course_id, module_id)
        
        # Ensure structure exists even if empty
        response_data = {
            "ai_smart_notes": materials.get('ai_smart_notes', []),
            "ai_flashcards": materials.get('ai_flashcards', []),
            "ai_mind_map": materials.get('ai_mind_map', {}),
            "module_resources": materials.get('module_resources', [])
        }
        
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@learn_bp.route('/complete', methods=['POST'])
@require_token
def mark_module_complete():
    """
    9. Mark Module as Complete
    Method: POST
    Payload: { "course_id": "...", "module_id": "..." }
    """
    try:
        data = request.json
        course_id = data.get('course_id')
        module_id = data.get('module_id')
        
        # Security: Check enrollment
        if not db.is_student_enrolled(g.user_uid, course_id):
             return jsonify({"status": "error", "message": "Not enrolled"}), 403

        # Update DB
        db.mark_module_completed(g.user_uid, course_id, module_id)
        
        # Check if this was the last module? (Optional, for UI prompts)
        is_course_complete = db.check_course_completion(g.user_uid, course_id)

        return jsonify({
            "status": "success", 
            "course_completed": is_course_complete
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500