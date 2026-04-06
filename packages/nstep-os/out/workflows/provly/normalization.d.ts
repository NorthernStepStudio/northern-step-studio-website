import type { ProvLyAttachment, ProvLyIntake, ProvLyInventoryItem, ProvLyItemSource, ProvLyReceipt } from "../../core/types.js";
export interface ProvLyNormalizationResult {
    readonly items: readonly ProvLyInventoryItem[];
    readonly attachments: readonly ProvLyAttachment[];
    readonly receipts: readonly ProvLyReceipt[];
    readonly roomLabels: readonly string[];
    readonly sourceCounts: Record<ProvLyItemSource, number>;
}
export declare function normalizeProvLyInventory(intake: ProvLyIntake): ProvLyNormalizationResult;
