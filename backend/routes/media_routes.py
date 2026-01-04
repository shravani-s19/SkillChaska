# backend/routes/media_routes.py
import os
from flask import Blueprint, send_from_directory
from core.local_file_handler import MEDIA_ROOT

media_bp = Blueprint('media', __name__)

@media_bp.route('/<course_id>/<module_id>/<filename>')
def serve_media_file(course_id, module_id, filename):
    """
    Serves a specific media file from the local storage.
    Example URL: /media/course_123/mod_abc/video.mp4
    """
    # Construct the directory path from the URL parameters
    directory_path = os.path.join(MEDIA_ROOT, course_id, module_id)
    
    # Securely send the file from the constructed path
    return send_from_directory(directory_path, filename)