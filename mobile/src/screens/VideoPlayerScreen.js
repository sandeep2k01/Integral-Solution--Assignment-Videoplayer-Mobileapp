/**
 * Video Player Screen
 * Displays video using a secure playback token.
 * 
 * IMPORTANT: The raw YouTube URL is NEVER exposed to this screen.
 * Instead, we:
 * 1. Request a playback token from the API
 * 2. Use that token to get the embed URL
 * 3. Display the video in a WebView
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getStreamUrl, getVideoEmbed, trackWatchProgress } from '../services/api';
import { colors, typography, spacing, borderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

const VideoPlayerScreen = ({ navigation, route }) => {
    const { video } = route.params;
    const [embedUrl, setEmbedUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadVideo();

        // Bonus: Watch Tracking
        // Tracking "start" of video
        trackWatchProgress(video.id || video._id, 0);

        // Every 30 seconds track progress (simplified logic)
        const tracker = setInterval(() => {
            trackWatchProgress(video.id || video._id, 30);
        }, 30000);

        return () => clearInterval(tracker);
    }, []);

    const loadVideo = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Fetching stream for video:', video.id || video._id);
            // Step 1: Get playback token from API
            const streamResponse = await getStreamUrl(video.id || video._id);

            if (!streamResponse.success) {
                console.error('Stream API Error:', streamResponse.message);
                setError(streamResponse.message || 'Failed to get stream');
                return;
            }

            const { playback_token } = streamResponse.data;
            console.log('Received playback token, fetching embed...');

            // Step 2: Use token to get actual embed URL
            const embedResponse = await getVideoEmbed(playback_token);

            if (!embedResponse.success) {
                console.error('Embed API Error:', embedResponse.message);
                setError(embedResponse.message || 'Failed to load video');
                return;
            }

            console.log('Received embed URL:', embedResponse.data.embed_url);
            // Step 3: Set the embed URL for WebView
            setEmbedUrl(embedResponse.data.embed_url);

        } catch (err) {
            console.error('Video Load Catch:', err);
            setError(err.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    };


    const openInYouTube = async () => {
        if (!embedUrl) return;

        try {
            // Extract video ID from embed URL (still using secure token flow)
            const videoId = embedUrl.match(/embed\/([^?]+)/)?.[1];
            if (videoId) {
                const { Linking } = require('react-native');
                // Try YouTube app first, fallback to browser
                const youtubeUrl = `vnd.youtube://${videoId}`;
                const browserUrl = `https://www.youtube.com/watch?v=${videoId}`;

                const canOpen = await Linking.canOpenURL(youtubeUrl);
                const urlToOpen = canOpen ? youtubeUrl : browserUrl;

                await Linking.openURL(urlToOpen);
            }
        } catch (err) {
            console.error('Failed to open YouTube:', err);
        }
    };


    const renderPlayer = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                    <Text style={styles.loadingText}>Loading video...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="logo-youtube" size={64} color={colors.status.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.youtubeButton} onPress={openInYouTube}>
                        <Ionicons name="logo-youtube" size={20} color="#fff" />
                        <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.retryButton} onPress={loadVideo}>
                        <Text style={styles.retryText}>Try Again in App</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (embedUrl) {
            // Convert regular YouTube embed to nocookie version for better mobile support
            const nocookieUrl = embedUrl.replace('youtube.com/embed', 'youtube-nocookie.com/embed');

            return (
                <WebView
                    source={{ uri: `${nocookieUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1&fs=1` }}
                    style={styles.webview}
                    originWhitelist={['*']}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={true}
                    startInLoadingState={true}
                    userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.error('WebView error:', nativeEvent);
                        // YouTube often blocks WebView playback - offer fallback
                        setError('YouTube restricts playback in mobile apps. Tap below to watch in YouTube.');
                    }}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.accent.primary} />
                        </View>
                    )}
                    onMessage={(event) => {
                        // Listen for YouTube player errors
                        const message = event.nativeEvent.data;
                        if (message.includes('error') || message.includes('153')) {
                            setError('YouTube restricts playback in mobile apps. Tap below to watch in YouTube.');
                        }
                    }}
                />
            );
        }

        return null;
    };

    return (
        <LinearGradient
            colors={[colors.background.primary, colors.background.secondary]}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Now Playing</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Video Player */}
            <View style={styles.playerContainer}>
                {renderPlayer()}
            </View>

            {/* Video Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDescription}>{video.description}</Text>

                {/* Video Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.controlButton}>
                        <Ionicons name="heart-outline" size={24} color={colors.text.secondary} />
                        <Text style={styles.controlText}>Like</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton}>
                        <Ionicons name="share-outline" size={24} color={colors.text.secondary} />
                        <Text style={styles.controlText}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton}>
                        <Ionicons name="bookmark-outline" size={24} color={colors.text.secondary} />
                        <Text style={styles.controlText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
                <Ionicons name="shield-checkmark" size={16} color={colors.status.success} />
                <Text style={styles.securityText}>
                    Secure playback via API token
                </Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.h3,
        color: colors.text.primary,
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 44,
    },
    playerContainer: {
        width: SCREEN_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: colors.background.tertiary,
    },
    webview: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.tertiary,
    },
    loadingText: {
        ...typography.body,
        color: colors.text.secondary,
        marginTop: spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.tertiary,
        padding: spacing.lg,
    },
    errorText: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    youtubeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: '#FF0000',
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    youtubeButtonText: {
        ...typography.button,
        color: '#FFFFFF',
        marginLeft: spacing.sm,
    },
    retryButton: {
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.accent.primary,
        borderRadius: borderRadius.md,
    },
    retryText: {
        ...typography.button,
        color: colors.text.primary,
    },
    infoContainer: {
        padding: spacing.lg,
    },
    videoTitle: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    videoDescription: {
        ...typography.body,
        color: colors.text.secondary,
        marginBottom: spacing.lg,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.primary,
    },
    controlButton: {
        alignItems: 'center',
    },
    controlText: {
        ...typography.caption,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    securityNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        marginTop: 'auto',
    },
    securityText: {
        ...typography.caption,
        color: colors.text.tertiary,
        marginLeft: spacing.xs,
    },
});

export default VideoPlayerScreen;
