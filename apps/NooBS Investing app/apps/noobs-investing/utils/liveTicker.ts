import { useState, useEffect } from 'react';

/**
 * Simulates a real-time price tick using a simplified Brownian motion.
 * @param currentPrice The baseline price
 * @param volatility The scale of movement (0.01 = 1%)
 */
export function getNextTick(currentPrice: number, volatility: number = 0.002) {
    const change = currentPrice * volatility * (Math.random() - 0.5);
    return currentPrice + change;
}

/**
 * Hook to get a "Live" price that updates periodically.
 * Only active while the component is mounted.
 */
export function useLivePrice(basePrice: number, intervalMs: number = 3000) {
    const [price, setPrice] = useState(basePrice);

    useEffect(() => {
        const timer = setInterval(() => {
            setPrice(prev => getNextTick(prev));
        }, intervalMs);

        return () => clearInterval(timer);
    }, [intervalMs]);

    return price;
}

/**
 * Hook to manage a stream of price ticks for a chart.
 */
export function useLiveTickerHistory(basePrice: number, maxTicks: number = 50, intervalMs: number = 2000) {
    const [history, setHistory] = useState<number[]>(() => {
        // Seed with some initial random data around the base price
        return Array.from({ length: 20 }, () => getNextTick(basePrice, 0.05));
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setHistory(prev => {
                const lastPrice = prev[prev.length - 1];
                const nextPrice = getNextTick(lastPrice);
                const nextHistory = [...prev, nextPrice];
                if (nextHistory.length > maxTicks) {
                    return nextHistory.slice(nextHistory.length - maxTicks);
                }
                return nextHistory;
            });
        }, intervalMs);

        return () => clearInterval(timer);
    }, [maxTicks, intervalMs]);

    return history;
}
