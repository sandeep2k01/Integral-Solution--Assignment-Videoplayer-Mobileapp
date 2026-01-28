/**
 * Splash Screen
 * Initial loading screen that checks authentication status.
 */
import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../theme';

const SplashScreen = ({ navigation }) => {
    const { isLoading, isAuthenticated } = useAuth();
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        // Animate logo
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            // Navigate after a brief delay for smooth transition
            const timer = setTimeout(() => {
                if (isAuthenticated) {
                    navigation.replace('Dashboard');
                } else {
                    navigation.replace('Login');
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isLoading, isAuthenticated, navigation]);

    return (
        <LinearGradient
            colors={[colors.background.primary, colors.background.secondary]}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.iconWrapper}>
                    <LinearGradient
                        colors={colors.accent.gradient}
                        style={styles.iconGradient}
                    >
                        <Ionicons name="play" size={40} color={colors.text.primary} />
                    </LinearGradient>
                </View>
                <Text style={styles.appName}>VideoStream</Text>
                <Text style={styles.tagline}>API-First Video Experience</Text>
            </Animated.View>

            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>

            <Text style={styles.footer}>Powered by Integral Solution</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        ...typography.h1,
        color: colors.text.primary,
        marginBottom: 8,
    },
    tagline: {
        ...typography.body,
        color: colors.text.secondary,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        ...typography.bodySmall,
        color: colors.text.tertiary,
        marginLeft: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        ...typography.caption,
        color: colors.text.tertiary,
    },
});

export default SplashScreen;
