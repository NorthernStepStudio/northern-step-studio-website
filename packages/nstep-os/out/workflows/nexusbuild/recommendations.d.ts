import type { NexusBuildComparisonSummary, NexusBuildCompatibilitySummary, NexusBuildIntake, NexusBuildRecommendationSummary, NexusBuildPricingSnapshot } from "../../core/types.js";
import type { NexusBuildAnalysisBundle } from "./analysis.js";
export declare function buildNexusBuildRecommendation(intake: NexusBuildIntake, compatibility: NexusBuildCompatibilitySummary, analysis: NexusBuildAnalysisBundle, comparison?: NexusBuildComparisonSummary, pricingSnapshots?: readonly NexusBuildPricingSnapshot[]): NexusBuildRecommendationSummary;
