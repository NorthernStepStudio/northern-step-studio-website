// apps/mobile/src/lib/roomIcons.ts
// Maps room emoji icons to MaterialCommunityIcons for professional display

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Map emoji icons to MaterialCommunityIcons names
const ICON_MAP: Record<string, { name: string; color: string }> = {
    // Living spaces
    '🛋️': { name: 'sofa', color: '#8B5CF6' },
    '🛋': { name: 'sofa', color: '#8B5CF6' },
    '🏠': { name: 'home-outline', color: '#10B981' },
    '🏡': { name: 'home-city-outline', color: '#10B981' },

    // Bedrooms
    '🛏️': { name: 'bed-outline', color: '#3B82F6' },
    '🛏': { name: 'bed-outline', color: '#3B82F6' },
    '🛌': { name: 'bed-king-outline', color: '#6366F1' },
    '👶': { name: 'baby-carriage', color: '#EC4899' },
    '🧒': { name: 'human-child', color: '#F59E0B' },

    // Kitchen & Dining
    '🍳': { name: 'stove', color: '#EF4444' },
    '🍽️': { name: 'silverware-fork-knife', color: '#10B981' },
    '🍽': { name: 'silverware-fork-knife', color: '#10B981' },
    '🥘': { name: 'pot-steam-outline', color: '#F97316' },

    // Bathroom
    '🚿': { name: 'shower-head', color: '#06B6D4' },
    '🛁': { name: 'bathtub-outline', color: '#0EA5E9' },
    '🚽': { name: 'toilet', color: '#64748B' },

    // Work & Study
    '💼': { name: 'briefcase-outline', color: '#6366F1' },
    '📚': { name: 'bookshelf', color: '#8B5CF6' },
    '💻': { name: 'laptop', color: '#3B82F6' },
    '🖥️': { name: 'monitor', color: '#1E293B' },
    '🖥': { name: 'monitor', color: '#1E293B' },

    // Storage & Utility
    '🗄️': { name: 'file-cabinet', color: '#64748B' },
    '🗄': { name: 'file-cabinet', color: '#64748B' },
    '📦': { name: 'package-variant', color: '#78716C' },
    '🧹': { name: 'broom', color: '#A78BFA' },
    '🧺': { name: 'basket-outline', color: '#F59E0B' },
    '👕': { name: 'tshirt-crew-outline', color: '#EC4899' },

    // Outdoor & Garage
    '🚗': { name: 'garage', color: '#475569' },
    '🅿️': { name: 'car-outline', color: '#3B82F6' },
    '🌳': { name: 'tree-outline', color: '#22C55E' },
    '🌿': { name: 'flower-outline', color: '#10B981' },
    '🌻': { name: 'flower', color: '#F59E0B' },
    '🏊': { name: 'pool', color: '#06B6D4' },

    // Entertainment
    '🎮': { name: 'gamepad-variant-outline', color: '#8B5CF6' },
    '📺': { name: 'television', color: '#1E293B' },
    '🎬': { name: 'filmstrip', color: '#EF4444' },
    '🎵': { name: 'music', color: '#EC4899' },

    // Other
    '🐕': { name: 'dog', color: '#78716C' },
    '🐈': { name: 'cat', color: '#F97316' },
    '🏋️': { name: 'dumbbell', color: '#EF4444' },
    '🧘': { name: 'meditation', color: '#8B5CF6' },
    '🎨': { name: 'palette-outline', color: '#EC4899' },
    '🔧': { name: 'wrench-outline', color: '#64748B' },
    '⚡': { name: 'lightning-bolt', color: '#F59E0B' },
    '❄️': { name: 'snowflake', color: '#06B6D4' },
    '🔥': { name: 'fire', color: '#EF4444' },
    '☀️': { name: 'white-balance-sunny', color: '#F59E0B' },
    '🌙': { name: 'moon-waning-crescent', color: '#6366F1' },
    '⭐': { name: 'star-outline', color: '#F59E0B' },
    '❤️': { name: 'heart-outline', color: '#EF4444' },
    '🏢': { name: 'office-building-outline', color: '#64748B' },
    '🏬': { name: 'store-outline', color: '#3B82F6' },
    '🏥': { name: 'hospital-building', color: '#EF4444' },
    '🏨': { name: 'hotel', color: '#8B5CF6' },
    '🏛️': { name: 'bank-outline', color: '#64748B' },
};

// Default icon when no mapping found
const DEFAULT_ICON = { name: 'home-outline', color: '#64748B' };

/**
 * Get MaterialCommunityIcons name and color for a room emoji
 */
export function getRoomIconInfo(emoji: string): { name: string; color: string } {
    return ICON_MAP[emoji] || DEFAULT_ICON;
}

interface RoomIconProps {
    icon: string;
    size?: number;
    containerSize?: number;
    showBackground?: boolean;
}

/**
 * RoomIcon component - displays MaterialCommunityIcon for room emoji
 */
export function RoomIcon({
    icon,
    size = 20,
    containerSize,
    showBackground = true
}: RoomIconProps) {
    const iconInfo = getRoomIconInfo(icon);
    const containerDim = containerSize || size + 16;

    if (!showBackground) {
        return (
            <MaterialCommunityIcons
                name={iconInfo.name as any}
                size={size}
                color={iconInfo.color}
            />
        );
    }

    return (
        <View style={[
            styles.iconContainer,
            {
                width: containerDim,
                height: containerDim,
                borderRadius: containerDim / 2,
                backgroundColor: `${iconInfo.color}15`
            }
        ]}>
            <MaterialCommunityIcons
                name={iconInfo.name as any}
                size={size}
                color={iconInfo.color}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
