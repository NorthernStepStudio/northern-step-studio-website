import React, { createContext, useContext, useEffect, useState } from 'react';
import { addMedalListener, Medal } from '../storage/achievements';
import { MedalUnlockModal } from './MedalUnlockModal';

interface MedalContextType {
    // We don't really need to expose anything, but we could expose the current medal
}

const MedalContext = createContext<MedalContextType | undefined>(undefined);

export function MedalProvider({ children }: { children: React.ReactNode }) {
    const [currentMedal, setCurrentMedal] = useState<Medal | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const removeListener = addMedalListener((medal) => {
            setCurrentMedal(medal);
            setVisible(true);
        });
        return removeListener;
    }, []);

    const handleClose = () => {
        setVisible(false);
        // Delay clearing medal to allow fade out
        setTimeout(() => setCurrentMedal(null), 1000);
    };

    return (
        <MedalContext.Provider value={{}}>
            {children}
            <MedalUnlockModal
                visible={visible}
                medal={currentMedal}
                onClose={handleClose}
            />
        </MedalContext.Provider>
    );
}

export function useMedal() {
    const context = useContext(MedalContext);
    if (context === undefined) {
        throw new Error('useMedal must be used within a MedalProvider');
    }
    return context;
}
