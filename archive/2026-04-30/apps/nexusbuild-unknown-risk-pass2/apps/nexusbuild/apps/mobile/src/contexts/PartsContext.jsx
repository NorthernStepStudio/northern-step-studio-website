import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { partsAPI } from '../services/api';
import logger from '../core/logger';

const PartsContext = createContext();

export const useParts = () => {
    const context = useContext(PartsContext);
    if (!context) {
        throw new Error('useParts must be used within PartsProvider');
    }
    return context;
};

export const PartsProvider = ({ children }) => {
    const [partsIndex, setPartsIndex] = useState({});
    const [partsByCategory, setPartsByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total: 0, categories: {} });

    const loadInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            logger.log('[PartsContext] Loading canonical parts inventory...');

            const response = await partsAPI.getInventory();
            const parts = response?.parts || [];

            const index = {};
            const categorized = {};
            const catStats = {};

            parts.forEach(part => {
                const id = String(part.id);
                index[id] = part;

                const cat = part.category?.toLowerCase() || 'other';
                if (!categorized[cat]) categorized[cat] = [];
                categorized[cat].push(part);
                catStats[cat] = (catStats[cat] || 0) + 1;
            });

            setPartsIndex(index);
            setPartsByCategory(categorized);
            setStats({ total: parts.length, categories: catStats });
            setLoading(false);
            
            logger.log(`[PartsContext] Successfully loaded ${parts.length} parts from production DB.`);
        } catch (err) {
            logger.error('[PartsContext] Inventory load failed:', err);
            setError(err.message || 'Failed to load parts database');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    const getPartById = (id) => {
        if (!id) return null;
        return partsIndex[String(id)] || null;
    };

    const getPartsForCategory = (category) => {
        if (!category) return [];
        return partsByCategory[category.toLowerCase()] || [];
    };

    const value = {
        partsIndex,
        partsByCategory,
        loading,
        error,
        stats,
        refresh: loadInventory,
        getPartById,
        getPartsForCategory
    };

    return (
        <PartsContext.Provider value={value}>
            {children}
        </PartsContext.Provider>
    );
};
