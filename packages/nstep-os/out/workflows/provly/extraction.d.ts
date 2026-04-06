import type { OcrAdapter } from "../../tools/ocr/index.js";
import type { ProvLyIntake } from "../../core/types.js";
export interface ProvLyVisualExtractionSummary {
    readonly candidateCount: number;
    readonly extractedItemCount: number;
    readonly extractedReceiptCount: number;
    readonly attachmentCount: number;
    readonly ocrStatus: "used" | "blocked" | "fallback" | "unavailable";
    readonly ocrProvider?: OcrAdapter["provider"];
    readonly usedOcr: boolean;
    readonly notes: readonly string[];
    readonly extractedAt: string;
}
export interface ProvLyVisualExtractionResult {
    readonly intake: ProvLyIntake;
    readonly summary: ProvLyVisualExtractionSummary;
}
export declare function enrichProvLyIntakeFromVisualAssets(intake: ProvLyIntake, ocr?: OcrAdapter): Promise<ProvLyVisualExtractionResult>;
