/**
 * Pending Orders Storage
 * Handles limit orders that haven't been filled yet.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AssetType, TxKind } from './types';

export interface PendingOrder {
    id: string;
    kind: TxKind;
    symbol: string;
    assetName: string;
    assetType: AssetType;
    side: 'buy' | 'sell';
    quantity: number;
    limitPrice: number;
    totalAmount: number;
    createdAt: string;
    status: 'pending' | 'filled' | 'cancelled' | 'expired';
    filledAt?: string;
    filledPrice?: number;
}

const PENDING_ORDERS_KEY = '@noobs_pending_orders';

/**
 * Get all pending orders
 */
export async function getPendingOrders(): Promise<PendingOrder[]> {
    try {
        const data = await AsyncStorage.getItem(PENDING_ORDERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to get pending orders:', e);
        return [];
    }
}

/**
 * Add a new pending order
 */
export async function addPendingOrder(order: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>): Promise<PendingOrder> {
    const orders = await getPendingOrders();

    const newOrder: PendingOrder = {
        ...order,
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };

    orders.push(newOrder);
    await AsyncStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));

    return newOrder;
}

/**
 * Cancel a pending order
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
    const orders = await getPendingOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) return false;

    orders[orderIndex].status = 'cancelled';
    await AsyncStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));

    return true;
}

/**
 * Fill an order (simulates execution)
 */
export async function fillOrder(orderId: string, filledPrice: number): Promise<PendingOrder | null> {
    const orders = await getPendingOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) return null;

    orders[orderIndex].status = 'filled';
    orders[orderIndex].filledAt = new Date().toISOString();
    orders[orderIndex].filledPrice = filledPrice;

    await AsyncStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));

    return orders[orderIndex];
}

/**
 * Check pending orders against current prices
 * Returns orders that should be filled
 */
export function checkOrdersForFill(
    orders: PendingOrder[],
    currentPrices: Record<string, number>
): PendingOrder[] {
    return orders.filter(order => {
        if (order.status !== 'pending') return false;

        const currentPrice = currentPrices[order.symbol];
        if (!currentPrice) return false;

        // Buy order fills if price drops to or below limit
        if (order.side === 'buy' && currentPrice <= order.limitPrice) {
            return true;
        }

        // Sell order fills if price rises to or above limit
        if (order.side === 'sell' && currentPrice >= order.limitPrice) {
            return true;
        }

        return false;
    });
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: PendingOrder['status']): Promise<PendingOrder[]> {
    const orders = await getPendingOrders();
    return orders.filter(o => o.status === status);
}

/**
 * Clear all orders (for reset)
 */
export async function clearAllOrders(): Promise<void> {
    await AsyncStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify([]));
}

/**
 * Get order history (filled or cancelled)
 */
export async function getOrderHistory(): Promise<PendingOrder[]> {
    const orders = await getPendingOrders();
    return orders
        .filter(o => o.status === 'filled' || o.status === 'cancelled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
