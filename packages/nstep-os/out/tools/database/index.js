import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../../core/persistence.js";
function normalizePhone(value) {
    const digits = String(value || "").replace(/\D+/g, "");
    if (!digits) {
        return String(value || "").trim();
    }
    if (digits.length === 11 && digits.startsWith("1")) {
        return `+${digits}`;
    }
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    return `+${digits}`;
}
function createEmptyState() {
    return {
        leads: [],
        interactions: [],
        outbounds: [],
        events: [],
    };
}
async function loadState(filePath) {
    return readJsonFile(filePath, createEmptyState());
}
async function saveState(filePath, state) {
    await writeJsonFile(filePath, state);
}
export async function createJsonDomainStore(options) {
    const filePath = path.join(options.dataDir, options.fileName ?? "domain.json");
    await ensureDirectory(options.dataDir);
    return {
        async loadLeads() {
            const state = await loadState(filePath);
            return state.leads;
        },
        async saveLeads(leads) {
            const state = await loadState(filePath);
            state.leads = [...leads];
            await saveState(filePath, state);
        },
        async getLeadByPhone(tenantId, phone) {
            const state = await loadState(filePath);
            const normalizedPhone = normalizePhone(phone);
            return state.leads.find((lead) => lead.tenantId === tenantId && normalizePhone(lead.phone) === normalizedPhone);
        },
        async upsertLead(lead) {
            const state = await loadState(filePath);
            const index = state.leads.findIndex((item) => item.leadId === lead.leadId);
            const nextLead = {
                ...lead,
                phone: normalizePhone(lead.phone),
            };
            state.leads =
                index >= 0
                    ? [...state.leads.slice(0, index), nextLead, ...state.leads.slice(index + 1)]
                    : [...state.leads, nextLead];
            await saveState(filePath, state);
            return nextLead;
        },
        async appendInteraction(interaction) {
            const state = await loadState(filePath);
            state.interactions = [...state.interactions, interaction];
            await saveState(filePath, state);
        },
        async appendOutboundMessage(message) {
            const state = await loadState(filePath);
            state.outbounds = [...state.outbounds, message];
            await saveState(filePath, state);
        },
        async listInteractions(tenantId) {
            const state = await loadState(filePath);
            return state.interactions.filter((item) => item.tenantId === tenantId);
        },
        async listOutbounds(tenantId) {
            const state = await loadState(filePath);
            return state.outbounds.filter((item) => state.leads.some((lead) => lead.tenantId === tenantId && normalizePhone(lead.phone) === normalizePhone(item.to)));
        },
        async getCallEvent(eventId) {
            const state = await loadState(filePath);
            return state.events.find((event) => event.eventId === eventId);
        },
        async upsertCallEvent(event) {
            const state = await loadState(filePath);
            const index = state.events.findIndex((item) => item.eventId === event.eventId);
            const nextEvent = index >= 0 ? { ...state.events[index], ...event } : event;
            state.events =
                index >= 0
                    ? [...state.events.slice(0, index), nextEvent, ...state.events.slice(index + 1)]
                    : [...state.events, nextEvent];
            await saveState(filePath, state);
            return nextEvent;
        },
    };
}
export function seedLeadRecord(tenantId, phone, overrides = {}) {
    return {
        leadId: overrides.leadId || randomUUID(),
        tenantId,
        phone: normalizePhone(phone),
        name: overrides.name,
        email: overrides.email,
        stage: overrides.stage || "new",
        doNotContact: overrides.doNotContact ?? false,
        communicationTone: overrides.communicationTone || "business-safe",
        notes: overrides.notes,
        lastInboundAt: overrides.lastInboundAt,
        lastOutboundAt: overrides.lastOutboundAt,
        lastContactedAt: overrides.lastContactedAt,
        contactedWithin48h: overrides.contactedWithin48h ?? false,
        metadata: overrides.metadata || {},
    };
}
//# sourceMappingURL=index.js.map