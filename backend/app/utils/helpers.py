"""
Helper utilities for the application.
Includes playback token generation and verification.
"""
import os
import hmac
import hashlib
import time
import base64
import json


def generate_playback_token(video_id: str, user_id: str, expires_in: int = 3600) -> str:
    """
    Generate a signed playback token for secure video streaming.
    
    Args:
        video_id: The internal video ID (not YouTube ID)
        user_id: The authenticated user's ID
        expires_in: Token expiration time in seconds (default: 1 hour)
    
    Returns:
        A signed, base64-encoded token string
    """
    secret = os.getenv('PLAYBACK_SECRET', 'playback-secret')
    expires_at = int(time.time()) + expires_in
    
    # Create token payload
    payload = {
        'video_id': video_id,
        'user_id': user_id,
        'expires_at': expires_at
    }
    
    # Encode payload
    payload_json = json.dumps(payload, sort_keys=True)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode()
    
    # Create signature
    signature = hmac.new(
        secret.encode(),
        payload_b64.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Combine payload and signature
    token = f"{payload_b64}.{signature}"
    
    return token


def verify_playback_token(token: str) -> dict:
    """
    Verify a playback token and return the payload if valid.
    
    Args:
        token: The playback token to verify
    
    Returns:
        The token payload if valid, None if invalid or expired
    """
    try:
        secret = os.getenv('PLAYBACK_SECRET', 'playback-secret')
        
        # Split token into payload and signature
        parts = token.split('.')
        if len(parts) != 2:
            return None
        
        payload_b64, received_signature = parts
        
        # Verify signature
        expected_signature = hmac.new(
            secret.encode(),
            payload_b64.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(received_signature, expected_signature):
            return None
        
        # Decode payload
        payload_json = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        payload = json.loads(payload_json)
        
        # Check expiration
        if payload.get('expires_at', 0) < time.time():
            return None
        
        return payload
    
    except Exception:
        return None


def format_response(success: bool, message: str = None, data: dict = None, errors: list = None) -> dict:
    """
    Format a standard API response.
    
    Args:
        success: Whether the operation was successful
        message: Optional message to include
        data: Optional data payload
        errors: Optional list of error messages
    
    Returns:
        Formatted response dictionary
    """
    response = {'success': success}
    
    if message:
        response['message'] = message
    
    if data:
        response['data'] = data
    
    if errors:
        response['errors'] = errors
    
    return response
