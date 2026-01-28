"""
User Model
Handles user data structure and database operations.
"""
from datetime import datetime
from bson import ObjectId


class User:
    """User model for MongoDB."""
    
    collection_name = 'users'
    
    def __init__(self, name, email, password, created_at=None, _id=None):
        self._id = _id or ObjectId()
        self.name = name
        self.email = email
        self.password = password  # This should be hashed before storing
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert user object to dictionary for MongoDB insertion."""
        return {
            '_id': self._id,
            'name': self.name,
            'email': self.email,
            'password': self.password,
            'created_at': self.created_at
        }
    
    def to_json(self):
        """Convert user object to JSON-safe dictionary (excludes password)."""
        return {
            'id': str(self._id),
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def from_dict(data):
        """Create User object from dictionary."""
        if not data:
            return None
        return User(
            _id=data.get('_id'),
            name=data.get('name'),
            email=data.get('email'),
            password=data.get('password'),
            created_at=data.get('created_at')
        )
    
    @staticmethod
    def validate_signup_data(data):
        """Validate signup request data."""
        errors = []
        
        if not data.get('name'):
            errors.append('Name is required')
        elif len(data['name']) < 2:
            errors.append('Name must be at least 2 characters')
        
        if not data.get('email'):
            errors.append('Email is required')
        elif '@' not in data['email']:
            errors.append('Invalid email format')
        
        if not data.get('password'):
            errors.append('Password is required')
        elif len(data['password']) < 6:
            errors.append('Password must be at least 6 characters')
        
        return errors
    
    @staticmethod
    def validate_login_data(data):
        """Validate login request data."""
        errors = []
        
        if not data.get('email'):
            errors.append('Email is required')
        
        if not data.get('password'):
            errors.append('Password is required')
        
        return errors
