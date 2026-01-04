import os
from flask import Blueprint, send_from_directory, jsonify

media_bp = Blueprint('media', __name__)

# This must match the folder defined in core/local_file_handler.py
MEDIA_ROOT = os.path.join(os.getcwd(), 'media_storage')

@media_bp.route('/<course_id>/<module_id>/<filename>')
def serve_media_file(course_id, module_id, filename):
    """
    Serves a specific media file (video, image, pdf).
    URL Pattern: /api/media/<course_id>/<module_id>/<filename>
    """
    directory_path = os.path.join(MEDIA_ROOT, course_id, module_id)
    
    if not os.path.exists(os.path.join(directory_path, filename)):
        return jsonify({"error": "File not found"}), 404
        
    return send_from_directory(directory_path, filename)