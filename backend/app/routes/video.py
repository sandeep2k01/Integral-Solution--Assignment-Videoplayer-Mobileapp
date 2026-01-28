"""
Video Routes
Handles video listing, playback token generation, and streaming.

IMPORTANT SECURITY NOTE:
The raw YouTube URL/ID is NEVER exposed to the client.
Instead, we use signed playback tokens and proxy the stream.
"""
from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from app import mongo
from app.models.video import Video
from app.utils.helpers import (
    generate_playback_token, 
    verify_playback_token, 
    format_response
)

video_bp = Blueprint('video', __name__)


@video_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_videos():
    """
    Get active videos with pagination.
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit
        
        # Fetch active videos with pagination
        videos_cursor = mongo.db.videos.find({'is_active': True}).skip(skip).limit(limit)
        videos = []
        
        for video_data in videos_cursor:
            video = Video.from_dict(video_data)
            videos.append(video.to_json())
            
        total_videos = mongo.db.videos.count_documents({'is_active': True})
        
        return jsonify(format_response(
            True,
            data={
                'videos': videos,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total_videos,
                    'pages': (total_videos + limit - 1) // limit
                }
            }
        )), 200
        
    except Exception as e:
        return jsonify(format_response(
            False,
            message='An error occurred while fetching videos',
            errors=[str(e)]
        )), 500


@video_bp.route('/track', methods=['POST'])
@jwt_required()
def track_watch_progress():
    """
    Track user's watch progress for a video.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        video_id = data.get('video_id')
        progress_seconds = data.get('progress_seconds', 0)
        
        if not video_id:
            return jsonify(format_response(False, message='Video ID is required')), 400
            
        # Update or insert watch progress
        mongo.db.watch_history.update_one(
            {'user_id': user_id, 'video_id': video_id},
            {'$set': {
                'progress_seconds': progress_seconds,
                'last_watched': ObjectId() # Just for timestamping in this simple version
            }},
            upsert=True
        )
        
        return jsonify(format_response(True, message='Progress tracked')), 200
        
    except Exception as e:
        return jsonify(format_response(False, message='Tracking failed', errors=[str(e)])), 500


@video_bp.route('/<video_id>/stream', methods=['GET'])
@jwt_required()
def get_stream_url(video_id):
    """
    Get a signed playback token for a specific video.
    
    This implements Option B (Better) from the assignment:
    - Returns a playback_token instead of raw YouTube URL
    - The token is time-limited and user-specific
    - Client uses this token with /stream endpoint
    
    Args:
        video_id: The internal video ID (not YouTube ID)
    
    Returns:
        - 200: Playback token and stream endpoint
        - 401: Unauthorized
        - 404: Video not found
    """
    try:
        user_id = get_jwt_identity()
        
        # Find the video
        video_data = mongo.db.videos.find_one({
            '_id': ObjectId(video_id),
            'is_active': True
        })
        
        if not video_data:
            return jsonify(format_response(
                False,
                message='Video not found'
            )), 404
        
        # Generate playback token (expires in 1 hour)
        playback_token = generate_playback_token(
            video_id=video_id,
            user_id=user_id,
            expires_in=3600
        )
        
        # Return the token and endpoint
        # Note: We DON'T return the YouTube URL directly!
        return jsonify(format_response(
            True,
            data={
                'video_id': video_id,
                'playback_token': playback_token,
                'stream_endpoint': f'/api/video/play?token={playback_token}'
            }
        )), 200
        
    except Exception as e:
        return jsonify(format_response(
            False,
            message='An error occurred while generating stream URL',
            errors=[str(e)]
        )), 500


@video_bp.route('/play', methods=['GET'])
def play_video():
    """
    Play a video using a signed playback token.
    
    This endpoint verifies the token and redirects to the actual
    YouTube embed URL. In a production environment, you might want to:
    - Use a proper video proxy
    - Implement HLS streaming
    - Add rate limiting
    
    Query Params:
        - token: The signed playback token from /stream endpoint
    
    Returns:
        - 302: Redirect to YouTube embed URL
        - 400: Missing or invalid token
        - 404: Video not found
    """
    try:
        token = request.args.get('token')
        
        if not token:
            return jsonify(format_response(
                False,
                message='Playback token is required'
            )), 400
        
        # Verify token
        payload = verify_playback_token(token)
        if not payload:
            return jsonify(format_response(
                False,
                message='Invalid or expired playback token'
            )), 400
        
        video_id = payload.get('video_id')
        
        # Get the video from database
        video_data = mongo.db.videos.find_one({
            '_id': ObjectId(video_id),
            'is_active': True
        })
        
        if not video_data:
            return jsonify(format_response(
                False,
                message='Video not found'
            )), 404
        
        video = Video.from_dict(video_data)
        
        # Return the YouTube embed URL
        # This is where the "masking" happens - the client never sees the raw ID
        # They only get access through our verified token system
        youtube_embed_url = f"https://www.youtube.com/embed/{video.youtube_id}"
        
        return jsonify(format_response(
            True,
            data={
                'embed_url': youtube_embed_url,
                'title': video.title
            }
        )), 200
        
    except Exception as e:
        return jsonify(format_response(
            False,
            message='An error occurred during playback',
            errors=[str(e)]
        )), 500


@video_bp.route('/seed', methods=['POST'])
def seed_videos():
    """
    Seed the database with sample videos.
    This is a utility endpoint for development/testing.
    
    In production, this should be protected or removed.
    
    Returns:
        - 201: Videos seeded successfully
    """
    try:
        # Clear existing videos (optional)
        # mongo.db.videos.delete_many({})
        
        # Get sample videos
        sample_videos = Video.get_sample_videos()
        
        inserted_count = 0
        for video_data in sample_videos:
            # Check if video already exists
            existing = mongo.db.videos.find_one({'title': video_data['title']})
            if not existing:
                video = Video(
                    title=video_data['title'],
                    description=video_data['description'],
                    youtube_id=video_data['youtube_id']
                )
                mongo.db.videos.insert_one(video.to_dict())
                inserted_count += 1
        
        return jsonify(format_response(
            True,
            message=f'Seeded {inserted_count} new videos',
            data={'inserted_count': inserted_count}
        )), 201
        
    except Exception as e:
        return jsonify(format_response(
            False,
            message='An error occurred while seeding videos',
            errors=[str(e)]
        )), 500
