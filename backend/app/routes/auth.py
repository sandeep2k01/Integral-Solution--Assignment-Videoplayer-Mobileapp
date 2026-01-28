"""
Authentication Routes
Handles user registration, login, profile, and logout.
All passwords are hashed using bcrypt before storage.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from app import mongo, bcrypt, limiter
from app.models.user import User
from app.utils.helpers import format_response

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
@limiter.limit("5 per hour")
def signup():
    """
    Register a new user.
    """
    try:
        data = request.get_json()
        
        # Validate input
        errors = User.validate_signup_data(data)
        if errors:
            return jsonify(format_response(False, errors=errors)), 400
        
        # Check if email already exists
        existing_user = mongo.db.users.find_one({'email': data['email'].lower()})
        if existing_user:
            return jsonify(format_response(
                False, 
                message='Email already registered'
            )), 409
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create user
        user = User(
            name=data['name'].strip(),
            email=data['email'].lower().strip(),
            password=hashed_password
        )
        
        # Insert into database
        mongo.db.users.insert_one(user.to_dict())
        
        # Generate tokens
        access_token = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))
        
        return jsonify(format_response(
            True,
            message='Account created successfully',
            data={
                'user': user.to_json(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        )), 201
        
    except Exception as e:
        return jsonify(format_response(
            False,
            message='An error occurred during registration',
            errors=[str(e)]
        )), 500


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """
    Authenticate user and return tokens.
    """
    try:
        data = request.get_json()
        
        # Validate input
        errors = User.validate_login_data(data)
        if errors:
            return jsonify(format_response(False, errors=errors)), 400
        
        # Find user by email
        user_data = mongo.db.users.find_one({'email': data['email'].lower()})
        if not user_data:
            return jsonify(format_response(
                False,
                message='Invalid email or password'
            )), 401
        
        # Verify password
        if not bcrypt.check_password_hash(user_data['password'], data['password']):
            return jsonify(format_response(
                False,
                message='Invalid email or password'
            )), 401
        
        # Create user object
        user = User.from_dict(user_data)
        
        # Generate tokens
        access_token = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))
        
        return jsonify(format_response(
            True,
            message='Login successful',
            data={
                'user': user.to_json(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        )), 200
        
    except Exception as e:
        return jsonify(format_response(
            False,
            message='An error occurred during login',
            errors=[str(e)]
        )), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Generate new access token using refresh token.
    """
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(format_response(
        True,
        data={'access_token': access_token}
    )), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get current user's profile.
    Requires valid JWT token in Authorization header.
    
    Returns:
        - 200: User profile data
        - 401: Unauthorized (invalid/expired token)
        - 404: User not found
    """
    try:
        user_id = get_jwt_identity()
        
        from bson import ObjectId
        user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user_data:
            return jsonify(format_response(
                False,
                message='User not found'
            )), 404
        
        user = User.from_dict(user_data)
        
        return jsonify(format_response(
            True,
            data={'user': user.to_json()}
        )), 200
        
    except Exception as e:
        return jsonify(format_response(
            False,
            message='An error occurred while fetching profile',
            errors=[str(e)]
        )), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (invalidate token on client side).
    
    Note: Since we're using stateless JWT, actual token invalidation
    happens on the client by clearing the stored token.
    For production, consider using a token blacklist with Redis.
    
    Returns:
        - 200: Logout successful
    """
    # In a production environment, you might want to:
    # 1. Add the token to a blacklist in Redis
    # 2. Use refresh tokens with rotation
    # For this assignment, we'll keep it simple
    
    return jsonify(format_response(
        True,
        message='Logged out successfully'
    )), 200
