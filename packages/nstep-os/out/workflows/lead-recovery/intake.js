export function extractLeadRecoveryInput(goal) {
    const payload = goal.payload;
    const rawInput = payload?.leadRecovery ?? goal.payload;
    if (!rawInput || !rawInput.event || !rawInput.brand) {
        throw new Error("Lead recovery goal payload must include leadRecovery.event and leadRecovery.brand.");
    }
    if ("goal" in rawInput && rawInput.goal) {
        return rawInput;
    }
    return {
        goal,
        event: rawInput.event,
        brand: rawInput.brand,
        lead: rawInput.lead,
        previousInteractions: rawInput.previousInteractions,
    };
}
//# sourceMappingURL=intake.js.map