import google.generativeai as genai
import os
import json
import time
import PyPDF2
from gtts import gTTS
from moviepy.editor import AudioFileClip, ColorClip, TextClip, CompositeVideoClip
from core.config import Config
from core.db_manager import DatabaseManager
from core.file_handler import upload_file_to_cloud

db = DatabaseManager()
genai.configure(api_key=Config.GEMINI_API_KEY)

class AIEngine:
    def __init__(self):
        # Using 1.5 Flash as it is optimized for speed/cost. 
        # If 'gemini-3' becomes available/required, change here.
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    def process_content_background(self, course_id, module_id, local_file_path, file_type, mime_type):
        """
        Master Controller: Handles both raw video uploads and document-to-video conversions.
        """
        temp_generated_video = None
        
        try:
            # --- PATH A: User Uploaded a Video ---
            if "video" in mime_type:
                # 1. Upload Original Video to Cloud
                db.update_module_status(course_id, module_id, "Uploading Video to Cloud...", 10)
                storage_path = f"courses/{course_id}/modules/{module_id}_{os.path.basename(local_file_path)}"
                public_url = upload_file_to_cloud(local_file_path, storage_path, mime_type)
                db.update_module_video_url(course_id, module_id, public_url)

                # 2. Analyze
                self._analyze_video_logic(course_id, module_id, local_file_path)

            # --- PATH B: User Uploaded a Document (PDF/Text) ---
            elif "pdf" in mime_type or "text" in mime_type or "application" in mime_type:
                db.update_module_status(course_id, module_id, "Reading Document...", 10)
                
                # 1. Convert Doc to Video (The "Creation" Phase)
                temp_generated_video = self._convert_doc_to_video(course_id, module_id, local_file_path)
                
                # 2. Upload the GENERATED Video to Cloud (So student sees a video, not pdf)
                db.update_module_status(course_id, module_id, "Uploading Generated Lecture...", 40)
                storage_path = f"courses/{course_id}/modules/{module_id}_lecture.mp4"
                public_url = upload_file_to_cloud(temp_generated_video, storage_path, "video/mp4")
                db.update_module_video_url(course_id, module_id, public_url)

                # 3. Analyze the GENERATED Video (The "Analysis" Phase)
                # We recurse the logic using the new video file
                self._analyze_video_logic(course_id, module_id, temp_generated_video)

            else:
                db.update_module_status(course_id, module_id, "Unsupported file format.", 0)

        except Exception as e:
            print(f"❌ Processing Error: {e}")
            db.update_module_status(course_id, module_id, f"Error: {str(e)}", 0)
        
        finally:
            # Cleanup
            if os.path.exists(local_file_path):
                os.remove(local_file_path)
            if temp_generated_video and os.path.exists(temp_generated_video):
                os.remove(temp_generated_video)

    # --- SUB-ROUTINE: Document to Video Converter ---
    def _convert_doc_to_video(self, course_id, module_id, doc_path):
        """
        Extracts text -> TTS Audio -> Static Video MP4
        """
        text_content = ""
        
        # 1. Extract Text
        if doc_path.endswith('.pdf'):
            with open(doc_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text_content += page.extract_text() + " "
        else:
            # Assume text file
            with open(doc_path, 'r', encoding='utf-8', errors='ignore') as f:
                text_content = f.read()

        # Limit text for TTS demo (Google TTS has limits, simple implementation)
        # In prod, use Gemini to summarize text first into a "Script"
        summary_prompt = f"Summarize this document into a clear lecture script for students. Keep it under 500 words:\n\n{text_content[:5000]}"
        script_response = self.model.generate_content(summary_prompt)
        script_text = script_response.text

        # 2. Generate Audio (TTS)
        db.update_module_status(course_id, module_id, "Generating Audio Lecture...", 20)
        tts = gTTS(text=script_text, lang='en')
        temp_audio = f"temp_audio_{module_id}.mp3"
        tts.save(temp_audio)

        # 3. Create Video (MoviePy)
        db.update_module_status(course_id, module_id, "Rendering Video...", 30)
        
        # Load Audio
        audio_clip = AudioFileClip(temp_audio)
        duration = audio_clip.duration
        
        # Create Background (Black Screen or Simple Color)
        # 1280x720 (720p)
        video_clip = ColorClip(size=(1280, 720), color=(59, 29, 99), duration=duration) # Dark Purple bg
        video_clip = video_clip.set_audio(audio_clip)
        
        # Output Path
        output_video_path = f"temp_video_{module_id}.mp4"
        
        # Write File (24fps is enough for slides)
        video_clip.write_videofile(output_video_path, fps=24, codec="libx264", audio_codec="aac")

        # Cleanup Audio
        audio_clip.close()
        if os.path.exists(temp_audio):
            os.remove(temp_audio)

        return output_video_path

    # --- SUB-ROUTINE: Video Analysis (The Core) ---
    def _analyze_video_logic(self, course_id, module_id, video_path):
        gemini_file = None
        try:
            db.update_module_status(course_id, module_id, "AI watching video...", 50)
            
            # 1. Upload to Gemini
            gemini_file = genai.upload_file(path=video_path)
            
            while gemini_file.state.name == "PROCESSING":
                time.sleep(2)
                gemini_file = genai.get_file(gemini_file.name)

            if gemini_file.state.name == "FAILED":
                raise ValueError("AI failed to read video.")

            # 2. Generate Content
            db.update_module_status(course_id, module_id, "Generating Interactive Content...", 75)
            
            prompt = """
            Act as an expert course creator. Analyze this video content deeply.
            
            I need a comprehensive JSON output.
            
            1. **Interaction Points**: Create 3-5 timestamps where the video should PAUSE for a Multiple Choice Question.
            2. **Smart Notes**: Summarize key concepts with timestamps.
            3. **Flashcards**: Create 5 definitions from the video.
            4. **Mind Map**: Create a hierarchical structure of the topics covered.

            RETURN ONLY RAW JSON (No markdown blocks). Structure:
            {
                "interaction_points": [
                    { 
                        "interaction_timestamp_seconds": 15, 
                        "interaction_type": "quiz_mcq", 
                        "interaction_question_text": "...", 
                        "interaction_options_list": ["A", "B", "C", "D"], 
                        "interaction_correct_option": "A", 
                        "interaction_hint_text": "..." 
                    }
                ],
                "ai_materials": {
                    "ai_smart_notes": [
                        { "note_id": "n1", "timestamp_seconds": 10, "formatted_time": "00:10", "note_text": "..." }
                    ],
                    "ai_flashcards": [
                        { "card_id": "fc1", "front_text": "...", "back_text": "..." }
                    ],
                    "ai_mind_map": {
                        "id": "root", "label": "Main Topic", "children": [
                            { "id": "c1", "label": "Subtopic", "children": [] }
                        ]
                    }
                }
            }
            """
            
            response = self.model.generate_content([gemini_file, prompt])
            
            # 3. Clean & Parse
            raw = response.text.replace("```json", "").replace("```", "").strip()
            
            try:
                ai_data_full = json.loads(raw)
            except json.JSONDecodeError:
                # Fallback if AI adds extra text
                start_idx = raw.find('{')
                end_idx = raw.rfind('}') + 1
                ai_data_full = json.loads(raw[start_idx:end_idx])

            interaction_points = ai_data_full.get("interaction_points", [])
            ai_materials = ai_data_full.get("ai_materials", {})

            # 4. Save to DB
            db.update_module_ai_data(course_id, module_id, interaction_points, ai_materials)
            db.update_module_status(course_id, module_id, "Completed", 100)

        finally:
            if gemini_file:
                genai.delete_file(gemini_file.name)

    def ask_tutor(self, context, timestamp, query):
        """
        Answers a student's doubt based on the video context.
        
        Args:
            context (str): The topic/title of the module (e.g. "While Loops").
            timestamp (int): Current video time in seconds.
            query (str): The student's question.
        """
        try:
            # 1. Format timestamp for the AI (e.g., "2m 30s")
            minutes = int(timestamp) // 60
            seconds = int(timestamp) % 60
            time_str = f"{minutes}m {seconds}s"

            # 2. Construct the Persona and Prompt
            prompt = f"""
            You are an expert AI Coding Tutor on the 'SkillChaska' platform.
            
            Current Context:
            - The student is watching a video lesson about: "{context}".
            - The video is currently paused at: {time_str}.
            
            Student's Question: "{query}"
            
            Guidelines:
            1. Answer the question clearly and concisely.
            2. If the question is about "what is happening", explain the general concept of "{context}".
            3. Use a helpful, encouraging tone.
            4. If the question requires code, provide a short snippet.
            5. Do NOT mention "I cannot see the video". Use the provided context to infer the topic.
            """
            
            # 3. Call Gemini
            response = self.model.generate_content(prompt)
            
            # 4. Return clean text
            return response.text.strip()
            
        except Exception as e:
            print(f"❌ AI Tutor Error: {e}")
            return "I am currently overloaded with requests. Please try asking me again in a few seconds!"