# API-First Video App

A full-stack mobile application demonstrating secure API-first architecture with **React Native** (frontend) and **Flask + MongoDB** (backend).

## 🎯 Assignment Overview

This project implements a "thin client" architecture where:
- **Mobile App**: Only handles UI/UX - no business logic
- **Backend API**: Handles all authentication, data, and video security
- **Key Feature**: YouTube URLs are **never exposed** to the client

## 📁 Project Structure

```
├── backend/                 # Flask API
│   ├── app/
│   │   ├── __init__.py     # App factory
│   │   ├── config.py       # Configuration
│   │   ├── models/         # MongoDB models
│   │   │   ├── user.py
│   │   │   └── video.py
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.py
│   │   │   └── video.py
│   │   └── utils/          # Helpers
│   │       └── helpers.py
│   ├── requirements.txt
│   ├── run.py
│   └── .env
│
└── mobile/                  # React Native (Expo)
    ├── App.js
    ├── src/
    │   ├── context/        # Auth context
    │   ├── screens/        # UI screens
    │   ├── services/       # API client
    │   └── theme/          # Design tokens
    ├── package.json
    └── app.json
```

## 🔐 Security Architecture

### The "Twist" - Secure Video Playback

The client **never** sees raw YouTube URLs. Instead:

1. **Dashboard** returns video metadata (title, description, thumbnail) without YouTube IDs
2. **Stream Request** generates a signed, time-limited playback token
3. **Play Request** verifies the token and returns the embed URL
4. **WebView** displays the video using the verified URL

```
Mobile App                    Backend API
     |                            |
     |-- GET /video/dashboard --> |  (Returns video list without YouTube IDs)
     |<-- [id, title, thumb] -----|
     |                            |
     |-- GET /video/{id}/stream ->|  (Generates playback token)
     |<-- playback_token ---------|
     |                            |
     |-- GET /play?token=xxx ---->|  (Verifies token, returns embed URL)
     |<-- embed_url --------------|
     |                            |
     |-- [WebView loads embed] -->|
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env with your MongoDB URI

# Run the server
python run.py
```

The API will be available at `http://localhost:5000`

### Seed Sample Videos

```bash
# Using curl or Postman
POST http://localhost:5000/api/video/seed
```

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

### Configure API URL

Edit `mobile/src/services/api.js`:

```javascript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator
const API_BASE_URL = 'http://localhost:5000/api';

// For Physical Device (use your computer's IP)
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

## 🌟 Top 10% Candidate Bonus Features

This project includes advanced features that demonstrate production-grade quality:

1. **Refresh Tokens**: Implemented with JWT rotation. Access tokens are short-lived, while refresh tokens reside securely on the device, allowing for long-running sessions without compromising security.
2. **Token Expiry Handling**: Frontend automatically intercepts 401 errors and attempts to refresh the access token silently without interrupting the user.
3. **Login Rate Limiting**: Uses `Flask-Limiter` to protect against brute-force attacks on the `/login` and `/signup` endpoints.
4. **Pagination-Ready Dashboard**: The video dashboard supports `page` and `limit` parameters, returning total counts and page metadata for scalable video discovery.
5. **Video Watch Tracking**: An automated tracking endpoint (`/api/video/track`) records user playback progress every 30 seconds, stored securely in MongoDB.
6. **Robust Error Feedback**: Comprehensive input validation and UI alerts for network failures or invalid credentials.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/signup` | Register new user (Rate limited) |
| POST   | `/api/auth/login` | Login user (Rate limited) |
| POST   | `/api/auth/refresh` | Refresh access token |
| GET    | `/api/auth/me` | Get user profile |
| POST   | `/api/auth/logout` | Logout user |

### Videos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/video/dashboard` | List videos (Paginated) |
| GET    | `/api/video/{id}/stream` | Get playback token |
| GET    | `/api/video/play?token=xxx` | Proxy embed URL |
| POST   | `/api/video/track` | Track watch progress |
| POST   | `/api/video/seed` | Seed database |

## 🎨 Mobile Screens

1. **Splash Screen** - Animated logo with auth check
2. **Login Screen** - Email/password authentication
3. **Signup Screen** - User registration with validation
4. **Dashboard** - Video grid with thumbnails
5. **Video Player** - Secure playback with WebView
6. **Settings** - User profile and logout

## 📦 Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  created_at: DateTime
}
```

### Video
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  youtube_id: String,  // Never exposed to client
  thumbnail_url: String,
  is_active: Boolean,
  created_at: DateTime
}
```

## 🛠 Tech Stack

### Backend
- **Framework**: Flask 3.0
- **Database**: MongoDB Atlas (Cloud)
- **Auth**: JWT with Refresh Tokens
- **Security**: Flask-Limiter, Bcrypt
- **CORS**: Flask-CORS

### Mobile
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation (Native Stack)
- **HTTP Client**: Axios with Interceptors
- **Secure Storage**: Expo SecureStore
- **Video**: React Native WebView (Modified for Direct Streaming)

## 📝 Assignment Requirements Checklist

- [x] React Native thin client
- [x] Flask backend with MongoDB
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Auth endpoints (signup, login, me, logout)
- [x] Video dashboard with thumbnails
- [x] **YouTube URLs never exposed to client**
- [x] Playback token system (Option B - Better)
- [x] Settings screen with logout
- [x] **Bonus**: Refresh tokens & session rotation
- [x] **Bonus**: Token expiry handling
- [x] **Bonus**: Rate limiting login
- [x] **Bonus**: Pagination-ready dashboard
- [x] **Bonus**: Video watch tracking endpoint

## 🤝 Contributing

This is an assignment project for Integral Solution.

## 📄 License

MIT License
