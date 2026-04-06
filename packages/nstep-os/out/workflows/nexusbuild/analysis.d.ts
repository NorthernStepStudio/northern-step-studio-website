import type { NexusBuildBuildSnapshot, NexusBuildComparisonSummary, NexusBuildCompatibilitySummary, NexusBuildIntake, NexusBuildPerformanceSummary, NexusBuildPricingSnapshot, NexusBuildValueSummary, NexusBuildWatchItem } from "../../core/types.js";
export interface NexusBuildAnalysisBundle {
    readonly performance: NexusBuildPerformanceSummary;
    readonly value: NexusBuildValueSummary;
    readonly warnings: readonly string[];
}
export declare function analyzeNexusBuild(intake: NexusBuildIntake, compatibility: NexusBuildCompatibilitySummary, pricingSnapshots?: readonly NexusBuildPricingSnapshot[]): NexusBuildAnalysisBundle;
export declare function compareNexusBuilds(builds: readonly NexusBuildBuildSnapshot[], baseUseCase: NexusBuildIntake["useCase"]): NexusBuildComparisonSummary;
export declare function summarizeWorkflowWarnings(intake: NexusBuildIntake, compatibility: NexusBuildCompatibilitySummary, analysis: NexusBuildAnalysisBundle, comparison?: NexusBuildComparisonSummary, pricingSnapshots?: readonly NexusBuildPricingSnapshot[], watchlist?: readonly NexusBuildWatchItem[]): string[];
