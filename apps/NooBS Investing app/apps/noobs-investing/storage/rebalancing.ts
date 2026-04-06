import { getPortfolioSummary } from "./transactions";
import { AssetType } from "./types";
import { getPlan } from "./plan";

export type RebalanceAdvice = {
    symbol: string;
    action: "buy" | "sell";
    amount: number;
    drift: number;
    rationale: string;
};

export type PortfolioDrift = {
    type: AssetType;
    current: number;
    target: number;
    drift: number;
};

const TARGETS: Record<string, Partial<Record<AssetType, number>>> = {
    aggressive: { ETF: 80, Fund: 20 },
    balanced: { ETF: 60, Fund: 40 },
    conservative: { ETF: 40, Fund: 60 }
};

export async function calculateDrift(kind: "paper" | "real"): Promise<PortfolioDrift[]> {
    const summary = await getPortfolioSummary(kind);
    const plan = await getPlan();
    const targets = TARGETS[plan.allocation_template] || TARGETS.balanced;

    const drifter: PortfolioDrift[] = (["ETF", "Fund", "Stock", "Other", "REIT"] as AssetType[]).map(type => {
        const current = summary.allocation.find(a => a.type === type)?.percentage || 0;
        const target = targets[type] || 0;
        return {
            type,
            current,
            target,
            drift: Math.abs(current - target)
        };
    });

    return drifter;
}

export async function getRebalancingAdvice(kind: "paper" | "real"): Promise<RebalanceAdvice[]> {
    const summary = await getPortfolioSummary(kind);
    const plan = await getPlan();
    const total = summary.total;
    if (total <= 0) return [];

    const targets = TARGETS[plan.allocation_template] || TARGETS.balanced;
    const advice: RebalanceAdvice[] = [];

    (Object.entries(targets) as [AssetType, number][]).forEach(([type, targetPct]) => {
        const currentAmount = summary.allocation.find(a => a.type === type)?.amount || 0;
        const targetAmount = total * (targetPct / 100);
        const difference = targetAmount - currentAmount;
        const currentPct = (currentAmount / total) * 100;

        // Only advise if the difference is meaningful (e.g., > $50 or > 5%)
        if (Math.abs(difference) > 50) {
            const isBuy = difference > 0;
            let rationale = "";

            if (type === "ETF") {
                rationale = isBuy
                    ? "You're missing out on the broad market growth. Top up your VTI to stay in the game."
                    : "You're too concentrated in stocks. If the market dips, you'll feel it 10x more. Trim it back.";
            } else if (type === "Fund") {
                rationale = isBuy
                    ? "Your safety net is looking thin. Add some BND so a market crash doesn't leave you broke."
                    : "You're holding too much 'boring' cash compared to your plan. Put some of this safety to work.";
            }

            advice.push({
                symbol: type === "ETF" ? "VTI" : "BND", // Suggest our NooBS defaults
                action: isBuy ? "buy" : "sell",
                amount: Math.abs(difference),
                drift: Math.abs(currentPct - targetPct),
                rationale
            });
        }
    });

    return advice;
}

export async function hasMajorDrift(kind: "paper" | "real", threshold = 5): Promise<boolean> {
    const drifts = await calculateDrift(kind);
    return drifts.some(d => d.drift > threshold);
}
