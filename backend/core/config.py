import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    FIREBASE_CRED_PATH = "serviceAccountKey.json"
    FIREBASE_WEB_API_KEY = os.getenv('FIREBASE_WEB_API_KEY')