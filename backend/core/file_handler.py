# backend
import os
import uuid
from core.firebase_setup import get_storage_bucket

def upload_file_to_cloud(local_path, destination_path, content_type):
    """
    Uploads a local file to Firebase Storage and returns the Public URL.
    """
    bucket = get_storage_bucket()
    blob = bucket.blob(destination_path)
    
    # Upload
    blob.upload_from_filename(local_path, content_type=content_type)
    
    # Make public (or generate signed URL)
    blob.make_public()
    return blob.public_url