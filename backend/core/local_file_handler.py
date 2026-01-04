# backend/core/local_file_handler.py
import os

# Base directory for all course media, relative to the backend's root
MEDIA_ROOT = os.path.join(os.getcwd(), 'media_storage')
os.makedirs(MEDIA_ROOT, exist_ok=True)

def save_file_locally(temp_file_path, course_id, module_id, original_filename):
    """
    Saves a file from a temporary path to the final local media directory
    and returns the web-accessible URL path.
    """
    # 1. Create the final directory structure
    final_dir = os.path.join(MEDIA_ROOT, course_id, module_id)
    os.makedirs(final_dir, exist_ok=True)
    
    # 2. Define the final file path
    final_path = os.path.join(final_dir, original_filename)

    # 3. Move the file from temp to final location
    os.rename(temp_file_path, final_path)

    # 4. Construct the URL path that the frontend will use
    # Example: /media/course_123/mod_abc/video.mp4
    url_path = f"/media/{course_id}/{module_id}/{original_filename}"
    
    return url_path