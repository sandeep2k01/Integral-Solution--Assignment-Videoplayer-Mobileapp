/**
 * Dashboard Screen (Home Screen)
 * Displays video tiles with thumbnails.
 * 
 * Note: Videos are fetched from the API without YouTube URLs.
 * Only thumbnails, titles, and descriptions are shown.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getVideos } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchVideos = async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        setError(null);

        try {
            const response = await getVideos();
            if (response.success) {
                // response.data now contains { videos, pagination }
                setVideos(response.data.videos);
            } else {
                setError(response.message || 'Failed to load videos');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Refresh videos when screen comes into focus
            fetchVideos();
        }, [])
    );

    const handleVideoPress = (video) => {
        navigation.navigate('VideoPlayer', { video });
    };

    const renderVideoCard = ({ item, index }) => (
        <TouchableOpacity
            style={[styles.videoCard, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}
            activeOpacity={0.85}
            onPress={() => handleVideoPress(item)}
        >
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{ uri: item.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.thumbnailOverlay}
                />
                <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color={colors.text.primary} />
                </View>
            </View>
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.videoDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
            >
                <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="videocam-off-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Videos Yet</Text>
            <Text style={styles.emptyText}>
                Videos will appear here once they're added
            </Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchVideos()}
            >
                <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent.primary} />
                <Text style={styles.loadingText}>Loading videos...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[colors.background.primary, colors.background.secondary]}
            style={styles.container}
        >
            {renderHeader()}

            {error ? (
                renderError()
            ) : (
                <FlatList
                    data={videos}
                    renderItem={renderVideoCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={() => (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Curated content. More videos coming soon.</Text>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => fetchVideos(true)}
                            tintColor={colors.accent.primary}
                            colors={[colors.accent.primary]}
                        />
                    }
                />
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    },
    loadingText: {
        ...typography.body,
        color: colors.text.secondary,
        marginTop: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    greeting: {
        ...typography.bodySmall,
        color: colors.text.secondary,
    },
    userName: {
        ...typography.h2,
        color: colors.text.primary,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    videoCard: {
        flex: 1,
        backgroundColor: colors.background.card,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...shadows.medium,
    },
    cardLeft: {
        marginRight: spacing.xs,
        marginLeft: spacing.xs,
    },
    cardRight: {
        marginLeft: spacing.xs,
        marginRight: spacing.xs,
    },
    thumbnailContainer: {
        position: 'relative',
        aspectRatio: 16 / 9,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 92, 231, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoInfo: {
        padding: spacing.sm,
    },
    videoTitle: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    videoDescription: {
        ...typography.caption,
        color: colors.text.tertiary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        ...typography.h3,
        color: colors.text.primary,
        marginTop: spacing.md,
    },
    emptyText: {
        ...typography.body,
        color: colors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    errorTitle: {
        ...typography.h3,
        color: colors.text.primary,
        marginTop: spacing.md,
    },
    errorText: {
        ...typography.body,
        color: colors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    retryButton: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.accent.primary,
        borderRadius: borderRadius.md,
    },
    retryText: {
        ...typography.button,
        color: colors.text.primary,
    },
    footer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        ...typography.caption,
        color: colors.text.tertiary,
        fontStyle: 'italic',
    },
});

export default DashboardScreen;
