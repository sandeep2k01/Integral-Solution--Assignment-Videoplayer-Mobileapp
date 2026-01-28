/**
 * Settings Screen
 * Displays user info and logout functionality.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const SettingsScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout');
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const SettingsItem = ({ icon, title, subtitle, onPress, danger }) => (
        <TouchableOpacity
            style={styles.settingsItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, danger && styles.iconDanger]}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={danger ? colors.status.error : colors.accent.primary}
                />
            </View>
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, danger && styles.itemTitleDanger]}>
                    {title}
                </Text>
                {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.tertiary}
            />
        </TouchableOpacity>
    );

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
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <LinearGradient
                    colors={colors.accent.gradient}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                </LinearGradient>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                    <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
                </View>
            </View>

            {/* Settings List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                <SettingsItem
                    icon="person-outline"
                    title="Profile"
                    subtitle="Manage your profile information"
                    onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
                />

                <SettingsItem
                    icon="notifications-outline"
                    title="Notifications"
                    subtitle="Configure notification preferences"
                    onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon')}
                />

                <SettingsItem
                    icon="shield-outline"
                    title="Privacy"
                    subtitle="Manage your privacy settings"
                    onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon')}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App</Text>

                <SettingsItem
                    icon="information-circle-outline"
                    title="About"
                    subtitle="App version 1.0.0"
                    onPress={() => Alert.alert('About', 'API-First Video App\nVersion 1.0.0\n\nBuilt with React Native + Flask')}
                />

                <SettingsItem
                    icon="help-circle-outline"
                    title="Help & Support"
                    subtitle="Get help or report an issue"
                    onPress={() => Alert.alert('Support', 'Contact: support@integralsolution.com')}
                />
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? (
                    <ActivityIndicator color={colors.status.error} />
                ) : (
                    <>
                        <Ionicons name="log-out-outline" size={22} color={colors.status.error} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Integral Solution Assignment
                </Text>
                <Text style={styles.footerSubtext}>
                    API-First Video App
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
        ...typography.h2,
        color: colors.text.primary,
    },
    placeholder: {
        width: 44,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.md,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.medium,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        ...typography.h2,
        color: colors.text.primary,
    },
    profileInfo: {
        marginLeft: spacing.md,
        flex: 1,
    },
    profileName: {
        ...typography.h3,
        color: colors.text.primary,
    },
    profileEmail: {
        ...typography.bodySmall,
        color: colors.text.secondary,
        marginTop: 2,
    },
    section: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        ...typography.caption,
        color: colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconDanger: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    itemContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    itemTitle: {
        ...typography.body,
        color: colors.text.primary,
        fontWeight: '500',
    },
    itemTitleDanger: {
        color: colors.status.error,
    },
    itemSubtitle: {
        ...typography.caption,
        color: colors.text.tertiary,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    logoutText: {
        ...typography.button,
        color: colors.status.error,
        marginLeft: spacing.sm,
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    footerText: {
        ...typography.caption,
        color: colors.text.tertiary,
    },
    footerSubtext: {
        ...typography.caption,
        color: colors.text.tertiary,
        opacity: 0.6,
    },
});

export default SettingsScreen;
