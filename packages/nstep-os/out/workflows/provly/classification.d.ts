import type { ProvLyInventoryCategory, ProvLyInventoryItem, ProvLyIntake, ProvLyRoom } from "../../core/types.js";
import type { ProvLyNormalizationResult } from "./normalization.js";
export interface ProvLyClassificationResult {
    readonly items: readonly ProvLyInventoryItem[];
    readonly categories: readonly ProvLyInventoryCategory[];
    readonly rooms: readonly ProvLyRoom[];
    readonly highValueItems: readonly ProvLyInventoryItem[];
    readonly totalEstimatedValue?: number;
}
export declare function classifyProvLyInventory(intake: ProvLyIntake, normalized: ProvLyNormalizationResult): ProvLyClassificationResult;
