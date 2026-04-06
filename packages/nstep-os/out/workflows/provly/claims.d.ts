import type { ProvLyClaimExport, ProvLyCompletenessSummary, ProvLyIntake } from "../../core/types.js";
import type { ProvLyClassificationResult } from "./classification.js";
export interface ProvLyClaimPrepResult {
    readonly exportStatus: ProvLyClaimExport["status"];
    readonly ruleNotes: readonly string[];
    readonly reminderDraft?: {
        readonly recipients: readonly string[];
        readonly subject: string;
        readonly body: string;
    };
    readonly claimReady: boolean;
}
export declare function evaluateProvLyClaimPrep(intake: ProvLyIntake, classification: ProvLyClassificationResult, completeness: ProvLyCompletenessSummary): ProvLyClaimPrepResult;
export declare function buildProvLyClaimExport(intake: ProvLyIntake, classification: ProvLyClassificationResult, completeness: ProvLyCompletenessSummary, prep: ProvLyClaimPrepResult): ProvLyClaimExport;
