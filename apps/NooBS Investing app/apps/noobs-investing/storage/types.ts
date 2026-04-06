export type TxKind = "paper" | "real";
export type AssetType = "ETF" | "Stock" | "Fund" | "Other" | "REIT";
export type AssetSector = "Broad" | "Tech" | "Financial" | "Energy" | "Industrial" | "Staples" | "Healthcare" | "Discretionary" | "Real Estate" | "Bonds" | "Commodities" | "Cash" | "Dividend" | "Strategic Income";

export type TransactionRow = {
    id: string;
    kind: TxKind;
    asset_name: string;
    asset_type: AssetType;
    amount: number;
    notes: string | null;
    date_iso: string;
};

export type NewTransactionInput = {
    kind: TxKind;
    asset_name: string;
    asset_type: AssetType;
    amount: number;
    notes: string | null;
    date_iso: string;
};
