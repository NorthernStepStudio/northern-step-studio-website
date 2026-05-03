import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../stores/themeStore';

interface ScreenHeaderProps {
    title: string;
    showBackButton?: boolean;
    rightAction?: React.ReactNode;
    onBackPress?: () => void;
}

export default function ScreenHeader({
    title,
    showBackButton = true,
    rightAction,
    onBackPress
}: ScreenHeaderProps) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    const BackButton = showBackButton ? (
        <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={handleBack}
        >
            <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={colors.text}
            />
        </TouchableOpacity>
    ) : <View style={styles.placeholder} />;

    const RightContent = rightAction || <View style={styles.placeholder} />;

    return (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderBottomWidth: 1,
                    paddingTop: insets.top + 10,
                }
            ]}
        >
            {BackButton}
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {RightContent}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        width: 40,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
});
