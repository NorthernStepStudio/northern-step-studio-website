import { APPROVED_ASSETS } from '../storage/assets';
import { AssetSector } from '../storage/types';

export interface HealthReport {
    score: number;
    diversityScore: number;
    concentrationScore: number;
    efficiencyScore: number;
    verdict: string;
    recommendations: string[];
    sectorExposure: { sector: AssetSector; percentage: number }[];
    maxHoldingPercentage: number;
    avgMer: number;
}

export function calculateHealthReport(holdings: { asset_name: string; amount: number }[]): HealthReport {
    const totalValue = holdings.reduce((sum, h) => sum + h.amount, 0);
    if (totalValue === 0) {
        return {
            score: 0,
            diversityScore: 0,
            concentrationScore: 0,
            efficiencyScore: 0,
            verdict: "Ghost Town. You haven't invested anything yet. Start stacking.",
            recommendations: ["Buy your first asset."],
            sectorExposure: [],
            maxHoldingPercentage: 0,
            avgMer: 0
        };
    }

    const sectorWeights: Record<string, number> = {};
    let totalMerWeighted = 0;
    let maxHoldingPct = 0;

    holdings.forEach(h => {
        const asset = APPROVED_ASSETS[h.asset_name];
        if (!asset) return;

        const weight = h.amount / totalValue;
        const sector = asset.sector;

        sectorWeights[sector] = (sectorWeights[sector] || 0) + weight;
        totalMerWeighted += asset.expenseRatio * weight;

        if (weight > maxHoldingPct) maxHoldingPct = weight;
    });

    // 1. Diversity (40 pts)
    const distinctSectors = Object.keys(sectorWeights).filter(s => s !== 'Cash' && sectorWeights[s] > 0.01);
    let diversityScore = 0;
    if (distinctSectors.length >= 4) diversityScore = 40;
    else if (distinctSectors.length === 3) diversityScore = 30;
    else if (distinctSectors.length === 2) diversityScore = 15;

    // 2. Concentration (30 pts)
    let concentrationScore = 0;
    const maxPct = maxHoldingPct;
    if (maxPct < 0.15) concentrationScore = 30;
    else if (maxPct < 0.25) concentrationScore = 20;
    else if (maxPct < 0.50) concentrationScore = 10;

    // 3. Efficiency (30 pts)
    const avgMer = totalMerWeighted;
    let efficiencyScore = 0;
    if (avgMer < 0.0020) efficiencyScore = 30; // < 0.20%
    else if (avgMer < 0.0050) efficiencyScore = 15; // < 0.50%

    const totalScore = diversityScore + concentrationScore + efficiencyScore;

    const recommendations: string[] = [];
    if (distinctSectors.length < 3) recommendations.push("Add more flavors. You're too focused on one part of the economy.");
    if (maxPct > 0.25) recommendations.push(`Your biggest bet is ${Math.round(maxPct * 100)}% of your money. That's not a plan, it's a prayer.`);
    if (avgMer > 0.0030) recommendations.push("The banks are eating your lunch. Find cheaper ETFs.");
    if (totalScore > 80 && recommendations.length === 0) recommendations.push("Masterful work. Keep the machine running.");

    let verdict = "";
    if (totalScore >= 90) verdict = "Truth Master. Your portfolio is a fortress.";
    else if (totalScore >= 70) verdict = "Solid. A few tweaks and you're untouchable.";
    else if (totalScore >= 40) verdict = "Average NooB. You're trying, but the bugs are showing.";
    else verdict = "Danger Zone. Your portfolio is a ticking time bomb of fees and gambling.";

    return {
        score: totalScore,
        diversityScore,
        concentrationScore,
        efficiencyScore,
        verdict,
        recommendations,
        sectorExposure: Object.entries(sectorWeights).map(([sector, percentage]) => ({ sector: sector as AssetSector, percentage })),
        maxHoldingPercentage: maxPct,
        avgMer
    };
}
