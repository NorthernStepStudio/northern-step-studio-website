
import { GameState, TimeScale } from './types';
import { applyMarketShock } from './market';

const BASE_MS_PER_MONTH = 100000; // 1 Month = 100s at default scale
const TIME_SCALE_MULTIPLIER: Record<TimeScale, number> = {
    FOUR_DAYS: 1.5, // ~150s per month
    ONE_WEEK: 1, // 100s per month
    ONE_MONTH: 0.75, // ~75s per month
};

function getMsPerMonth(timeScale: TimeScale) {
    return BASE_MS_PER_MONTH * (TIME_SCALE_MULTIPLIER[timeScale] ?? 1);
}

export type OfflineResult = {
    newState: GameState;
    summary: string[];
    monthsPassed: number;
};

export function simulateOfflineTime(state: GameState): OfflineResult {
    const now = Date.now();
    const deltaMs = now - state.lastSessionTime;
    const msPerMonth = getMsPerMonth(state.timeScale ?? "ONE_WEEK");
    const monthsPassed = Math.floor(deltaMs / msPerMonth);
    const hoursOffline = Math.floor(deltaMs / (1000 * 3600));

    if (monthsPassed <= 0) {
        return { newState: { ...state, lastSessionTime: now }, summary: [], monthsPassed: 0 };
    }

    let currentCash = state.cash;
    let currentPrices = state.marketPrices;
    const summary: string[] = [];

    // Cap simulation at 12 months to avoid insane skips
    const simulatedMonths = Math.min(monthsPassed, 12);

    summary.push(`SYSTEM STATUS: Resume after ${hoursOffline}h offline.`);

    for (let i = 0; i < simulatedMonths; i++) {
        // 1. Job Income
        if (state.job) {
            const monthlyIncome = state.job.hourlyWage * 160;
            currentCash += monthlyIncome;
        }

        // 2. Minor Market Drift (+/- 0.5% monthly) - NO DISASTERS
        const driftPct = (Math.random() * 1.0 - 0.5);
        currentPrices = applyMarketShock(currentPrices, driftPct);
    }

    summary.push(`- INCOME SETTLED: ${simulatedMonths} simulation months.`);
    summary.push(`- MARKET DRIFT: Performance stabilized.`);

    const currentInvested = Object.values(state.holdings).reduce((sum, holding) => {
        const price = currentPrices[holding.symbol] ?? 0;
        return sum + holding.shares * price;
    }, 0);
    const totalWealth = currentInvested + currentCash;
    const nextHistory = [...state.history];
    // Add one anchor point for the gap
    nextHistory.push(totalWealth);

    const newState: GameState = {
        ...state,
        cash: currentCash,
        netWorth: Math.round(currentInvested + currentCash),
        marketPrices: currentPrices,
        history: nextHistory.slice(-50), // Keep history manageable
        lastSessionTime: now,
        freedomNumber: totalWealth / state.targetNetWorth,
        month: state.month + simulatedMonths,
        openOrders: state.openOrders ?? [],
        marketClockMinutes: state.marketClockMinutes ?? 9 * 60 + 30,
        marketDay: state.marketDay ?? 1,
    };

    return { newState, summary, monthsPassed: simulatedMonths };
}
