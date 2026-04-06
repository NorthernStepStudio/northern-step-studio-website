import { all, run } from './db';

export type MedalId = 'DIAMOND_HANDS' | 'MASTER_STUDENT' | 'FEE_FIGHTER' | 'PHILOSOPHER' | 'EARLY_ADOPTER' | 'STRATEGIST' | 'WEALTH_STRATEGIST' | 'BATTLE_TESTED';

export interface Medal {
    id: MedalId;
    name: string;
    description: string;
    icon: string;
    unlocked?: boolean;
    unlocked_at?: string;
}

export const MEDALS: Medal[] = [
    {
        id: 'DIAMOND_HANDS',
        name: 'Diamond Hands',
        description: 'Held through a major market crash without panic selling. You have nerves of steel.',
        icon: '💎'
    },
    {
        id: 'MASTER_STUDENT',
        name: 'Master Student',
        description: 'Completed every single lesson in the NooBS Training. Knowledge is your edge.',
        icon: '📚'
    },
    {
        id: 'FEE_FIGHTER',
        name: 'Friction Fighter',
        description: 'Maintained a portfolio with ultra-low expense ratios. The banks hate you.',
        icon: '🛡️'
    },
    {
        id: 'PHILOSOPHER',
        name: 'NooBS Philosopher',
        description: 'Read the entire NooBS Manifesto. You understand that investing is 99% psychology.',
        icon: '🧠'
    },
    {
        id: 'EARLY_ADOPTER',
        name: 'First Steps',
        description: 'Added your first transaction. The journey of a thousand lambos begins with one dollar.',
        icon: '🚀'
    },
    {
        id: 'STRATEGIST',
        name: 'The Strategist',
        description: 'Committed to a long-term investment plan. You have a Map, while others are just wandering.',
        icon: '🗺️'
    },
    {
        id: 'WEALTH_STRATEGIST',
        name: 'Wealth Strategist',
        description: 'Achieved an AI Health Score of 90+. Your portfolio is a masterclass in discipline.',
        icon: '👑'
    },
    {
        id: 'BATTLE_TESTED',
        name: 'Battle Tested',
        description: 'Survived a simulated market disaster. You have looked into the abyss and didn\'t blink.',
        icon: '🛡️'
    }
];

export async function listUnlockedMedals(): Promise<string[]> {
    const rows = await all<{ id: string }>('SELECT id FROM achievements');
    return rows.map(r => r.id);
}

type MedalListener = (medal: Medal) => void;
const listeners: MedalListener[] = [];

export function addMedalListener(l: MedalListener) {
    listeners.push(l);
    return () => {
        const idx = listeners.indexOf(l);
        if (idx > -1) listeners.splice(idx, 1);
    };
}

export async function unlockMedal(id: MedalId): Promise<void> {
    const unlocked = await listUnlockedMedals();
    if (unlocked.includes(id)) return;

    await run('INSERT INTO achievements (id, unlocked_at) VALUES (?, ?)', [id, new Date().toISOString()]);

    // Notify listeners
    const medal = MEDALS.find(m => m.id === id);
    if (medal) {
        listeners.forEach(l => l(medal));
    }
}

export async function getMedalsWithStatus(): Promise<Medal[]> {
    await refreshAchievements(); // Auto-refresh when viewing
    const unlocked = await listUnlockedMedals();
    const achievements = await all<{ id: string, unlocked_at: string }>('SELECT * FROM achievements');

    return MEDALS.map(m => {
        const achievement = achievements.find(a => a.id === m.id);
        return {
            ...m,
            unlocked: !!achievement,
            unlocked_at: achievement?.unlocked_at
        };
    });
}

import { db } from './db';

export async function refreshAchievements(): Promise<void> {
    // 1. Master Student (Self-contained query)
    const totalLessons = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM lessons');
    const doneLessons = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM lessons WHERE completed = 1');
    if (totalLessons && doneLessons && totalLessons.count > 0 && totalLessons.count === doneLessons.count) {
        await unlockMedal('MASTER_STUDENT');
    }
}

// Specialized check for Fee Fighter that takes holdings as input
export async function checkFeeFighter(allHoldings: any[], assetsData: any): Promise<void> {
    if (allHoldings.length >= 3) {
        let totalVal = 0;
        let weightedExpense = 0;

        allHoldings.forEach(h => {
            const assetKey = h.asset_name.split(' ')[0];
            const meta = assetsData[assetKey];
            if (meta) {
                totalVal += h.amount;
                weightedExpense += h.amount * (meta.expenseRatio / 100);
            }
        });

        if (totalVal > 0 && (weightedExpense / totalVal) < 0.001) { // < 0.1% avg
            await unlockMedal('FEE_FIGHTER');
        }
    }
}
