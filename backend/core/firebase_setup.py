import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from core.config import Config
import os

def initialize_firebase():
    if not firebase_admin._apps:
        if not os.path.exists(Config.FIREBASE_CRED_PATH):
            raise FileNotFoundError(f"Missing {Config.FIREBASE_CRED_PATH}. Download it from Firebase Console.")
            
        cred = credentials.Certificate(Config.FIREBASE_CRED_PATH)
        firebase_admin.initialize_app(cred)

def get_db():
    return firestore.client()

def get_auth():
    return auth

def get_storage_bucket():
    """Returns the default storage bucket object"""
    # Make sure 'storageBucket' is defined in your firebase config or init
    return storage.bucket()