# backend/services/ai_engine.py
import google.generativeai as genai
import os
import json
import time
from core.config import Config
from core.db_manager import DatabaseManager
from core.file_handler import upload_file_to_cloud

db = DatabaseManager()
genai.configure(api_key=Config.GEMINI_API_KEY)

class AIEngine:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def process_content_background(self, course_id, module_id, local_file_path, file_type, mime_type):
        """
        The Main Worker:
        1. Uploads file to Firebase Storage (for permanent hosting).
        2. Uploads file to Gemini (for analysis).
        3. Updates DB.
        """
        public_url = ""
        try:
            # Step 1: Upload to Cloud Storage (So students can see it later)
            db.update_module_status(course_id, module_id, "Uploading to Cloud Storage...", 10)
            
            storage_path = f"courses/{course_id}/modules/{module_id}_{os.path.basename(local_file_path)}"
            public_url = upload_file_to_cloud(local_file_path, storage_path, mime_type)
            
            # Save the URL to the module immediately
            db.update_module_video_url(course_id, module_id, public_url)

            # Step 2: Route based on file type
            if "video" in mime_type:
                self._analyze_video_logic(course_id, module_id, local_file_path)
            elif "pdf" in mime_type or "application" in mime_type:
                self._analyze_document_logic(course_id, module_id, local_file_path)
            else:
                db.update_module_status(course_id, module_id, "File type not fully supported yet.", 100)

        except Exception as e:
            print(f"Processing Error: {e}")
            db.update_module_status(course_id, module_id, f"Error: {str(e)}", 0)
        
        finally:
            # Step 3: Cleanup Local File (Crucial for server health)
            if os.path.exists(local_file_path):
                os.remove(local_file_path)

    def _analyze_video_logic(self, course_id, module_id, video_path):
        """Internal logic for Gemini Video Processing"""
        gemini_file = None
        try:
            # Upload to Gemini
            db.update_module_status(course_id, module_id, "Analyzing with AI...", 30)
            gemini_file = genai.upload_file(path=video_path)
            
            while gemini_file.state.name == "PROCESSING":
                time.sleep(2)
                gemini_file = genai.get_file(gemini_file.name)

            if gemini_file.state.name == "FAILED":
                raise ValueError("AI failed to read video.")

            # Generate Questions (Strict JSON)
            db.update_module_status(course_id, module_id, "Generating Questions...", 60)
            
            prompt = """
            Analyze this video. Identify 3 key timestamps for quizzes.
            OUTPUT ONLY RAW JSON.
            [
              {
                "interaction_timestamp_seconds": 10,
                "interaction_type": "quiz_mcq",
                "interaction_question_text": "...",
                "interaction_options_list": ["A", "B"],
                "interaction_correct_option": "A",
                "interaction_hint_text": "..."
              }
            ]
            """
            response = self.model.generate_content([gemini_file, prompt])
            
            # Clean JSON
            raw = response.text.replace("```json", "").replace("```", "").strip()
            ai_data = json.loads(raw)
            
            # Save to DB
            db.update_module_ai_data(course_id, module_id, ai_data)
            db.update_module_status(course_id, module_id, "Completed", 100)

        finally:
            if gemini_file:
                genai.delete_file(gemini_file.name)

    def _analyze_document_logic(self, course_id, module_id, doc_path):
        """
        If user uploads a PDF, we treat it as a source for generating a video script or summary.
        """
        db.update_module_status(course_id, module_id, "Reading Document...", 50)
        # TODO: Implement PDF text extraction -> Gemini -> Video Generation
        # For Phase 2, we just mark it as uploaded.
        db.update_module_status(course_id, module_id, "Document Uploaded (Video Gen pending)", 100)