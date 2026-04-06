import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const BuildFocusHint = ({ selectedItems, type = 'game', onPress }) => {
    const { colors } = useTheme();

    const hint = useMemo(() => {
        if (!selectedItems || selectedItems.length === 0) return null;

        let cpuScore = 0;
        let gpuScore = 0;
        let vramScore = 0;
        let ramScore = 0;

        selectedItems.forEach(item => {
            const perf = type === 'game' ? item.performance : item.focus;
            const text = (perf || '').toLowerCase();

            if (text.includes('cpu')) cpuScore++;
            if (text.includes('gpu')) gpuScore++;
            if (text.includes('vram')) vramScore += 2; // High weight
            if (text.includes('ram')) ramScore++;
        });

        if (vramScore > 0) return { icon: 'layers', text: 'High VRAM Priority', color: '#E91E63' }; // Pink
        if (gpuScore > cpuScore) return { icon: 'speedometer', text: 'GPU Heavy Workload', color: '#9C27B0' }; // Purple
        if (cpuScore > gpuScore) return { icon: 'hardware-chip', text: 'CPU Multi-Core Focus', color: '#2196F3' }; // Blue
        if (ramScore > 2) return { icon: 'albums', text: 'High Capacity RAM', color: '#FF9800' }; // Orange

        return { icon: 'options', text: 'Balanced Build', color: '#4CAF50' }; // Green
    }, [selectedItems, type]);

    if (!hint) return null;

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
            <View style={[styles.hintCard, { backgroundColor: colors.card, borderLeftColor: hint.color }]}>
                <View style={styles.content}>
                    <Text style={[styles.label, { color: colors.text }]}>Build Focus Hint</Text>
                    <Text style={[styles.value, { color: hint.color }]}>{hint.text}</Text>
                </View>
                <Ionicons name={hint.icon} size={24} color={hint.color} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    hintCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BuildFocusHint;
