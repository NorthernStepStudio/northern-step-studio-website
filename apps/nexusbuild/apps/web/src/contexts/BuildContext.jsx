import React, { createContext, useState, useContext, useEffect } from 'react';
import { buildsAPI } from '../services/api';

const BuildContext = createContext();

export const useBuild = () => {
    const context = useContext(BuildContext);
    if (!context) {
        throw new Error('useBuild must be used within BuildProvider');
    }
    return context;
};

export const BuildProvider = ({ children }) => {
    const [currentBuild, setCurrentBuild] = useState({
        name: 'Pick your Parts',
        parts: {
            cpu: null,
            gpu: null,
            motherboard: null,
            ram: null,
            storage: null,
            psu: null,
            case: null,
            cooler: null,
            fan: null,
            monitor: null,
            keyboard: null,
            mouse: null,
            os: null,
            accessory: null,
        },
        budget: { min: 0, max: 2000 }, // Default budget
    });
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load current build from storage on mount
    useEffect(() => {
        loadCurrentBuild();
    }, []);

    const loadCurrentBuild = () => {
        try {
            const buildData = localStorage.getItem('currentBuild');
            if (buildData) {
                setCurrentBuild(JSON.parse(buildData));
            }
        } catch (err) {
            console.error('Error loading build:', err);
        }
    };

    const saveToStorage = (build) => {
        localStorage.setItem('currentBuild', JSON.stringify(build));
    };

    const addPart = (category, part) => {
        const updatedBuild = {
            ...currentBuild,
            parts: {
                ...currentBuild.parts,
                [category]: part,
            },
        };
        setCurrentBuild(updatedBuild);
        saveToStorage(updatedBuild);
    };

    const removePart = (category) => {
        const updatedBuild = {
            ...currentBuild,
            parts: {
                ...currentBuild.parts,
                [category]: null,
            },
        };
        setCurrentBuild(updatedBuild);
        saveToStorage(updatedBuild);
    };

    const clearBuild = () => {
        const emptyBuild = {
            name: 'Pick your Parts',
            parts: {
                cpu: null,
                gpu: null,
                motherboard: null,
                ram: null,
                storage: null,
                psu: null,
                case: null,
                cooler: null,
                fan: null,
                monitor: null,
                keyboard: null,
                mouse: null,
                os: null,
                accessory: null,
            },
            budget: { min: 0, max: 2000 },
        };
        setCurrentBuild(emptyBuild);
        saveToStorage(emptyBuild);
    };

    const saveBuild = async () => {
        try {
            setLoading(true);
            setError(null);

            const buildPayload = {
                name: currentBuild.name,
                description: `Budget: $${currentBuild.budget?.min || 0}-$${currentBuild.budget?.max || 0}`,
                parts: currentBuild.parts,
                totalPrice: getTotalPrice(),
                is_public: true,
            };

            const data = await buildsAPI.create(buildPayload);
            if (data.build) {
                setSavedBuilds((prev) => [data.build, ...prev]);
            }
            return { success: true, build: data.build };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save build';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const loadUserBuilds = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await buildsAPI.getUserBuilds();
            setSavedBuilds(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load builds');
        } finally {
            setLoading(false);
        }
    };

    const getTotalPrice = () => {
        return Object.values(currentBuild.parts)
            .filter(part => part !== null)
            .reduce((total, part) => total + (part.price || 0), 0);
    };

    const getPartCount = () => {
        return Object.values(currentBuild.parts).filter(part => part !== null).length;
    };

    const value = {
        currentBuild,
        savedBuilds,
        loading,
        error,
        addPart,
        removePart,
        clearBuild,
        saveBuild,
        loadUserBuilds,
        getTotalPrice,
        getPartCount,
        setBuildName: (name) => {
            const updated = { ...currentBuild, name };
            setCurrentBuild(updated);
            saveToStorage(updated);
        },
        setBudget: (min, max) => {
            const updated = { ...currentBuild, budget: { min, max } };
            setCurrentBuild(updated);
            saveToStorage(updated);
        }
    };

    return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
};
