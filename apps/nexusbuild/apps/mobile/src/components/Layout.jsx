import React from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import ChatOverlay from './ChatOverlay';

export default function Layout({ children, scrollable = true, stickyHeader = null, style, contentContainerStyle, ...props }) {
    const { theme } = useTheme();
    const Container = scrollable ? ScrollView : View;
    const isWeb = Platform.OS === 'web';

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]} edges={['top']}>
            <View style={styles.mainContainer}>
                <LinearGradient
                    colors={theme.gradients.background}
                    style={StyleSheet.absoluteFill}
                />

                {/* Sticky Header - Rendered outside scroll area */}
                {stickyHeader}

                <Container
                    style={[styles.container, style]}
                    contentContainerStyle={scrollable ? [styles.scrollContent, contentContainerStyle] : undefined}
                    showsVerticalScrollIndicator={!isWeb}
                    dataSet={{ testid: 'scroll-container' }}
                    {...props}
                >
                    {children}
                </Container>

                <ChatOverlay />

            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0a0a1a', // Fallback dark color for safe area
    },
    mainContainer: {
        flex: 1,
        // Web fix: constrain main container to viewport height  
        ...Platform.select({
            web: {
                height: '100vh',
                maxHeight: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            },
        }),
    },
    container: {
        flex: 1,
        // Web fix: ensure child takes full height for proper scrolling
        ...Platform.select({
            web: {
                height: '100%',
                overflowY: 'auto',
            },
        }),
    },
    scrollContent: {
        flexGrow: 1,
    },
});
