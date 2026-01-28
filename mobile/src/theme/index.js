/**
 * Theme Configuration
 * Centralized design tokens for the app.
 * 
 * Dark mode with vibrant accents for a modern, premium feel.
 */

export const colors = {
    // Background colors
    background: {
        primary: '#0A0A0F',
        secondary: '#12121A',
        tertiary: '#1A1A25',
        card: '#16161F',
        input: '#1E1E2A',
    },

    // Accent colors
    accent: {
        primary: '#6C5CE7',
        secondary: '#A29BFE',
        gradient: ['#6C5CE7', '#A29BFE'],
    },

    // Status colors
    status: {
        success: '#00D9A5',
        warning: '#FDCB6E',
        error: '#FF6B6B',
        info: '#74B9FF',
    },

    // Text colors
    text: {
        primary: '#FFFFFF',
        secondary: '#A0A0B0',
        tertiary: '#6B6B80',
        accent: '#6C5CE7',
        inverse: '#0A0A0F',
    },

    // Border colors
    border: {
        primary: '#2A2A3A',
        secondary: '#3A3A4A',
        focus: '#6C5CE7',
    },

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    // Font sizes
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 20,
    },
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    large: {
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};
