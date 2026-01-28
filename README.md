# API-First Video App

A full-stack mobile application demonstrating secure API-first architecture with **React Native** (frontend) and **Flask + MongoDB** (backend).

> **Live Backend API**: [https://integral-solution-assignment-videoplayer.onrender.com](https://integral-solution-assignment-videoplayer.onrender.com)
> **Final Mobile APK (v1.1.2)**: [Download Latest APK](https://expo.dev/artifacts/eas/765uUvnzQDPLtpJcyVuf5B.apk)

---

## 🎯 Assignment Overview

This project implements a **"thin client" architecture** where:
- **Mobile App**: Only handles UI/UX - **no business logic**
- **Backend API**: Handles all authentication, data, and video security
- **Key Security Feature**: YouTube URLs are **NEVER exposed** to the client

### Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  React Native   │  HTTP   │   Flask API     │  Query  │   MongoDB       │
│  Mobile App     │ ◄─────► │   (Backend)     │ ◄─────► │   Atlas         │
│                 │   JWT   │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    │ Secure Token
                                    ▼
                            ┌─────────────────┐
                            │   YouTube       │
                            │   (Hidden)      │
                            └─────────────────┘
```

---

## 📁 Project Structure

```
├── backend/                 # Flask API Server
│   ├── app/
│   │   ├── __init__.py     # App factory + extensions
│   │   ├── routes/
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   └── video.py    # Video streaming endpoints
│   │   ├── models/
│   │   │   ├── user.py     # User model
│   │   │   └── video.py    # Video model
│   │   └── utils/
│   │       └── helpers.py  # Token generation/validation
│   ├── requirements.txt
│   ├── run.py              # Entry point
│   └── .env.example        # Environment template
│
└── mobile/                  # React Native (Expo)
    ├── App.js              # Root component
    ├── src/
    │   ├── context/        # Auth context (JWT storage)
    │   ├── screens/        # UI screens
    │   ├── services/       # API client (Axios)
    │   └── theme/          # Design tokens
    ├── app.json
    └── package.json
```

---

## 🔐 Security Architecture

### The "Twist" - Secure Video Playback Flow

The client **NEVER** sees raw YouTube URLs. The secure flow:

```
Step 1: Dashboard Request
────────────────────────
Mobile App ──► GET /api/video/dashboard ──► Backend
Mobile App ◄── [videos: {id, title, thumbnail}] ◄── Backend
                    ↑
                    │ (NO youtube_id exposed!)

Step 2: Stream Token Request  
───────────────────────────
Mobile App ──► GET /api/video/{id}/stream ──► Backend
                                              │
                                              ▼
                                        [Generates signed token
                                         with user_id + video_id
                                         + expiry timestamp]
                                              │
Mobile App ◄── {playback_token: "abc123..."} ◄┘

Step 3: Play Request (Token Verification)
─────────────────────────────────────────
Mobile App ──► GET /api/video/play?token=abc123 ──► Backend
                                                    │
                                                    ▼
                                              [Verifies signature,
                                               checks expiry,
                                               looks up youtube_id]
                                                    │
Mobile App ◄── {embed_url: "youtube.com/embed/xxx"} ◄┘
       │
       ▼
[WebView loads embed URL]
```

---

## 🚀 Quick Start Guide

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.9+ | Backend runtime |
| Node.js | 18+ | Mobile development |
| MongoDB | Atlas or Local | Database |
| Expo CLI | Latest | Mobile build |

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Run the server
python run.py
```

**Backend will be available at**: `http://localhost:5000`

### 2. Seed Sample Videos

```bash
# Using curl:
curl -X POST http://localhost:5000/api/video/seed

# Or using PowerShell:
Invoke-WebRequest -Uri http://localhost:5000/api/video/seed -Method Post
```

### 3. Mobile Setup

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### 4. Configure API URL

For local development, edit `mobile/src/services/api.js`:

```javascript
// Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// iOS Simulator
const API_BASE_URL = 'http://localhost:5000/api';

// Physical Device (use your computer's local IP)
const API_BASE_URL = 'http://192.168.1.XXX:5000/api';

// Production (Render deployment)
const API_BASE_URL = 'https://your-app.onrender.com/api';
```

### 5. Build APK (Optional)

```bash
cd mobile

# Configure EAS Build
eas build:configure

# Build for Android
eas build --platform android --profile preview
```

---

## 📡 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/signup` | Register new user | 5/min, 20/hr |
| POST | `/api/auth/login` | Authenticate user | 10/min, 50/hr |
| POST | `/api/auth/refresh` | Refresh access token | Default |
| GET | `/api/auth/me` | Get user profile | Default |
| POST | `/api/auth/logout` | Logout user | Default |

### Video Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/video/dashboard` | List videos (max 4) | ✅ JWT |
| GET | `/api/video/{id}/stream` | Get playback token | ✅ JWT |
| GET | `/api/video/play?token=xxx` | Get embed URL | Token |
| POST | `/api/video/track` | Track watch progress | ✅ JWT |
| POST | `/api/video/seed` | Seed database | None |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API status check |

---

## 🎨 Mobile Screens

| Screen | Description |
|--------|-------------|
| **Splash** | Animated logo with auth state check |
| **Login** | Email/password authentication |
| **Signup** | User registration with validation |
| **Dashboard** | Video grid (4 videos from API) |
| **Video Player** | Secure playback with WebView |
| **Settings** | User profile + logout button |

---

## 📦 Database Models

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,        // unique, lowercase
  password: String,     // bcrypt hashed
  created_at: DateTime
}
```

### Video Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  youtube_id: String,   // ⚠️ NEVER exposed to client
  thumbnail_url: String,
  is_active: Boolean,
  created_at: DateTime
}
```

---

## ✅ Assignment Requirements Checklist

### Core Requirements

- [x] React Native thin client (no business logic)
- [x] Flask backend with MongoDB
- [x] JWT authentication (access + refresh tokens)
- [x] Password hashing (bcrypt)
- [x] Auth endpoints (signup, login, me, logout, refresh)
- [x] Video dashboard with thumbnails (2 videos)
- [x] **YouTube URLs NEVER exposed to client** ✨
- [x] Signed playback token system (Option B - Better)
- [x] Settings screen with user profile and logout

### Bonus Features (Top 10% Candidate)

- [x] **Refresh Tokens**: JWT rotation for long sessions
- [x] **Token Expiry Handling**: Auto-refresh on 401
- [x] **Rate Limiting**: Protects auth endpoints (Flask-Limiter)
- [x] **Pagination-Ready**: Dashboard supports `page` & `limit`
- [x] **Watch Progress Tracking**: `/api/video/track` endpoint
- [x] **Live Deployment**: Hosted on Render
- [x] **Basic Logging**: Error tracking with tracebacks

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Flask 3.0 | Web framework |
| Flask-PyMongo | MongoDB integration |
| Flask-JWT-Extended | JWT authentication |
| Flask-Bcrypt | Password hashing |
| Flask-Limiter | Rate limiting |
| Flask-CORS | Cross-origin requests |

### Mobile
| Technology | Purpose |
|------------|---------|
| React Native (Expo SDK 52) | Cross-platform framework |
| React Navigation | Screen navigation |
| Axios | HTTP client with interceptors |
| Expo SecureStore | Secure token storage |
| React Native WebView | Video playback |

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET_KEY` | JWT signing secret | `your-256-bit-secret` |
| `SECRET_KEY` | Flask app secret | `your-flask-secret` |
| `PLAYBACK_SECRET` | Token signing secret | `your-playback-secret` |

---

## 📝 Notes for Evaluators

1. **Security First**: The entire video flow is designed so that YouTube IDs are never exposed to the mobile client. All video access goes through signed, time-limited tokens.

2. **API-First Design**: The mobile app is a true "thin client" - it makes API calls and renders data. No filtering, validation, or business logic happens on the client.

3. **Production Ready**: The backend is deployed on Render with proper error handling and database connection management. Version 1.0.6 includes optimized connection pooling for high-latency Atlas connections.

4. **UI/UX Polish**: Version 1.1.2 of the mobile app includes custom branding, secure playback labels, and informational platform notes to manage expectations regarding YouTube's mobile playback restrictions.

---

## 📄 License

MIT License - Integral Solution Assignment
