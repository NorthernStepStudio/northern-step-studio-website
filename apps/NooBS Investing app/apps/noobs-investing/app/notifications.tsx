import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotifications } from '../components/NotificationContext';

export default function Notifications() {
    const router = useRouter();
    const { history, clearHistory } = useNotifications();

    const renderItem = ({ item }: { item: any }) => {
        const getColor = () => {
            switch (item.type) {
                case 'DANGER': return theme.colors.danger;
                case 'SUCCESS': return theme.colors.success;
                case 'WARNING': return theme.colors.accent;
                default: return theme.colors.muted;
            }
        };

        const getIcon = () => {
            if (item.icon) return item.icon;
            switch (item.type) {
                case 'DANGER': return 'alert-decagram';
                case 'SUCCESS': return 'check-decagram';
                case 'WARNING': return 'alert-outline';
                default: return 'information-outline';
            }
        };

        return (
            <View style={{
                backgroundColor: theme.colors.card,
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: 12,
                flexDirection: 'row',
                gap: 12,
                alignItems: 'center'
            }}>
                <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: getColor() + '20',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <MaterialCommunityIcons name={getIcon() as any} size={24} color={getColor()} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: getColor(), fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>{item.title}</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 2 }}>{item.message}</Text>
                </View>
            </View>
        );
    };

    return (
        <Screen safeTop>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.text} />
                    </Pressable>
                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>Terminal Logs</Text>
                </View>
                {history.length > 0 && (
                    <Pressable onPress={clearHistory}>
                        <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '900' }}>CLEAR</Text>
                    </Pressable>
                )}
            </View>

            {history.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 16 }}>
                    <MaterialCommunityIcons name="history" size={64} color={theme.colors.card} />
                    <Text style={{ color: theme.colors.muted, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>No system logs found.</Text>
                    <Text style={{ color: theme.colors.faint, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 }}>Truth Nudges and market events will appear here as they trigger.</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                    scrollEnabled={false}
                />
            )}
        </Screen>
    );
}
