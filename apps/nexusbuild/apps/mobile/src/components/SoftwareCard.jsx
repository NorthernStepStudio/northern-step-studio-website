import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SoftwareCard = ({ item, isSelected, onToggle, type = 'game' }) => {
    const { colors } = useTheme();
    const isGame = type === 'game';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border }
            ]}
            onPress={() => onToggle(item)}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>{isGame ? item.title : item.name}</Text>
                    <Text style={[styles.subtitle, { color: colors.text }]}>
                        {isGame ? item.genre : item.category}
                    </Text>
                </View>
                {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                )}
            </View>

            {/* Performance Tags */}
            <View style={styles.tagsContainer}>
                <View style={[styles.tag, { backgroundColor: colors.background }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>
                        {isGame ? item.performance : item.focus}
                    </Text>
                </View>
            </View>

            {/* Extra Info */}
            {(item.tags || item.notes) && (
                <Text style={[styles.notes, { color: colors.text, opacity: 0.7 }]}>
                    {isGame ? item.tags?.join(' • ') : item.notes}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },
    checkBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    notes: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default memo(SoftwareCard);
