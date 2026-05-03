import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../stores/themeStore';

interface SettingsRowProps {
    icon: string | React.ReactNode;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    isDestructive?: boolean;
    showDivider?: boolean;
}

export default function SettingsRow({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
    isDestructive = false,
    showDivider = true,
}: SettingsRowProps) {
    const { colors } = useTheme();
    const effectiveIconColor = iconColor || colors.textSecondary;

    return (
        <>
            <TouchableOpacity style={styles.row} onPress={onPress}>
                <View style={[styles.iconContainer, { backgroundColor: `${effectiveIconColor}15` }]}>
                    {typeof icon === 'string' ? (
                        <Text style={styles.icon}>{icon}</Text>
                    ) : (
                        icon
                    )}
                </View>
                <View style={styles.content}>
                    <Text style={[
                        styles.title,
                        { color: colors.text },
                        isDestructive && { color: colors.error }
                    ]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                    )}
                </View>
                <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
            {showDivider && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        </>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 18,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    chevron: {
        fontSize: 22,
        fontWeight: '300',
    },
    divider: {
        height: 1,
        marginLeft: 64,
    },
});
