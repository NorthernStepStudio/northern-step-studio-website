import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface NoobsLogoProps {
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export function NoobsLogo({ size = 'medium', style }: NoobsLogoProps) {
    const isSmall = size === 'small';
    const isLarge = size === 'large';

    const iconSize = isSmall ? 24 : isLarge ? 48 : 36;
    const mainTextSize = isSmall ? 20 : isLarge ? 44 : 32;
    const subTextSize = isSmall ? 8 : isLarge ? 12 : 10;
    const spacing = isSmall ? 8 : isLarge ? 14 : 12;

    return (
        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing }, style]}>
            <View style={{ position: 'relative' }}>
                <MaterialCommunityIcons name="chart-line" size={iconSize} color={theme.colors.text} />
                <View style={{ position: 'absolute', bottom: 0, left: 0 }}>
                    <MaterialCommunityIcons name="trending-up" size={iconSize} color={theme.colors.text} />
                </View>
            </View>
            <View>
                <Text style={{
                    color: theme.colors.text,
                    fontSize: mainTextSize,
                    fontWeight: '900',
                    letterSpacing: -1,
                    lineHeight: mainTextSize
                }}>
                    NooBS
                </Text>
                <Text style={{
                    color: theme.colors.text,
                    fontSize: subTextSize,
                    fontWeight: '800',
                    letterSpacing: 3,
                    marginTop: 2
                }}>
                    INVESTING
                </Text>
            </View>
        </View>
    );
}
