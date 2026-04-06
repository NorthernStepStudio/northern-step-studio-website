/**
 * Tutorial Context & Hook
 * Manages tutorial state across the app.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TutorialStep } from '../components/TutorialOverlay';

const TUTORIAL_COMPLETED_KEY = '@noobs_tutorial_completed';

interface TutorialContextType {
    showTutorial: boolean;
    currentStep: number;
    steps: TutorialStep[];
    startTutorial: (tutorialId: string, steps: TutorialStep[]) => void;
    nextStep: () => void;
    skipTutorial: () => void;
    completeTutorial: () => void;
    hasSeen: (tutorialId: string) => Promise<boolean>;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

// Pre-defined tutorial steps for different flows
export const PRO_TRADING_TUTORIAL: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Pro Trading!',
        description: "You've unlocked the Pro Trading experience. Let me show you how to use these powerful features like a real investor.",
        arrowDirection: 'none',
        action: 'tap',
    },
    {
        id: 'mode_toggle',
        title: 'Switch Between Modes',
        description: 'Toggle between BASIC and PRO mode here. PRO mode unlocks live charts, limit orders, and advanced analytics.',
        arrowDirection: 'down',
        action: 'tap',
        // Position will be set dynamically
    },
    {
        id: 'select_asset',
        title: 'Choose Your Asset',
        description: 'Browse through curated sectors and tap any asset to see its details. In PRO mode, you\'ll see live price charts!',
        arrowDirection: 'down',
        action: 'tap',
    },
    {
        id: 'live_chart',
        title: 'Live Price Charts',
        description: 'Watch prices move in real-time. Use the time range buttons (1D, 1W, 1M, etc.) to see different historical views.',
        arrowDirection: 'up',
        action: 'tap',
    },
    {
        id: 'invest_button',
        title: 'Ready to Invest',
        description: 'When you\'ve done your research, tap this button to start your order. Remember: boring investments beat exciting ones!',
        arrowDirection: 'up',
        action: 'tap',
    },
];

export const ORDER_FLOW_TUTORIAL: TutorialStep[] = [
    {
        id: 'order_type',
        title: 'Choose Order Type',
        description: 'MARKET executes immediately at current price. LIMIT lets you set a target price and wait for it.',
        arrowDirection: 'down',
        action: 'tap',
    },
    {
        id: 'limit_price',
        title: 'Set Your Limit Price',
        description: 'If you chose LIMIT, enter the price you\'re willing to pay. Your order will only execute if the price reaches this level.',
        arrowDirection: 'down',
        action: 'type',
    },
    {
        id: 'amount',
        title: 'Enter Amount',
        description: 'How much do you want to invest? This is in dollars. The app will calculate how many shares you can buy.',
        arrowDirection: 'up',
        action: 'type',
    },
    {
        id: 'confirmation',
        title: 'Swipe to Confirm',
        description: 'Review your order details, then swipe the button to confirm. This is how real brokerages work!',
        arrowDirection: 'up',
        action: 'swipe',
    },
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TutorialStep[]>([]);
    const [currentTutorialId, setCurrentTutorialId] = useState<string | null>(null);

    const startTutorial = useCallback(async (tutorialId: string, tutorialSteps: TutorialStep[]) => {
        const seen = await hasSeen(tutorialId);
        if (!seen) {
            setCurrentTutorialId(tutorialId);
            setSteps(tutorialSteps);
            setCurrentStep(0);
            setShowTutorial(true);
        }
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeTutorial();
        }
    }, [currentStep, steps.length]);

    const skipTutorial = useCallback(async () => {
        if (currentTutorialId) {
            await markAsSeen(currentTutorialId);
        }
        setShowTutorial(false);
        setCurrentStep(0);
        setSteps([]);
    }, [currentTutorialId]);

    const completeTutorial = useCallback(async () => {
        if (currentTutorialId) {
            await markAsSeen(currentTutorialId);
        }
        setShowTutorial(false);
        setCurrentStep(0);
        setSteps([]);
    }, [currentTutorialId]);

    const hasSeen = async (tutorialId: string): Promise<boolean> => {
        try {
            const data = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
            if (data) {
                const completed = JSON.parse(data);
                return completed.includes(tutorialId);
            }
        } catch (e) {
            console.error('Error checking tutorial status:', e);
        }
        return false;
    };

    const markAsSeen = async (tutorialId: string): Promise<void> => {
        try {
            const data = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
            const completed = data ? JSON.parse(data) : [];
            if (!completed.includes(tutorialId)) {
                completed.push(tutorialId);
                await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, JSON.stringify(completed));
            }
        } catch (e) {
            console.error('Error marking tutorial as seen:', e);
        }
    };

    return (
        <TutorialContext.Provider value={{
            showTutorial,
            currentStep,
            steps,
            startTutorial,
            nextStep,
            skipTutorial,
            completeTutorial,
            hasSeen,
        }}>
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within TutorialProvider');
    }
    return context;
}

/**
 * Reset all tutorials (for testing)
 */
export async function resetAllTutorials(): Promise<void> {
    await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
}
