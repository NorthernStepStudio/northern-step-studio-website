import { all, run } from "./db";
import { randomUUID } from "expo-crypto";
import { TxKind, AssetType, TransactionRow, NewTransactionInput } from "./types";
import { APPROVED_ASSETS } from "./assets";
import { getProfile } from "./profile";

export function getAssetPrice(symbol: string) {
    return APPROVED_ASSETS[symbol]?.price || 100;
}

export async function listTransactions(kind: TxKind): Promise<TransactionRow[]> {
    return all<TransactionRow>(
        `SELECT id, kind, asset_name, asset_type, amount, notes, date_iso
        FROM transactions
        WHERE kind = ?
        ORDER BY date_iso DESC;`,
        [kind]
    );
}

export async function addTransaction(input: NewTransactionInput) {
    const id = randomUUID();
    const normalizedName = input.asset_name.trim().toUpperCase();

    await run(
        `INSERT INTO transactions (id, kind, asset_name, asset_type, amount, notes, date_iso)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, input.kind, normalizedName, input.asset_type, input.amount, input.notes, input.date_iso]
    );

    // Phase W: Double Entry (Cash Offset)
    if (!normalizedName.includes("CASH")) {
        const cashId = randomUUID();
        await run(
            `INSERT INTO transactions (id, kind, asset_name, asset_type, amount, notes, date_iso)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [cashId, input.kind, "CASH", "Other", -input.amount, `Offset for ${normalizedName}`, input.date_iso]
        );
    }


    // Achievement unlock moved to UI layer to break circular dependency
    return id;
}

export async function clearTransactions(kind: TxKind) {
    await run(`DELETE FROM transactions WHERE kind = ?;`, [kind]);
}

export async function listHoldings(kind: TxKind): Promise<TransactionRow[]> {
    const transactions = await listTransactions(kind);
    const groups: Record<string, TransactionRow> = {};

    transactions.forEach(tx => {
        // Robust normalization to prevent "AAPL" vs "aapl" split
        const key = (tx.asset_name || "UNKNOWN").trim().toUpperCase();
        if (!groups[key]) {
            groups[key] = { ...tx, asset_name: key };
        } else {
            groups[key].amount += (tx.amount || 0);
        }
    });

    return Object.values(groups)
        .filter(g => Math.abs(g.amount) > 0.001) // Filter out dust
        .sort((a, b) => {
            if (a.asset_name === "CASH") return -1;
            if (b.asset_name === "CASH") return 1;
            return b.amount - a.amount;
        });

}

export async function syncInitialCash(kind: TxKind) {
    const allTx = await listTransactions(kind);
    const hasCash = allTx.some(tx => tx.asset_name.toUpperCase().includes("CASH"));

    if (!hasCash) {
        const profile = getProfile();
        let initialBudget = 1000; // Default fallback

        if (profile) {
            // Map Expense Range
            const expenseMap: Record<string, number> = {
                "<$2k/mo": 1500,
                "$2–4k/mo": 3000,
                "$4–7k/mo": 5500,
                "$7k+/mo": 9000
            };
            const monthlyExp = expenseMap[profile.expense_range] || 2000;

            // Map EF Multiplier
            const efMap: Record<string, number> = {
                "none": 0,
                "<1 month": 0.5,
                "1–3 months": 2,
                "3–6 months": 4.5,
                "6+ months": 8
            };
            const months = efMap[profile.emergency_fund_status] || 0;

            initialBudget = monthlyExp * months;

            // If they have no EF, but it's Paper mode, give them a small seed to play with
            if (initialBudget === 0 && kind === 'paper') {
                initialBudget = 1000;
            }
        } else if (kind === 'paper') {
            initialBudget = 10000; // Legacy default for paper if no profile
        } else {
            initialBudget = 0; // Real mode starts at 0 if no profile
        }

        if (initialBudget > 0) {
            await addTransaction({
                kind,
                asset_name: "CASH (Settled Cash)",
                asset_type: "Other",
                amount: initialBudget,
                notes: "Initial NooBS Seeding",
                date_iso: new Date(-1).toISOString()
            });
        }
    }
}

export type PortfolioSummary = {
    total: number;
    allocation: { type: AssetType; amount: number; percentage: number }[];
};

export async function getPortfolioSummary(kind: TxKind): Promise<PortfolioSummary> {
    const holdings = await listHoldings(kind);
    const total = holdings.reduce((acc, h) => acc + h.amount, 0);

    const groups: Record<AssetType, number> = {
        ETF: 0,
        Stock: 0,
        Fund: 0,
        REIT: 0,
        Other: 0
    };

    holdings.forEach(h => {
        const type = h.asset_name === 'CASH' ? 'Other' : h.asset_type;
        groups[type] += (h.amount || 0);
    });


    const allocation = (Object.keys(groups) as AssetType[]).map(type => ({
        type,
        amount: groups[type],
        percentage: total > 0 ? (groups[type] / total) * 100 : 0
    })).filter(a => a.amount > 0);

    return { total, allocation };
}

export async function getPortfolioTotal(kind: TxKind): Promise<number> {
    const summary = await getPortfolioSummary(kind);
    return summary.total;
}

export async function calculateProjectedAnnualYield(kind: TxKind): Promise<number> {
    const transactions = await listTransactions(kind);
    let totalYield = 0;

    transactions.forEach(tx => {
        const asset = APPROVED_ASSETS[tx.asset_name.split(' ')[0]];
        if (asset) {
            totalYield += tx.amount * (asset.yield / 100);
        } else {
            totalYield += tx.amount * 0.01;
        }
    });

    return totalYield;
}

export async function getAssetHolding(kind: TxKind, assetName: string): Promise<number> {
    const transactions = await listTransactions(kind);
    const normalizedTarget = assetName.trim().toUpperCase();

    return transactions
        .filter(tx => tx.asset_name.trim().toUpperCase() === normalizedTarget)
        .reduce((sum, tx) => sum + tx.amount, 0);
}

export async function depositCash(kind: TxKind, amount: number) {
    await addTransaction({
        kind,
        asset_name: "CASH",
        asset_type: "Other",
        amount: amount,
        notes: "Manual Deposit",
        date_iso: new Date().toISOString()
    });
}


export async function getTotalDeposits(kind: TxKind): Promise<number> {
    const transactions = await listTransactions(kind);
    return transactions
        .filter(tx => tx.asset_name.toUpperCase().includes("CASH") && tx.amount > 0 && (tx.notes === "Initial NooBS Seeding" || tx.notes === "Manual Deposit"))
        .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * TAX LOTS (FIFO)
 * Teaching: You don't just "own shares"; you own specific lots bought at different prices/times.
 */
export async function listTaxLots(kind: TxKind, assetName: string): Promise<TransactionRow[]> {
    const transactions = await listTransactions(kind);
    const normalizedTarget = assetName.trim().toUpperCase();

    // In a real system, we'd handle sell logic here to show "remnants".
    // For the simulator, we show all BUY transactions as potential lots to sell from.
    return transactions
        .filter(tx => tx.asset_name.trim().toUpperCase() === normalizedTarget && tx.amount > 0)
        .sort((a, b) => new Date(a.date_iso).getTime() - new Date(b.date_iso).getTime());
}
