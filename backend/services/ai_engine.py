import os
import json
import time
import PyPDF2
from gtts import gTTS
from moviepy.editor import AudioFileClip, ImageClip, CompositeVideoClip
from weasyprint import HTML
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from core.config import Config
from core.db_manager import DatabaseManager
from core.local_file_handler import save_file_locally
from google import genai
from google.genai import types

# Use the new SDK's client
client = genai.Client(api_key=Config.GEMINI_API_KEY)
db = DatabaseManager()

class AIEngine:
    def __init__(self):
        # Using stable 1.5 flash for guaranteed schema adherence
        self.model_id = 'gemini-3-flash-preview'

    def _safe_json_loads(self, text):
        """
        Robustly parses JSON from AI response, handling markdown backticks
        and unexpected list-wrapping.
        """
        # Remove markdown backticks if present
        cleaned_text = text.strip().replace("```json", "").replace("```", "").strip()
        try:
            data = json.loads(cleaned_text)
            # If AI wrapped the object in a list, extract the first element
            if isinstance(data, list) and len(data) > 0:
                return data[0]
            return data
        except (json.JSONDecodeError, IndexError) as e:
            print(f"JSON Parsing Error: {e} | Raw Text: {text[:100]}")
            return {}

    # --- MASTER CONTROLLER ---
    def process_content_background(self, course_id, module_id, local_file_path, original_filename, mime_type):
        temp_files_to_delete = []
        try:
            print(local_file_path, original_filename, mime_type)
            # --- PATH A: User Uploaded a Video ---
            if "video" in mime_type:
                db.update_module_status(course_id, module_id, "Saving Video Locally...", 10)
                relative_url_path = save_file_locally(local_file_path, course_id, module_id, original_filename)
                
                # Using 127.0.0.1 for local testing, update to your specific IP if needed
                full_url = f"http://127.0.0.1:5000/api{relative_url_path}"
                db.update_module_video_url(course_id, module_id, full_url)
                
                final_local_path = os.path.join(os.getcwd(), 'media_storage', course_id, module_id, original_filename)
                self._analyze_video_logic(course_id, module_id, final_local_path)

            # --- PATH B: User Uploaded a Document ---
            elif "pdf" in mime_type or "text" in mime_type or "application" in mime_type:
                db.update_module_status(course_id, module_id, "Analyzing Document Content...", 15)
                html_content, script_text = self._generate_html_and_script_from_doc(local_file_path)
                
                # 1. PDF Generation
                pdf_path = self._create_pdf_from_html(html_content, module_id)
                temp_files_to_delete.append(pdf_path)
                save_file_locally(pdf_path, course_id, module_id, f"{module_id}_notes.pdf")

                # 2. Video Generation
                video_path = self._create_scrolling_video(html_content, script_text, course_id, module_id)
                temp_files_to_delete.append(video_path)
                
                relative_v_path = save_file_locally(video_path, course_id, module_id, f"{module_id}_lecture.mp4")
                full_video_url = f"http://127.0.0.1:5000/api{relative_v_path}"
                db.update_module_video_url(course_id, module_id, full_video_url)
                
                final_video_path = os.path.join(os.getcwd(), 'media_storage', course_id, module_id, f"{module_id}_lecture.mp4")
                self._analyze_video_logic(course_id, module_id, final_video_path)

        except Exception as e:
            print(f"❌ Processing Error: {e}")
            db.update_module_status(course_id, module_id, f"Error: {str(e)}", 0)
        finally:
            if os.path.exists(local_file_path):
                os.remove(local_file_path)
            for f in temp_files_to_delete:
                if f and os.path.exists(f):
                    os.remove(f)

    # --- DOCUMENT PROCESSING SUB-ROUTINES ---
    def _generate_html_and_script_from_doc(self, doc_path):
        text = ""
        if doc_path.endswith('.pdf'):
            with open(doc_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages: text += page.extract_text() + " "
        else:
            with open(doc_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()

        prompt = f"""
        Analyze this document text. Generate a JSON dictionary with two keys:
        1. "html_content": A styled Tailwind CSS HTML document explaining the topics.
        2. "spoken_script": A clear, educational voiceover script.
        TEXT: {text[:7000]}
        """
        response = client.models.generate_content(
            model=self.model_id, 
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type='application/json')
        )
        data = self._safe_json_loads(response.text)
        return data.get('html_content', '<h1>No Content</h1>'), data.get('spoken_script', 'No script generated.')

    def _create_pdf_from_html(self, html_content, module_id):
        pdf_path = f"temp_{module_id}_notes.pdf"
        HTML(string=html_content).write_pdf(pdf_path)
        return pdf_path

    def _create_scrolling_video(self, html_content, script_text, course_id, module_id):
        db.update_module_status(course_id, module_id, "Generating Audio...", 40)
        tts = gTTS(text=script_text, lang='en')
        audio_path = f"temp_{module_id}.mp3"
        tts.save(audio_path)
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        db.update_module_status(course_id, module_id, "Rendering Video Frames...", 50)
        html_path = f"temp_{module_id}.html"
        image_path = f"temp_{module_id}.png"
        with open(html_path, "w", encoding="utf-8") as f: f.write(html_content)
        
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--window-size=1280,3000') # Tall window for scrolling content
        
        driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
        driver.get(f"file:///{os.path.abspath(html_path)}")
        time.sleep(2)
        driver.save_screenshot(image_path)
        driver.quit()

        db.update_module_status(course_id, module_id, "Animating Lecture...", 60)
        image_clip = ImageClip(image_path).set_duration(duration)
        img_width, img_height = image_clip.size
        
        def scroll(get_frame, t):
            # Slow scroll from top to bottom based on audio duration
            y_pos = -int((img_height - 720) * (t / duration))
            return get_frame(t)[y_pos : y_pos + 720, :]

        scrolling_clip = image_clip.fl(scroll, apply_to=['mask'])
        final_clip = CompositeVideoClip([scrolling_clip.set_position(('center', 'top'))], size=(1280, 720))
        final_clip = final_clip.set_audio(audio_clip)
        
        video_path = f"temp_{module_id}_lecture.mp4"
        final_clip.write_videofile(video_path, fps=24, codec="libx264")

        # Cleanup artifacts
        for p in [html_path, image_path, audio_path]:
            if os.path.exists(p): os.remove(p)
            
        return video_path
    
    # --- VIDEO ANALYSIS SUB-ROUTINE ---
    def _analyze_video_logic(self, course_id, module_id, video_path):
        gemini_file = None
        try:
            # 1. Upload Phase
            db.update_module_status(course_id, module_id, "Uploading Video to AI...", 70)
            print(f"Starting upload for: {video_path}")
            
            gemini_file = client.files.upload(file=video_path)
            print(f"Upload complete. Gemini File Name: {gemini_file.name}")
            
            # 2. Processing Wait Phase (The "Stuck" Fix)
            db.update_module_status(course_id, module_id, "Waiting for AI Processing...", 75)
            
            # Set a timeout (e.g., 5 minutes = 300 seconds)
            timeout = 300
            start_time = time.time()

            while gemini_file.state.name == "PROCESSING":
                elapsed_time = time.time() - start_time
                if elapsed_time > timeout:
                    raise TimeoutError("Video processing timed out on Google's side.")
                
                print(f"Video is processing... ({int(elapsed_time)}s elapsed)")
                time.sleep(5)  # Wait 5 seconds between checks to be polite to the API
                gemini_file = client.files.get(name=gemini_file.name)
            
            # 3. Validation Phase
            if gemini_file.state.name != "ACTIVE":
                raise ValueError(f"Video failed to process. Final State: {gemini_file.state.name}")
            
            print("Video is ACTIVE. Generating AI analysis...")

            # 4. Content Generation Phase
            db.update_module_status(course_id, module_id, "Generating Quizzes & Materials...", 85)
            
            prompt = """
            Analyze this video. Return a JSON dictionary:
             {
                "interaction_points": [
                    {"timestamp": "MM:SS", "question": "Question text?", "options": ["A", "B", "C", "D"], "answer": "Correct Option"}
                ],
                "ai_materials": {
                    "ai_smart_notes": [{"formatted_time": "00:00", "note_id": "1", "note_text": "Summary", "timestamp_seconds": 0}],
                    "ai_flashcards": [{"front_text": "Term", "back_text": "Definition", "card_id": "1"}],
                    "ai_mind_map": {"id": "root", "label": "Main Topic", "children": [{"id": "c1", "label": "Subtopic", "children": []}]}
                }
            }
            """
            
            # Note: For video analysis, setting a slightly higher timeout for the generation request is wise
            response = client.models.generate_content(
                model=self.model_id,
                contents=[gemini_file, prompt],
                config=types.GenerateContentConfig(response_mime_type='application/json')
            )
            
            # Safe Load Logic
            data = self._safe_json_loads(response.text)

            interaction_points = data.get("interaction_points", [])
            ai_materials = data.get("ai_materials", {})

            db.update_module_ai_data(course_id, module_id, interaction_points, ai_materials)
            db.update_module_status(course_id, module_id, "Completed", 100)
            print("AI Analysis Completed Successfully.")
            
        except Exception as e:
            print(f"❌ Video Analysis Error: {e}")
            db.update_module_status(course_id, module_id, f"AI Error: {str(e)}", 0)
        finally:
            # Clean up the file from Google's servers to save storage/privacy
            if gemini_file:
                print(f"Deleting remote file: {gemini_file.name}")
                try:
                    client.files.delete(name=gemini_file.name)
                except Exception as cleanup_error:
                    print(f"Warning: Failed to cleanup remote file: {cleanup_error}")