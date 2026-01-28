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
# limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])
# Disabling limiter temporarily for production stability
limiter = Limiter(key_func=get_remote_address, enabled=False)

def create_app():
    """Application factory pattern for Flask."""
    app = Flask(__name__)
    
    # Configuration
    # Add a shorter timeout and SSL bypass for restricted environments
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/video_app')
    if '?' in mongo_uri:
        app.config['MONGO_URI'] = f"{mongo_uri}&serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&tlsAllowInvalidCertificates=true"
    else:
        app.config['MONGO_URI'] = f"{mongo_uri}?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&tlsAllowInvalidCertificates=true"
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-flask-secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour for access token
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000 # 30 days for refresh token
    
    # Initialize extensions with app
    try:
        mongo.init_app(app)
    except Exception as e:
        app.logger.error(f"Failed to initialize MongoDB: {e}")
    
    try:
        jwt.init_app(app)
        bcrypt.init_app(app)
        limiter.init_app(app)
    except Exception as e:
        app.logger.error(f"Failed to initialize Other Extensions: {e}")

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.video import video_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(video_bp, url_prefix='/api/video')
    
    # Global Error Handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        # pass through HTTP errors
        if hasattr(e, 'code'):
            return jsonify({'success': False, 'message': str(e), 'code': e.code}), e.code
        # now you're handling non-HTTP exceptions only
        return jsonify({'success': False, 'message': f"Internal Server Error: {str(e)}", 'type': type(e).__name__}), 500

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'API is running'}
    
    return app
