import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI } from '../../services/api';

export default function AdminParts() {
    const { theme } = useTheme();
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadParts = async () => {
            try {
                const data = await adminAPI.getParts();
                setParts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load parts', error);
            } finally {
                setLoading(false);
            }
        };
        loadParts();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <Text style={{ color: theme.colors.textSecondary }}>Loading parts...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={parts}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <GlassCard style={styles.card}>
                    <View>
                        <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                            {item.category} • ${Number(item.price || 0).toFixed(0)}
                        </Text>
                    </View>
                </GlassCard>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        paddingBottom: 20,
    },
    card: {
        padding: 12,
        marginBottom: 12,
        borderRadius: 14,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    meta: {
        fontSize: 12,
    },
    center: {
        padding: 20,
        alignItems: 'center',
    },
});
