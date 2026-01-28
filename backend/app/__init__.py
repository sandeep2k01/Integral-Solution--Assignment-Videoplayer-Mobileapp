"""
Flask Application Factory
Creates and configures the Flask app with all extensions and blueprints.
"""
from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

# Initialize extensions
mongo = PyMongo()
jwt = JWTManager()
bcrypt = Bcrypt()
# Rate limiter disabled - was causing issues on Render deployment
# Bonus feature, not core requirement
limiter = Limiter(key_func=get_remote_address, enabled=False)

def create_app():
    """Application factory pattern for Flask."""
    flask_app = Flask(__name__)
    
    # Configuration
    flask_app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/video_app')
    
    # Append SSL and timeout options if they aren't present (critical for Render/Atlas)
    if '?' not in flask_app.config['MONGO_URI']:
        flask_app.config['MONGO_URI'] += "?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&tlsAllowInvalidCertificates=true"
    else:
        flask_app.config['MONGO_URI'] += "&serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&tlsAllowInvalidCertificates=true"
    flask_app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    flask_app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-flask-secret')
    flask_app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour for access token
    flask_app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000 # 30 days for refresh token
    
    # Initialize extensions with app
    mongo.init_app(flask_app)
    jwt.init_app(flask_app)
    bcrypt.init_app(flask_app)
    limiter.init_app(flask_app)
    CORS(flask_app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.video import video_bp
    
    flask_app.register_blueprint(auth_bp, url_prefix='/api/auth')
    flask_app.register_blueprint(video_bp, url_prefix='/api/video')
    
    # Global Error Handler
    @flask_app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        tb = traceback.format_exc()
        # pass through HTTP errors
        if hasattr(e, 'code'):
            return jsonify({'success': False, 'message': str(e), 'code': e.code, 'traceback': tb}), e.code
        # now you're handling non-HTTP exceptions only
        return jsonify({'success': False, 'message': f"Internal Server Error: {str(e)}", 'type': type(e).__name__, 'traceback': tb}), 500

    # Root route
    @flask_app.route('/')
    def index():
        return "Backend is Live - Version 1.0.5"

    # Health check endpoint
    @flask_app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'API is running', 'version': '1.0.5'}
    
    return flask_app
