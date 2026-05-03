/**
 * 🔑 BETA CONFIGURATION
 *
 * Central switch for the Founder Beta phase.
 * When isBetaPhase is true:
 *   - All features are fully unlocked
 *   - No token costs are deducted
 *   - No paywalls or gating
 *   - Token claim buttons are hidden
 *   - Token packs remain available as optional support purchases
 *
 * When isBetaPhase is false (post-launch):
 *   - Token system re-activates
 *   - Claim bonuses and weekly rewards appear
 *   - Feature gating resumes
 */

export const betaConfig = {
  /** Master switch — set to false at official launch */
  isBetaPhase: true,

  /** Duration of the beta in days */
  betaDurationDays: 14,

  /** When true, all features bypass token checks */
  unlockBetaFeaturesForFree: true,

  /** When true, token deductions are disabled for beta features */
  requireTokensForBetaFeatures: false,

  /** Token packs (RevenueCat) remain purchasable as voluntary support */
  allowOptionalSupportPurchases: true,

  /** Hides "+273 bonus", "+20 weekly", and other founder claims */
  hideFounderBetaClaims: true,

  /** Android is the only shipping platform for this beta */
  androidOnlyBeta: true,

  /** Label shown on the Founder card during beta */
  betaLabel: "Founder Beta – Early Access",

  /** Label shown on the Founder card after launch */
  postLaunchLabel: "Founder Rewards (Post-Launch)",

  /** Description for post-launch token rewards */
  postLaunchDescription:
    "Includes bonus tokens and weekly rewards after official release",
};

/**
 * Convenience helper — use throughout the app to check if
 * token gating should be bypassed.
 */
export const isBetaActive = (): boolean =>
  betaConfig.isBetaPhase && betaConfig.unlockBetaFeaturesForFree;
