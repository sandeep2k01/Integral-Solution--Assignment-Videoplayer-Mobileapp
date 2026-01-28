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

    const renderVideoCard = ({ item }) => (
        <TouchableOpacity
            style={styles.videoCard}
            activeOpacity={0.9}
            onPress={() => handleVideoPress(item)}
        >
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{ uri: item.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                    style={styles.thumbnailOverlay}
                />

                <View style={styles.videoOverlayInfo}>
                    <Text style={styles.videoTitleOverlay} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.videoDescriptionOverlay} numberOfLines={1}>
                        {item.description}
                    </Text>
                </View>

                <View style={styles.playButton}>
                    <Ionicons name="play" size={28} color={colors.text.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'User'}</Text>
            </View>
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
            >
                <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderTitle = () => (
        <View style={styles.titleContainer}>
            <Text style={styles.sectionTitle}>Dashboard</Text>
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
                    ListHeaderComponent={renderTitle}
                    numColumns={1}
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
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    titleContainer: {
        paddingBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h1,
        color: colors.text.primary,
        fontSize: 28,
    },
    videoCard: {
        width: '100%',
        backgroundColor: colors.background.card,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        ...shadows.large,
    },
    thumbnailContainer: {
        position: 'relative',
        height: 200,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    videoOverlayInfo: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        right: spacing.md,
    },
    videoTitleOverlay: {
        ...typography.h3,
        color: '#FFFFFF',
        fontWeight: '700',
        marginBottom: 2,
    },
    videoDescriptionOverlay: {
        ...typography.bodySmall,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -25,
        marginLeft: -25,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
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
