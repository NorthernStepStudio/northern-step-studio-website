export const stage2ResearchRequestSchema = {
    type: "object",
    required: ["subject", "sources"],
    properties: {
        goal: { type: "object" },
        subject: { type: "string" },
        sources: { type: "array", items: { type: "string" } },
        maxSources: { type: "number" },
        constraints: { type: "array", items: { type: "string" } },
        context: { type: "object" },
    },
};
export const stage2ResearchResultSchema = {
    type: "object",
    required: ["summary", "findings", "sourcesUsed", "confidence", "notes"],
    properties: {
        summary: { type: "string" },
        findings: { type: "array", items: { type: "string" } },
        sourcesUsed: { type: "array", items: { type: "string" } },
        confidence: { type: "number" },
        notes: { type: "array", items: { type: "string" } },
    },
};
export const stage2MessageRequestSchema = {
    type: "object",
    required: ["subject", "audience", "tone", "channel", "context", "constraints"],
    properties: {
        goal: { type: "object" },
        subject: { type: "string" },
        audience: { type: "string" },
        tone: { type: "string", enum: ["business-safe", "warm", "urgent"] },
        channel: { type: "string", enum: ["sms", "email", "internal"] },
        context: { type: "object" },
        constraints: { type: "array", items: { type: "string" } },
        template: { type: "string" },
    },
};
export const stage2MessageDraftSchema = {
    type: "object",
    required: ["subject", "body", "tone", "channel", "notes"],
    properties: {
        subject: { type: "string" },
        body: { type: "string" },
        tone: { type: "string", enum: ["business-safe", "warm", "urgent"] },
        channel: { type: "string", enum: ["sms", "email", "internal"] },
        notes: { type: "array", items: { type: "string" } },
    },
};
export const stage2AgentPermissionSchema = {
    type: "object",
    required: ["scope", "capabilities", "mayUseExternalTools", "requiresApprovalForExternalActions", "description"],
    properties: {
        scope: { type: "string" },
        capabilities: { type: "array", items: { type: "string" } },
        mayUseExternalTools: { type: "boolean" },
        requiresApprovalForExternalActions: { type: "boolean" },
        description: { type: "string" },
    },
};
export const stage2AgentResponsibilitySchema = {
    type: "object",
    required: ["title", "summary", "stage1Touchpoints"],
    properties: {
        title: { type: "string" },
        summary: { type: "string" },
        stage1Touchpoints: { type: "array", items: { type: "string" } },
    },
};
export const stage2AgentDescriptorSchema = {
    type: "object",
    required: ["id", "title", "stage", "responsibilities", "permissions"],
    properties: {
        id: { type: "string", enum: ["router-agent", "planner-agent", "research-agent", "execution-agent", "communication-agent", "verification-agent", "memory-agent", "reporting-agent"] },
        title: { type: "string" },
        stage: { type: "string", enum: ["stage2"] },
        responsibilities: { type: "array", items: stage2AgentResponsibilitySchema },
        permissions: { type: "array", items: stage2AgentPermissionSchema },
    },
};
export const stage2AgentRegistrySchema = {
    type: "object",
    required: ["count", "descriptors"],
    properties: {
        count: { type: "number" },
        agentIds: { type: "array", items: { type: "string" } },
        descriptors: { type: "array", items: stage2AgentDescriptorSchema },
        bridgeConnected: { type: "boolean" },
        updatedAt: { type: "string" },
    },
};
//# sourceMappingURL=agents.js.map