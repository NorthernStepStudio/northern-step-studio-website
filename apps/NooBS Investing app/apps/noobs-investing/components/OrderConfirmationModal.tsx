import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, PanResponder, Animated as RNAnimated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { TextInput, ScrollView as RNScrollView } from 'react-native';
import { broadcastTrade } from '../storage/discovery';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import { AutoTranslate } from './AutoTranslate';

export type OrderType = 'market' | 'limit';

interface OrderConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    orderType: OrderType;
    side: 'buy' | 'sell';
    symbol: string;
    assetName: string;
    quantity: number;
    pricePerShare: number;
    limitPrice?: number;
    totalAmount: number;
}

export function OrderConfirmationModal({
    visible,
    onClose,
    onConfirm,
    orderType,
    side,
    symbol,
    assetName,
    quantity,
    pricePerShare,
    limitPrice,
    totalAmount
}: OrderConfirmationModalProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [shouldBroadcast, setShouldBroadcast] = useState(true);
    const [thesis, setThesis] = useState('');
    const slideProgress = useSharedValue(0);
    const SLIDE_THRESHOLD = 200;

    const panResponder = React.useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx > 0 && gestureState.dx <= SLIDE_THRESHOLD) {
                    slideProgress.value = gestureState.dx;
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx >= SLIDE_THRESHOLD * 0.8) {
                    slideProgress.value = withSpring(SLIDE_THRESHOLD);
                    setIsConfirmed(true);

                    // Handle Broadcast
                    if (shouldBroadcast) {
                        broadcastTrade('Anonymous NooB', symbol, thesis || `Adding ${symbol} to my long-term path.`);
                    }

                    setTimeout(() => {
                        onConfirm();
                        setIsConfirmed(false);
                        slideProgress.value = 0;
                        setThesis(''); // Reset thesis
                    }, 300);
                } else {
                    slideProgress.value = withSpring(0);
                }
            }
        }), [onConfirm]);

    const slideButtonStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideProgress.value }]
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: slideProgress.value + 60
    }));

    const isBuy = side === 'buy';
    const actionColor = isBuy ? theme.colors.success : theme.colors.danger;
    const actionText = isBuy ? 'BUY' : 'SELL';

    const estimatedFee = totalAmount * 0.0001; // Simulated tiny fee
    const estimatedTotal = isBuy ? totalAmount + estimatedFee : totalAmount - estimatedFee;

    return (
        <AutoTranslate>
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} color={theme.colors.muted} />
                        </Pressable>
                        <Text style={styles.title}>Confirm Order</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Order Type Badge */}
                    <View style={styles.orderTypeBadge}>
                        <MaterialCommunityIcons
                            name={orderType === 'market' ? 'lightning-bolt' : 'timer-outline'}
                            size={16}
                            color={theme.colors.accent}
                        />
                        <Text style={styles.orderTypeText}>
                            {orderType === 'market' ? 'MARKET ORDER' : 'LIMIT ORDER'}
                        </Text>
                    </View>

                    {/* Order Summary */}
                    <View style={[styles.summaryCard, { borderColor: actionColor + '40' }]}>
                        <Text style={[styles.actionLabel, { color: actionColor }]}>
                            {actionText}
                        </Text>
                        <Text style={styles.symbolText}>{symbol}</Text>
                        <Text style={styles.nameText}>{assetName}</Text>

                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Shares</Text>
                            <Text style={styles.detailValue}>{quantity.toFixed(4)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                                {orderType === 'limit' ? 'Limit Price' : 'Est. Price'}
                            </Text>
                            <Text style={styles.detailValue}>
                                ${(limitPrice || pricePerShare).toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Subtotal</Text>
                            <Text style={styles.detailValue}>${totalAmount.toFixed(2)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Est. Fee</Text>
                            <Text style={styles.detailValue}>${estimatedFee.toFixed(2)}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={[styles.totalValue, { color: actionColor }]}>
                                ${estimatedTotal.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Global Discovery Hook */}
                    <View style={{ marginBottom: 24, padding: 16, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border }}>
                        <Pressable
                            onPress={() => setShouldBroadcast(!shouldBroadcast)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: shouldBroadcast ? 12 : 0 }}
                        >
                            <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: shouldBroadcast ? theme.colors.accent : theme.colors.bg, borderWidth: 1, borderColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                                {shouldBroadcast && <MaterialCommunityIcons name="check" size={16} color={theme.colors.buttonText} />}
                            </View>
                            <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '900' }}>Broadcast to Discovery Feed</Text>
                        </Pressable>

                        {shouldBroadcast && (
                            <View style={{ gap: 8 }}>
                                <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '700' }}>TRADE THESIS (OPTIONAL)</Text>
                                <TextInput
                                    placeholder="Why this trade? (e.g., 'Discounted growth')"
                                    placeholderTextColor={theme.colors.faint}
                                    value={thesis}
                                    onChangeText={setThesis}
                                    maxLength={80}
                                    style={{
                                        backgroundColor: theme.colors.bg,
                                        padding: 12,
                                        borderRadius: 12,
                                        color: theme.colors.text,
                                        fontSize: 13,
                                        fontWeight: '600',
                                        borderWidth: 1,
                                        borderColor: theme.colors.border
                                    }}
                                />
                                <Text style={{ color: theme.colors.faint, fontSize: 10, textAlign: 'right' }}>{thesis.length}/80</Text>
                            </View>
                        )}
                    </View>

                    {/* Swipe to Confirm */}
                    <View style={styles.swipeContainer}>
                        <Animated.View style={[styles.swipeProgress, { backgroundColor: actionColor + '30' }, progressStyle]} />
                        <Animated.View
                            {...panResponder.panHandlers}
                            style={[styles.swipeButton, { backgroundColor: actionColor }, slideButtonStyle]}
                        >
                            <MaterialCommunityIcons
                                name={isConfirmed ? 'check' : 'chevron-right'}
                                size={28}
                                color={theme.colors.bg}
                            />
                        </Animated.View>
                        <Text style={styles.swipeText}>
                            {isConfirmed ? 'Order Placed!' : `Swipe to ${actionText}`}
                        </Text>
                    </View>

                    {/* Cancel Button */}
                    <Pressable onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
        </AutoTranslate>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.bg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '900',
    },
    orderTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.accent + '20',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginBottom: 20,
    },
    orderTypeText: {
        color: theme.colors.accent,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    summaryCard: {
        backgroundColor: theme.colors.bg,
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        marginBottom: 16,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 4,
    },
    symbolText: {
        color: theme.colors.text,
        fontSize: 32,
        fontWeight: '900',
    },
    nameText: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: '600',
    },
    detailValue: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    totalLabel: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '900',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.accent + '10',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    infoText: {
        color: theme.colors.muted,
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
    swipeContainer: {
        height: 60,
        backgroundColor: theme.colors.bg,
        borderRadius: 30,
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 16,
    },
    swipeProgress: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 30,
    },
    swipeButton: {
        position: 'absolute',
        left: 4,
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    swipeText: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        marginLeft: 60,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelText: {
        color: theme.colors.muted,
        fontSize: 16,
        fontWeight: '600',
    },
});
