from flask import Flask, jsonify
from flask_cors import CORS
from core.firebase_setup import initialize_firebase
from routes.auth_routes import auth_bp
from routes.course_routes import course_bp
from routes.learn_routes import learn_bp
from routes.instructor_routes import instructor_bp
from routes.ai_routes import ai_bp
from routes.achievement_routes import achievement_bp

def create_app():
    app = Flask(__name__)
    
    # 1. CORS Setup (Allow Frontend to connect)
    CORS(app, resources={r"/api/*": {"origins": ["*","http://172.25.80.1:5173/", "https://172.25.80.1:5173/"]}})

    # 2. Initialize Firebase
    try:
        initialize_firebase()
        print("✅ Firebase initialized successfully.")
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")

    # 3. Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(course_bp, url_prefix='/api/course')
    app.register_blueprint(learn_bp, url_prefix='/api/learn')
    app.register_blueprint(instructor_bp, url_prefix='/api/instructor')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(achievement_bp, url_prefix='/api/achievements')

    # 4. Health Check
    @app.route('/')
    def health_check():
        return jsonify({"status": "running", "service": "CodeMaska Backend v1"}), 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)