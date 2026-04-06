import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '../components/Screen';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getPendingOrders, cancelOrder, PendingOrder } from '../storage/pendingOrders';

export default function Orders() {
    const router = useRouter();
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'history'>('pending');

    const loadOrders = async () => {
        const allOrders = await getPendingOrders();
        setOrders(allOrders);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const handleCancel = async (orderId: string) => {
        await cancelOrder(orderId);
        await loadOrders();
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'pending') return o.status === 'pending';
        return o.status === 'filled' || o.status === 'cancelled';
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Screen safeTop={true}>
            <View style={{ marginBottom: 24 }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                    <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.muted} />
                    <Text style={{ color: theme.colors.muted, fontWeight: '700' }}>Back</Text>
                </Pressable>
                <Text style={{ color: theme.colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1 }}>Orders</Text>
                <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '800', marginTop: -4 }}>
                    Track your limit orders.
                </Text>
            </View>

            {/* Filter Tabs */}
            <View style={{
                flexDirection: 'row',
                marginBottom: 24,
                backgroundColor: theme.colors.card,
                borderRadius: 16,
                padding: 4
            }}>
                <Pressable
                    onPress={() => setFilter('pending')}
                    style={{
                        flex: 1,
                        paddingVertical: 12,
                        alignItems: 'center',
                        borderRadius: 12,
                        backgroundColor: filter === 'pending' ? theme.colors.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        color: filter === 'pending' ? theme.colors.bg : theme.colors.muted,
                        fontWeight: '900',
                        fontSize: 13
                    }}>
                        PENDING
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setFilter('history')}
                    style={{
                        flex: 1,
                        paddingVertical: 12,
                        alignItems: 'center',
                        borderRadius: 12,
                        backgroundColor: filter === 'history' ? theme.colors.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        color: filter === 'history' ? theme.colors.bg : theme.colors.muted,
                        fontWeight: '900',
                        fontSize: 13
                    }}>
                        HISTORY
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />
                }
                contentContainerStyle={{ gap: 16 }}
            >
                {filteredOrders.length === 0 ? (
                    <View style={{
                        padding: 40,
                        alignItems: 'center',
                        backgroundColor: theme.colors.card,
                        borderRadius: 24
                    }}>
                        <MaterialCommunityIcons
                            name={filter === 'pending' ? 'timer-sand-empty' : 'history'}
                            size={48}
                            color={theme.colors.faint}
                        />
                        <Text style={{
                            color: theme.colors.muted,
                            fontSize: 16,
                            fontWeight: '700',
                            marginTop: 16,
                            textAlign: 'center'
                        }}>
                            {filter === 'pending'
                                ? "No pending orders.\nLimit orders you place will appear here."
                                : "No order history yet.\nCompleted orders will show up here."}
                        </Text>
                    </View>
                ) : (
                    filteredOrders.map(order => (
                        <View
                            key={order.id}
                            style={{
                                padding: 20,
                                backgroundColor: theme.colors.card,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: order.status === 'pending'
                                    ? theme.colors.accent + '40'
                                    : order.status === 'filled'
                                        ? theme.colors.success + '40'
                                        : theme.colors.border
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={{
                                            color: order.side === 'buy' ? theme.colors.success : theme.colors.danger,
                                            fontWeight: '900',
                                            fontSize: 12,
                                            textTransform: 'uppercase'
                                        }}>
                                            {order.side}
                                        </Text>
                                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900' }}>
                                            {order.symbol}
                                        </Text>
                                    </View>
                                    <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '600' }}>
                                        {order.assetName}
                                    </Text>
                                </View>

                                {/* Status Badge */}
                                <View style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    borderRadius: 12,
                                    backgroundColor: order.status === 'pending'
                                        ? theme.colors.accent + '20'
                                        : order.status === 'filled'
                                            ? theme.colors.success + '20'
                                            : theme.colors.muted + '20'
                                }}>
                                    <Text style={{
                                        fontSize: 11,
                                        fontWeight: '900',
                                        textTransform: 'uppercase',
                                        color: order.status === 'pending'
                                            ? theme.colors.accent
                                            : order.status === 'filled'
                                                ? theme.colors.success
                                                : theme.colors.muted
                                    }}>
                                        {order.status}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ marginTop: 16, gap: 8 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Limit Price</Text>
                                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>
                                        ${order.limitPrice.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Quantity</Text>
                                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>
                                        {order.quantity.toFixed(4)} shares
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Total</Text>
                                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>
                                        ${order.totalAmount.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Created</Text>
                                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>
                                        {formatDate(order.createdAt)}
                                    </Text>
                                </View>
                                {order.filledAt && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Filled</Text>
                                        <Text style={{ color: theme.colors.success, fontSize: 13, fontWeight: '700' }}>
                                            @ ${order.filledPrice?.toFixed(2)} on {formatDate(order.filledAt)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {order.status === 'pending' && (
                                <Pressable
                                    onPress={() => handleCancel(order.id)}
                                    style={({ pressed }) => ({
                                        marginTop: 16,
                                        padding: 12,
                                        borderRadius: 12,
                                        backgroundColor: theme.colors.danger + '15',
                                        alignItems: 'center',
                                        opacity: pressed ? 0.8 : 1
                                    })}
                                >
                                    <Text style={{ color: theme.colors.danger, fontWeight: '800', fontSize: 14 }}>
                                        Cancel Order
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={{ height: 40 }} />
        </Screen>
    );
}
