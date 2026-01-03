# backend/core/file_handler.py
import os
import uuid
import tempfile
from core.firebase_setup import get_storage_bucket

def upload_file_to_cloud(local_path, destination_path, content_type):
    """
    Uploads a local file to Firebase Storage and returns the Public URL.
    """
    bucket = get_storage_bucket()
    blob = bucket.blob(destination_path)
    blob.upload_from_filename(local_path, content_type=content_type)
    blob.make_public()
    return blob.public_url

def upload_string_as_html_file(html_content, destination_filename):
    """
    Takes an HTML string, saves it temporarily, uploads to Firebase, 
    and returns the Public URL.
    """
    bucket = get_storage_bucket()
    blob_path = f"certificates/{destination_filename}"
    blob = bucket.blob(blob_path)
    
    # Upload string directly
    blob.upload_from_string(html_content, content_type="text/html")
    blob.make_public()
    
    return blob.public_url