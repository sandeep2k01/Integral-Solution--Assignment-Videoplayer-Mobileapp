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
        These are embed-friendly YouTube videos verified for mobile playback.
        """
        return [
            {
                'title': 'The Power of Believing You Can Improve',
                'description': 'Carol Dweck talks about the growth mindset and how our beliefs about learning shape our success.',
                'youtube_id': '_X0mgOOSpLU'
            },
            {
                'title': 'How Great Leaders Inspire Action',
                'description': 'Simon Sinek explains the golden circle and why some leaders and organizations are more innovative.',
                'youtube_id': 'qp0HIF3SfI4'
            },
            {
                'title': 'Your Body Language Shapes Who You Are',
                'description': 'Amy Cuddy shows how power posing can change your mind, body, and life.',
                'youtube_id': 'Ks-_Mh1QhMc'
            },
            {
                'title': 'The Happy Secret to Better Work',
                'description': 'Shawn Achor reveals how positive psychology can boost happiness and productivity.',
                'youtube_id': 'fLJsdqxnZb0'
            },
            {
                'title': 'The Skill of Self Confidence',
                'description': 'Dr. Ivan Joseph explains how self-confidence is developed through practice and persistence.',
                'youtube_id': 'w-HYZv6HzAs'
            }
        ]
