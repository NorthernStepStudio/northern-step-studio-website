import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nexusbuild_tracked_parts';
const ALERTS_KEY = '@nexusbuild_price_alerts';

const PriceTrackingContext = createContext(null);

export const usePriceTracking = () => {
    const context = useContext(PriceTrackingContext);
    if (!context) {
        throw new Error('usePriceTracking must be used within PriceTrackingProvider');
    }
    return context;
};

export const PriceTrackingProvider = ({ children }) => {
    const [trackedParts, setTrackedParts] = useState([]);
    const [priceAlerts, setPriceAlerts] = useState([]);
    const [priceDrops, setPriceDrops] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load tracked parts and alerts from storage on mount
    useEffect(() => {
        loadData();
    }, []);

    // Save to storage whenever data changes
    useEffect(() => {
        if (isLoaded) {
            saveData();
        }
    }, [trackedParts, priceAlerts, isLoaded]);

    const loadData = async () => {
        try {
            const [storedParts, storedAlerts] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY),
                AsyncStorage.getItem(ALERTS_KEY),
            ]);
            if (storedParts) {
                setTrackedParts(JSON.parse(storedParts));
            }
            if (storedAlerts) {
                setPriceAlerts(JSON.parse(storedAlerts));
            }
        } catch (error) {
            console.error('Error loading price tracking data:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trackedParts)),
                AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(priceAlerts)),
            ]);
        } catch (error) {
            console.error('Error saving price tracking data:', error);
        }
    };

    const addTrackedPart = (part, targetPrice = null) => {
        if (!isTracked(part.id)) {
            const trackedPart = {
                id: part.id,
                name: part.name,
                currentPrice: part.price,
                originalPrice: part.price,
                category: part.category,
                image_url: part.image_url,
                addedAt: new Date().toISOString(),
                targetPrice: targetPrice,
                priceHistory: [
                    { price: part.price, date: new Date().toISOString() }
                ],
            };
            setTrackedParts(prev => [...prev, trackedPart]);
            return true;
        }
        return false;
    };

    const removeTrackedPart = (partId) => {
        setTrackedParts(prev => prev.filter(p => p.id !== partId));
        // Also remove any alerts for this part
        setPriceAlerts(prev => prev.filter(a => a.partId !== partId));
    };

    const toggleTracking = (part) => {
        if (isTracked(part.id)) {
            removeTrackedPart(part.id);
            return false;
        } else {
            addTrackedPart(part);
            return true;
        }
    };

    const isTracked = (partId) => {
        return trackedParts.some(p => p.id === partId);
    };

    // Set a target price alert for a tracked part
    const setTargetPrice = (partId, targetPrice) => {
        setTrackedParts(prev => prev.map(p =>
            p.id === partId ? { ...p, targetPrice } : p
        ));
    };

    // Simulate price update (for demo purposes - in real app would fetch from API)
    const simulatePriceUpdate = useCallback(() => {
        const newDrops = [];

        setTrackedParts(prev => prev.map(part => {
            // Randomly simulate price changes (-10% to +5%)
            const changePercent = (Math.random() * 15) - 10;
            const newPrice = Math.round(part.currentPrice * (1 + changePercent / 100) * 100) / 100;
            const priceChange = newPrice - part.currentPrice;

            // Check if price dropped below target
            if (part.targetPrice && newPrice <= part.targetPrice && part.currentPrice > part.targetPrice) {
                newDrops.push({
                    id: part.id,
                    name: part.name,
                    oldPrice: part.currentPrice,
                    newPrice: newPrice,
                    targetPrice: part.targetPrice,
                    alertedAt: new Date().toISOString(),
                });
            }

            // Also detect any significant price drop (> 5%)
            if (priceChange < 0 && Math.abs(changePercent) > 5) {
                newDrops.push({
                    id: part.id,
                    name: part.name,
                    oldPrice: part.currentPrice,
                    newPrice: newPrice,
                    percentDrop: Math.abs(changePercent).toFixed(1),
                    alertedAt: new Date().toISOString(),
                });
            }

            return {
                ...part,
                currentPrice: newPrice,
                priceHistory: [
                    ...part.priceHistory,
                    { price: newPrice, date: new Date().toISOString() }
                ].slice(-30), // Keep last 30 price points
            };
        }));

        if (newDrops.length > 0) {
            setPriceDrops(prev => [...newDrops, ...prev].slice(0, 20));
        }
    }, []);

    // Get parts with active price alerts (below target)
    const getAlertedParts = () => {
        return trackedParts.filter(p =>
            p.targetPrice && p.currentPrice <= p.targetPrice
        );
    };

    // Get recent price drops
    const getPriceDrops = () => priceDrops;

    // Clear price drop notifications
    const clearPriceDrops = () => setPriceDrops([]);

    // Get price change percentage for a part
    const getPriceChange = (partId) => {
        const part = trackedParts.find(p => p.id === partId);
        if (!part) return 0;
        const change = ((part.currentPrice - part.originalPrice) / part.originalPrice) * 100;
        return Math.round(change * 10) / 10;
    };

    // Get savings if buying at current price vs original
    const getTotalSavings = () => {
        return trackedParts.reduce((total, part) => {
            const savings = part.originalPrice - part.currentPrice;
            return total + (savings > 0 ? savings : 0);
        }, 0);
    };

    const value = {
        trackedParts,
        priceDrops,
        addTrackedPart,
        removeTrackedPart,
        toggleTracking,
        isTracked,
        setTargetPrice,
        simulatePriceUpdate,
        getAlertedParts,
        getPriceDrops,
        clearPriceDrops,
        getPriceChange,
        getTotalSavings,
        getTrackedCount: () => trackedParts.length,
        isLoaded,
    };

    return (
        <PriceTrackingContext.Provider value={value}>
            {children}
        </PriceTrackingContext.Provider>
    );
};

export default PriceTrackingContext;

