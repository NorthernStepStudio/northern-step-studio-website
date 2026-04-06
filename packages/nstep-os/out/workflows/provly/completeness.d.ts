import type { ProvLyCompletenessSummary, ProvLyInventoryItem, ProvLyIntake } from "../../core/types.js";
import type { ProvLyClassificationResult } from "./classification.js";
import type { ProvLyNormalizationResult } from "./normalization.js";
export interface ProvLyCompletenessResult {
    readonly completeness: ProvLyCompletenessSummary;
    readonly reminders: readonly string[];
    readonly ruleNotes: readonly string[];
    readonly priorityItems: readonly ProvLyInventoryItem[];
}
export declare function checkProvLyCompleteness(intake: ProvLyIntake, classification: ProvLyClassificationResult, normalized: ProvLyNormalizationResult): ProvLyCompletenessResult;
