from flask import Blueprint, request, jsonify, g
from core.security import require_token
from services.ai_engine import AIEngine # Assuming this exists

ai_bp = Blueprint('ai', __name__)
ai_engine = AIEngine()

# --- Scope 5: AI Assistance ---

@ai_bp.route('/ask', methods=['POST'])
@require_token
def ask_ai_tutor():
    """
    13. Ask AI Tutor
    Method: POST
    Endpoint: /api/ai/ask
    Payload: current_timestamp, module_context, student_query
    """
    try:
        data = request.json
        context = data.get('module_context')
        timestamp = data.get('current_timestamp')
        query = data.get('student_query')

        # Logic: 
        # 1. Fetch transcript segment around 'timestamp' (Logic inside AI Engine)
        # 2. Call Gemini
        
        answer = ai_engine.ask_tutor(context, timestamp, query)
        print(answer)
        return jsonify({"answer": answer}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500