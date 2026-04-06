import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const Skeleton = ({ width, height, style, borderRadius = 8 }) => {
    const { theme } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.colors.glassBorder,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const BuildCardSkeleton = () => (
    <View style={styles.cardSkeleton}>
        <View style={styles.headerSkeleton}>
            <Skeleton width={120} height={20} />
            <Skeleton width={80} height={16} />
        </View>
        <Skeleton width="80%" height={24} style={{ marginBottom: 12 }} />
        <View style={styles.specsSkeleton}>
            <Skeleton width={100} height={28} borderRadius={14} />
            <Skeleton width={100} height={28} borderRadius={14} />
        </View>
        <Skeleton width="100%" height={1} style={{ marginVertical: 12 }} />
        <View style={styles.footerSkeleton}>
            <Skeleton width={80} height={24} />
            <Skeleton width={100} height={36} borderRadius={20} />
        </View>
    </View>
);

// Skeleton for part cards in selection screens
export const PartCardSkeleton = () => (
    <View style={styles.partCardSkeleton}>
        <Skeleton width={80} height={80} borderRadius={8} />
        <View style={styles.partContentSkeleton}>
            <Skeleton width="85%" height={16} borderRadius={4} />
            <Skeleton width="50%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
            <View style={styles.specsSkeleton}>
                <Skeleton width={55} height={22} borderRadius={6} />
                <Skeleton width={55} height={22} borderRadius={6} />
                <Skeleton width={55} height={22} borderRadius={6} />
            </View>
        </View>
        <Skeleton width={60} height={20} borderRadius={4} />
    </View>
);

// Multiple part cards skeleton list
export const PartsListSkeleton = ({ count = 5 }) => (
    <View style={styles.listSkeleton}>
        {Array.from({ length: count }).map((_, i) => (
            <PartCardSkeleton key={i} />
        ))}
    </View>
);

// Skeleton for deal cards
export const DealCardSkeleton = () => (
    <View style={styles.dealCardSkeleton}>
        <Skeleton width="100%" height={100} borderRadius={8} />
        <Skeleton width="75%" height={14} borderRadius={4} style={{ marginTop: 10 }} />
        <View style={styles.dealPriceRow}>
            <Skeleton width={50} height={16} borderRadius={4} />
            <Skeleton width={35} height={12} borderRadius={4} />
        </View>
        <Skeleton width="100%" height={32} borderRadius={16} style={{ marginTop: 8 }} />
    </View>
);

// Horizontal deals list skeleton
export const DealsListSkeleton = ({ count = 4 }) => (
    <View style={styles.horizontalList}>
        {Array.from({ length: count }).map((_, i) => (
            <DealCardSkeleton key={i} />
        ))}
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    cardSkeleton: {
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    specsSkeleton: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    footerSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    partCardSkeleton: {
        flexDirection: 'row',
        padding: 15,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        alignItems: 'center',
    },
    partContentSkeleton: {
        flex: 1,
        marginLeft: 12,
    },
    listSkeleton: {
        padding: 15,
    },
    dealCardSkeleton: {
        width: 160,
        padding: 12,
        marginRight: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
    },
    dealPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    horizontalList: {
        flexDirection: 'row',
        paddingHorizontal: 15,
    },
});

