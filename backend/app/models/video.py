"""
Video Model
Handles video data structure and database operations.
IMPORTANT: youtube_id is NEVER exposed to the client!
"""
from datetime import datetime
from bson import ObjectId


class Video:
    """Video model for MongoDB."""
    
    collection_name = 'videos'
    
    def __init__(self, title, description, youtube_id, thumbnail_url=None, 
                 is_active=True, created_at=None, _id=None):
        self._id = _id or ObjectId()
        self.title = title
        self.description = description
        self.youtube_id = youtube_id  # NEVER expose this to client
        self.thumbnail_url = thumbnail_url or f"https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg"
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert video object to dictionary for MongoDB insertion."""
        return {
            '_id': self._id,
            'title': self.title,
            'description': self.description,
            'youtube_id': self.youtube_id,
            'thumbnail_url': self.thumbnail_url,
            'is_active': self.is_active,
            'created_at': self.created_at
        }
    
    def to_json(self):
        """
        Convert video object to JSON-safe dictionary.
        NOTE: youtube_id is EXCLUDED for security - we use our API to proxy playback.
        """
        return {
            'id': str(self._id),
            'title': self.title,
            'description': self.description,
            'thumbnail_url': self.thumbnail_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def from_dict(data):
        """Create Video object from dictionary."""
        if not data:
            return None
        return Video(
            _id=data.get('_id'),
            title=data.get('title'),
            description=data.get('description'),
            youtube_id=data.get('youtube_id'),
            thumbnail_url=data.get('thumbnail_url'),
            is_active=data.get('is_active', True),
            created_at=data.get('created_at')
        )
    
    @staticmethod
    def get_sample_videos():
        """
        Return sample video data for seeding the database.
        These are real YouTube video IDs for testing.
        """
        return [
            {
                'title': 'How Startups Fail',
                'description': 'Lessons from real founders about common startup mistakes and how to avoid them.',
                'youtube_id': 'bNpx7gpSqbY'
            },
            {
                'title': 'The Future of AI',
                'description': 'An in-depth look at artificial intelligence and its impact on society.',
                'youtube_id': '5MgBikgcWnY'
            },
            {
                'title': 'Building Great Products',
                'description': 'Product management insights from industry experts.',
                'youtube_id': 'C27RVio2rOs'
            },
            {
                'title': 'Startup Funding Explained',
                'description': 'Understanding venture capital, angel investors, and funding rounds.',
                'youtube_id': '677ZtSMr4-4'
            },
            {
                'title': 'Remote Work Culture',
                'description': 'How to build and maintain a strong remote work culture.',
                'youtube_id': 'x6fIseKzzH0'
            }
        ]
