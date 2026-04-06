import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

/**
 * A tooltip wrapper that uses the native HTML title attribute for web browsers
 * This provides the standardized browser-native tooltips on hover
 */
export default function Tooltip({ text, children, position = 'top' }) {
    const isWeb = Platform.OS === 'web';

    if (!isWeb || !text) {
        // On native platforms, just render children (no hover support)
        return children;
    }

    // Web: Use a div with the native title attribute for browser tooltips
    // Using View with a custom web prop doesn't work, so we use a real div
    return (
        <div
            title={text}
            style={{
                display: 'inline-flex',
                cursor: 'pointer',
            }}
        >
            {children}
        </div>
    );
}
