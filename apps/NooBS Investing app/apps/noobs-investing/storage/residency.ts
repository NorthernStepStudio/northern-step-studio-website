import { getPortfolioTotal } from "./transactions";
import { checkProStatus } from "./subscription";
import { theme } from "../constants/theme";

export type ResidencyStage = 'NOOB_GROUND' | 'CORE_RESIDENCY' | 'INCOME_HARVESTING';

export interface ResidencyInfo {
    stage: ResidencyStage;
    name: string;
    icon: any;
    color: string;
    description: string;
    nextStageThreshold?: number;
    progressToNext?: number;
    criteria: string;
}

export async function getUserResidency(): Promise<ResidencyInfo> {
    const totalAssets = await getPortfolioTotal('real');
    const { isPro } = await checkProStatus();

    if (totalAssets >= 50000 && isPro) {
        return {
            stage: 'INCOME_HARVESTING',
            name: 'Income Harvesting',
            icon: 'bank',
            color: theme.colors.success,
            description: 'Elite survivor status. You have mastered the rules of capital preservation. At this stage, your simulated dividends and growth are theoretically enough to sustain a foundational lifestyle. Focus on risk mitigation and tax-efficient harvesting.',
            criteria: 'Real Assets > $50,000 + Elite Path (PRO) Access active.'
        };
    }

    if (totalAssets >= 5000) {
        return {
            stage: 'CORE_RESIDENCY',
            name: 'Core Residency',
            icon: 'shield-star',
            color: theme.colors.accent,
            description: 'You have moved beyond the survival phase. Your assets are now working for you, building a solid baseline for generational wealth. You have avoided the most common "NooB taxes" and are sticking to a disciplined strategy.',
            nextStageThreshold: 50000,
            progressToNext: totalAssets / 50000,
            criteria: 'Real Assets between $5,000 and $50,000.'
        };
    }

    return {
        stage: 'NOOB_GROUND',
        name: 'NooB Ground',
        icon: 'sprout',
        color: theme.colors.danger,
        description: 'The learning phase. At this level, your primary goal is survival and habit-building. Every trade is a lesson, and your biggest enemy is emotional volatility and high-fee products. Build your first $5k to prove your discipline.',
        nextStageThreshold: 5000,
        progressToNext: totalAssets / 5000,
        criteria: 'Real Assets below $5,000.'
    };
}
