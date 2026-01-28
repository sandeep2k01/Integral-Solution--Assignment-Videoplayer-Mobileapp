/**
 * API Service
 * Handles all communication with the Flask backend.
 * 
 * This is the ONLY place where API calls are made.
 * The rest of the app just uses these functions.
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Production Render Backend
const API_BASE_URL = 'https://integral-solution-assignment-videoplayer.onrender.com/api';




// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Increased to 30s to allow for Render cold start/DB timeouts
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

/**
 * Get stored tokens
 */
export const getToken = async () => {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const getRefreshToken = async () => {
    try {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
};

/**
 * Store tokens securely
 */
export const setTokens = async (accessToken, refreshToken) => {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        if (refreshToken) {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
    } catch (error) {
        console.error('Error storing tokens:', error);
    }
};

/**
 * Remove tokens (logout)
 */
export const removeTokens = async () => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
        console.error('Error removing tokens:', error);
    }
};

/**
 * Store user data
 */
export const setUserData = async (user) => {
    try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Error storing user data:', error);
    }
};

/**
 * Get stored user data
 */
export const getUserData = async () => {
    try {
        const data = await SecureStore.getItemAsync(USER_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors (including refresh token logic)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await getRefreshToken();
                if (refreshToken) {
                    const response = await api.post('/auth/refresh', {}, {
                        headers: { Authorization: `Bearer ${refreshToken}` }
                    });
                    if (response.data.success) {
                        const { access_token } = response.data.data;
                        await setTokens(access_token);
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                await removeTokens();
            }
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================

/**
 * Register a new user
 */
export const signup = async (name, email, password) => {
    try {
        const response = await api.post('/auth/signup', {
            name,
            email,
            password,
        });

        if (response.data.success) {
            const { access_token, refresh_token, user } = response.data.data;
            await setTokens(access_token, refresh_token);
            await setUserData(user);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

/**
 * Login user
 */
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password,
        });

        if (response.data.success) {
            const { access_token, refresh_token, user } = response.data.data;
            await setTokens(access_token, refresh_token);
            await setUserData(user);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

/**
 * Logout user
 */
export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        // Even if API fails, clear local tokens
        console.log('Logout API error:', error);
    } finally {
        await removeTokens();
    }
};

// ==================== VIDEO API ====================

/**
 * Get videos for dashboard with pagination
 */
export const getVideos = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/video/dashboard?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

/**
 * Track user's watch progress
 */
export const trackWatchProgress = async (videoId, progressSeconds) => {
    try {
        const response = await api.post('/video/track', {
            video_id: videoId,
            progress_seconds: progressSeconds,
        });
        return response.data;
    } catch (error) {
        // We often don't want to throw for tracking errors to avoid interrupting the UI
        console.warn('Tracking error:', error);
        return { success: false };
    }
};

/**
 * Get playback token for a video
 * This returns a signed token, NOT the raw YouTube URL
 */
export const getStreamUrl = async (videoId) => {
    try {
        const response = await api.get(`/video/${videoId}/stream`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

/**
 * Get video embed URL using playback token
 */
export const getVideoEmbed = async (token) => {
    try {
        const response = await api.get(`/video/play?token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

export default api;
