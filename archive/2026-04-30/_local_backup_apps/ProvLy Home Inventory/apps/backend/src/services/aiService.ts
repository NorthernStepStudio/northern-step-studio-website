
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "../utils/supabase.js";
import { generateClaimReport } from "./exportService.js";
import dotenv from 'dotenv';

import path from 'path';

// Try loading from CWD first, then up two levels (if running from apps/backend), then root
const envLocations = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
];

envLocations.forEach(loc => dotenv.config({ path: loc }));


const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
} else {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set. AI features will be disabled.");
}

export interface ParsedReceipt {
    merchant_name: string | null;
    purchase_date: string | null;
    total_amount: number | null;
    currency: string | null;
    items: {
        name: string;
        price: number | null;
    }[];
}

const AGENT_ACTION_REGEX = /AGENT_ACTION:\s*(\{[\s\S]*?\})/;

interface AgentAction {
    type: string;
    format?: string;
    scope?: string;
    fields?: string[];
    items?: string[];
    jobId?: string;
}

const MAX_AGENT_LOOPS = 3;

interface TotalsSnapshot {
    total_items: number;
    total_replacement_value_known: number;
    unknown_value_items_count: number;
}

interface FactPackStats {
    total_items: number;
    total_replacement_value_known: number;
    unknown_value_items_count: number;
    missing_photos_items_count: number;
    missing_receipts_items_count: number;
    missing_serial_or_model_count: number;
    available_exports: string[];
    last_export: {
        format: string | null;
        status: string | null;
        url: string | null;
        jobId: string | null;
        createdAt: string | null;
    } | null;
    timestamp: string;
}

interface FactPackResult {
    text: string;
    stats: FactPackStats;
}

function formatStatNumber(value?: number | null): string {
    return value !== undefined && value !== null ? value.toString() : 'unknown';
}

function buildLoopFallback(stats?: FactPackStats): string {
    const totalItems = formatStatNumber(stats?.total_items);
    const replacementValue = formatStatNumber(stats?.total_replacement_value_known);
    const missingValueCount = formatStatNumber(stats?.unknown_value_items_count);
    const missingPhotos = formatStatNumber(stats?.missing_photos_items_count);
    const missingReceipts = formatStatNumber(stats?.missing_receipts_items_count);
    const missingSerials = formatStatNumber(stats?.missing_serial_or_model_count);

    return `Calm Summary:
I’m hitting repeated export actions and pausing to avoid a loop. Please retry in a moment or ask me to refresh the export.

Totals:
- Total items counted: ${totalItems}
- Total replacement value: ${replacementValue}
- Missing-value count: ${missingValueCount}

Proof Checklist:
- Photos missing count: ${missingPhotos}
- Receipts missing count: ${missingReceipts}
- Serial/model missing count: ${missingSerials}
- Next best proof alternatives: bank statement, retailer email, warranty card

Next Steps:
- Retry the export request.
- Ask me to check the export status.
- Attach any missing proof you can gather.

Export:
- Export paused until the loop clears.

Actions:
[Retry Export] [Check status]
`;
}

function stringifyAction(action: AgentAction): string {
    const ordered: Record<string, unknown> = {};
    Object.keys(action)
        .sort()
        .forEach((key) => {
            ordered[key] = (action as any)[key];
        });
    return JSON.stringify(ordered);
}

async function buildFactPack(homeId: string): Promise<FactPackResult | null> {
    try {
        const [itemsResult, documentsResult, exportJobsResult] = await Promise.all([
            supabaseAdmin
                .from('items')
                .select(`
                    id, name, category, brand, model, serial_number, purchase_price,
                    rooms!inner(id, name, home_id)
                `)
                .eq('rooms.home_id', homeId),
            supabaseAdmin
                .from('documents')
                .select(`
                    id, doc_type, storage_path, file_type, item_id,
                    items!inner(id, name, rooms!inner(name, home_id))
                `)
                .eq('items.rooms.home_id', homeId),
            supabaseAdmin
                .from('export_jobs')
                .select('id, format, status, storage_path, created_at, expires_at')
                .eq('home_id', homeId)
                .order('created_at', { ascending: false })
                .limit(5),
        ]);

        if (itemsResult.error || documentsResult.error || exportJobsResult.error) {
            console.error('Fact pack query error:', itemsResult.error || documentsResult.error || exportJobsResult.error);
            return null;
        }

        const items = itemsResult.data || [];
        const documents = documentsResult.data || [];
        const exportJobs = exportJobsResult.data || [];

        const totalItems = items.length;
        const totalReplacementValueKnown = items.reduce(
            (sum, item: any) => sum + (Number(item.purchase_price) || 0),
            0
        );
        const unknownValueItems = items.filter((item: any) => item.purchase_price == null).length;

        const docIndex = new Map<string, { types: Set<string>; proofs: { type: string; path: string }[] }>();
        documents.forEach((doc: any) => {
            const itemId = doc.item_id || doc.items?.id;
            if (!itemId) return;
            const lowerType = (doc.doc_type || '').toLowerCase();
            const entry = docIndex.get(itemId) ?? { types: new Set(), proofs: [] };
            entry.types.add(lowerType);
            entry.proofs.push({
                type: lowerType,
                path: doc.storage_path,
            });
            docIndex.set(itemId, entry);
        });

        const countMissingDocType = (type: string) =>
            items.filter(item => !(docIndex.get(item.id)?.types.has(type))).length;

        const missingPhotosItems = countMissingDocType('photo');
        const missingReceiptsItems = countMissingDocType('receipt');

        const serialModelKeywords = ['electronics', 'tools', 'appliance', 'camera', 'laptop', 'TV', 'computer'];
        const serialModelMissingItems = items.filter((item: any) => {
            const category = (item.category || '').toLowerCase();
            const name = (item.name || '').toLowerCase();
            const needsSerial = serialModelKeywords.some(keyword => category.includes(keyword) || name.includes(keyword.toLowerCase()));
            if (!needsSerial) return false;
            return !(item.serial_number || item.model);
        }).length;

        const highValueItems = items
            .filter((item: any) => item.purchase_price != null)
            .sort((a: any, b: any) => (Number(b.purchase_price) || 0) - (Number(a.purchase_price) || 0))
            .slice(0, 5)
            .map((item: any) => {
                const docs = docIndex.get(item.id);
                return {
                    name: item.name,
                    room: item.rooms?.name || 'Unknown room',
                    replacement_value: Number(item.purchase_price),
                    proof: docs?.proofs.map(p => `${p.type}:${p.path}`) || [],
                };
            });

        const availableExports = Array.from(
            new Set(
                exportJobs
                    .map(job => job.format)
                    .filter(Boolean)
                    .map(format => format.toUpperCase())
            )
        );

        const lastExport =
            exportJobs.length > 0
                ? {
                    id: exportJobs[0].id,
                    format: exportJobs[0].format?.toUpperCase() || null,
                    status: exportJobs[0].status || null,
                    created_at: exportJobs[0].created_at || null,
                    storage_path: exportJobs[0].storage_path || null,
                }
                : null;

        const stats: FactPackStats = {
            total_items: totalItems,
            total_replacement_value_known: totalReplacementValueKnown,
            unknown_value_items_count: unknownValueItems,
            missing_photos_items_count: missingPhotosItems,
            missing_receipts_items_count: missingReceiptsItems,
            missing_serial_or_model_count: serialModelMissingItems,
            available_exports: availableExports,
            last_export: {
                format: lastExport?.format || null,
                status: lastExport?.status || null,
                url: null,
                jobId: lastExport?.id || null,
                createdAt: lastExport?.created_at || null,
            },
            timestamp: new Date().toISOString(),
        };

        const factPackLines = [
            'FACT_PACK (authoritative; do not contradict):',
            `- total_items: ${stats.total_items}`,
            `- total_replacement_value_known: ${stats.total_replacement_value_known}`,
            `- unknown_value_items_count: ${stats.unknown_value_items_count}`,
            `- missing_photos_items_count: ${stats.missing_photos_items_count}`,
            `- missing_receipts_items_count: ${stats.missing_receipts_items_count}`,
            `- missing_serial_or_model_count: ${stats.missing_serial_or_model_count}`,
            `- missing_proof_alternatives: ["bank statement","retailer email","warranty card"]`,
            `- high_value_items: ${JSON.stringify(highValueItems, null, 2)}`,
            `- available_exports: ${JSON.stringify(stats.available_exports)}`,
            `- last_export: ${JSON.stringify(stats.last_export)}`,
            `- timestamp: ${stats.timestamp}`,
        ];

        return { text: factPackLines.join('\n'), stats };
    } catch (error) {
        console.error('Fact pack build failed:', error);
        return null;
    }
}

interface ExportJobRecord {
    id: string;
    status: string | null;
    format: string | null;
    storage_path: string | null;
    created_at: string | null;
    expires_at: string | null;
}

type ExportResultStatus = 'READY' | 'PROCESSING' | 'EXPIRED' | 'ERROR';

interface ExportResultPayload {
    format: string;
    status: ExportResultStatus;
    jobId: string;
    url?: string;
    createdAt?: string | null;
    expiresAt?: string | null;
    etaSeconds?: number;
    totalsSnapshot?: TotalsSnapshot;
    scope?: string;
    errorCode?: string;
    message?: string;
}

function buildTotalsSnapshot(stats?: FactPackStats): TotalsSnapshot | undefined {
    if (!stats) return undefined;
    const { total_items, total_replacement_value_known, unknown_value_items_count } = stats;
    return { total_items, total_replacement_value_known, unknown_value_items_count };
}

async function fetchExportJob(jobId: string): Promise<ExportJobRecord | null> {
    const { data, error } = await supabaseAdmin
        .from('export_jobs')
        .select('id, status, format, storage_path, created_at, expires_at')
        .eq('id', jobId)
        .single();

    if (error || !data) {
        console.warn('Export job lookup failed:', error);
        return null;
    }

    return data;
}

async function listExportFiles(folder: string): Promise<string[]> {
    if (!folder) return [];
    const { data, error } = await supabaseAdmin.storage
        .from('exports')
        .list(folder, { limit: 100, offset: 0 });

    if (error || !data) {
        console.warn('Failed to list export files:', error);
        return [];
    }

    return (data || []).map(file => file.name);
}

async function findExportFilePath(job: ExportJobRecord | null, format: string): Promise<string | null> {
    if (!job || !job.storage_path) return null;

    const files = await listExportFiles(job.storage_path);
    const ext = (format?.toLowerCase() === 'csv') ? '.csv' : '.pdf';
    const match = files.find((name) => name?.toLowerCase()?.endsWith(ext));
    if (!match) return null;
    return `${job.storage_path}/${match}`;
}

function determineExportStatus(jobStatus: string | null, hasUrl: boolean): ExportResultStatus {
    const normalized = (jobStatus || '').toLowerCase();
    if (normalized === 'processing' || normalized === 'pending') {
        return 'PROCESSING';
    }
    if (normalized === 'failed') {
        return 'ERROR';
    }
    if (normalized === 'expired') {
        return 'EXPIRED';
    }
    if (normalized === 'completed') {
        return hasUrl ? 'READY' : 'EXPIRED';
    }
    return hasUrl ? 'READY' : 'PROCESSING';
}

function wrapExportResult(payload: ExportResultPayload): string {
    return `EXPORT_RESULT:\n${JSON.stringify(enforceExportContract(payload), null, 2)}\n`;
}

function enforceExportContract(payload: ExportResultPayload): ExportResultPayload {
    if (payload.status === 'READY') {
        if (!payload.url || !payload.expiresAt) {
            payload.status = 'EXPIRED';
            payload.message = payload.message || 'Signed link is not available yet — I can try again.';
            payload.url = undefined;
        }
    }

    if (payload.status === 'PROCESSING') {
        payload.jobId = payload.jobId || 'unknown';
        payload.message = payload.message || 'Export is generating. I’ll keep checking.';
    }

    if (payload.status === 'EXPIRED') {
        payload.jobId = payload.jobId || 'unknown';
        payload.message = payload.message || 'That link expired — I can generate a fresh one.';
        payload.url = undefined;
    }

    if (payload.status === 'ERROR') {
        payload.errorCode = payload.errorCode || 'EXPORT_ERROR';
        payload.message = payload.message || 'Export failed; please try again later.';
    }

    return payload;
}

function parseAgentAction(text: string): AgentAction | null {
    const match = text.match(AGENT_ACTION_REGEX);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch (error) {
        console.error('Failed to parse AGENT_ACTION JSON', error);
        return null;
    }
}

async function createExportSignedUrl(path: string): Promise<string | null> {
    if (!path) return null;
    try {
        const { data } = await supabaseAdmin.storage.from('exports').createSignedUrl(path, 60 * 60);
        return data?.signedUrl || null;
    } catch (error) {
        console.error('Signed URL generation error:', error);
        return null;
    }
}

async function executeAgentAction(
    action: AgentAction,
    userId: string,
    accessToken: string,
    homeId: string,
    homeName: string,
    factPackStats: FactPackStats | null
): Promise<string | null> {
    const format = (action.format || 'PDF').toUpperCase();
    const scope = action.scope || 'ALL_ITEMS';
    const totalsSnapshot = buildTotalsSnapshot(factPackStats || undefined);

    if (action.type === 'EXPORT_CLAIM_REPORT') {
        try {
            const exportResult = await generateClaimReport(userId, accessToken, homeId, homeName);
            const job = exportResult.job;
            const targetPath = format === 'CSV' ? exportResult.csvPath : exportResult.pdfPath;
            const signedUrl = job && job.status === 'completed' ? await createExportSignedUrl(targetPath) : null;
            const status = determineExportStatus(job?.status || null, Boolean(signedUrl));
            const payload: ExportResultPayload = {
                format,
                status,
                jobId: job?.id || exportResult.jobId,
                url: signedUrl || undefined,
                createdAt: job?.created_at || null,
                expiresAt: job?.expires_at || null,
                etaSeconds: status === 'PROCESSING' ? 30 : undefined,
                totalsSnapshot,
                scope,
            };
            return wrapExportResult(payload);
        } catch (error: any) {
            console.error('Export action failed:', error);
            const payload: ExportResultPayload = {
                format,
                status: 'ERROR',
                jobId: action.jobId || 'unknown',
                scope,
            };
            return wrapExportResult(payload);
        }
    }

    if (action.type === 'CHECK_EXPORT_STATUS') {
        if (!action.jobId) {
            const payload: ExportResultPayload = {
                format,
                status: 'ERROR',
                jobId: 'unknown',
                scope,
            };
            return wrapExportResult(payload);
        }

        const job = await fetchExportJob(action.jobId);
        const path = await findExportFilePath(job, format);
        const signedUrl = path ? await createExportSignedUrl(path) : null;
        const status = determineExportStatus(job?.status || null, Boolean(signedUrl));
        const payload: ExportResultPayload = {
            format,
            status,
            jobId: action.jobId,
            url: signedUrl || undefined,
            createdAt: job?.created_at || null,
            expiresAt: job?.expires_at || null,
            etaSeconds: status === 'PROCESSING' ? 30 : undefined,
            totalsSnapshot,
            scope,
        };
        return wrapExportResult(payload);
    }

    if (action.type === 'REFRESH_EXPORT_LINK') {
        if (!action.jobId) {
            const payload: ExportResultPayload = {
                format,
                status: 'ERROR',
                jobId: 'unknown',
                scope,
            };
            return wrapExportResult(payload);
        }

        const job = await fetchExportJob(action.jobId);
        const path = await findExportFilePath(job, format);
        const signedUrl = path ? await createExportSignedUrl(path) : null;
        const status = signedUrl ? 'READY' : 'EXPIRED';
        const payload: ExportResultPayload = {
            format,
            status,
            jobId: action.jobId,
            url: signedUrl || undefined,
            createdAt: job?.created_at || null,
            expiresAt: job?.expires_at || null,
            etaSeconds: undefined,
            totalsSnapshot,
            scope,
        };
        return wrapExportResult(payload);
    }

    return null;
}

async function processAgentActions(
    chat: any,
    initialText: string,
    userId: string,
    accessToken: string,
    homeId: string,
    homeName: string,
    factPackStats: FactPackStats | null
): Promise<string> {
    let currentText = initialText;
    let lastActionJson: string | null = null;

    for (let attempt = 0; attempt < MAX_AGENT_LOOPS; attempt += 1) {
        const action = parseAgentAction(currentText);
        if (!action) break;

        const actionJson = stringifyAction(action);
        if (actionJson === lastActionJson) {
            return buildLoopFallback(factPackStats || undefined);
        }
        lastActionJson = actionJson;

        const followUp = await executeAgentAction(
            action,
            userId,
            accessToken,
            homeId,
            homeName,
            factPackStats
        );
        if (!followUp) break;

        const followUpResult = await chat.sendMessage(followUp);
        const response = await followUpResult.response;
        currentText = response.text();

        if (attempt === MAX_AGENT_LOOPS - 1) {
            const nextAction = parseAgentAction(currentText);
            if (nextAction) {
                return buildLoopFallback(factPackStats || undefined);
            }
            break;
        }
    }

    return currentText;
}

export const aiService = {
    parseReceipt: async (text: string): Promise<ParsedReceipt> => {
        return aiService.generateFromPrompt([
            `Extract data from this receipt text:
            """${text}"""`
        ]);
    },

    parseReceiptFromStorage: async (storagePath: string): Promise<ParsedReceipt> => {
        if (!model) {
            throw new Error("AI model is not initialized. Check API key.");
        }

        console.log(`Downloading receipt from storage: ${storagePath}`);

        const { data, error } = await supabaseAdmin.storage
            .from('uploads')
            .download(storagePath);

        if (error || !data) {
            console.error("Storage download error:", error);
            throw new Error(`Failed to download file: ${error?.message}`);
        }

        const buffer = await data.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = storagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            }
        };

        return aiService.generateFromPrompt(["Extract data from this receipt image:", imagePart]);
    },

    generateFromPrompt: async (parts: any[]): Promise<ParsedReceipt> => {
        if (!model) {
            throw new Error("AI model is not initialized. Check API key.");
        }

        const systemPrompt = `
            You are a receipt parsing assistant. Extract the following information and return ONLY valid JSON.
            Do not include Markdown interpretation (\`\`\`json).
            
            Fields:
            - merchant_name (string or null)
            - purchase_date (YYYY-MM-DD string or null)
            - total_amount (number or null)
            - currency (string e.g. "USD", "EUR" or null)
            - items: array of objects { name: string, price: number or null }
        `;

        try {
            const result = await model.generateContent([systemPrompt, ...parts]);
            const response = await result.response;
            const textResponse = response.text();

            // Clean markdown usage if present
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanJson);
        } catch (error) {
            console.error("AI Receipt Parsing failed:", error);
            throw new Error("Failed to parse receipt");
        }
    },

    runAgent: async (
        userId: string,
        accessToken: string,
        homeId: string,
        prompt: string,
        history: any[] = [],
        image?: string
    ) => {
        if (!model) throw new Error("AI model is not initialized");

        const { data: home, error: homeError } = await supabaseAdmin
            .from('homes')
            .select('name')
            .eq('id', homeId)
            .single();

        if (homeError) {
            console.warn('Home lookup error:', homeError);
        }

        const homeName = home?.name || 'Home Inventory';
        const t0 = Date.now();

        // If image exists + "identify" keyword + no history => Simple Mode
        const isSimpleIdentify =
            Boolean(image) &&
            typeof prompt === 'string' &&
            prompt.toLowerCase().includes('identify') &&
            Array.isArray(history) &&
            history.length === 0;

        console.log(`[AI] runAgent trace`, { isSimpleIdentify, hasImage: Boolean(image), ms: 0 });

        // 1. Build Context (Fact Pack)
        let factPackText = '';
        let factPackStats = null;

        // Ensure we build context for both Chat and complex vision tasks
        // (Only skip for simple identify optimization)
        if (!isSimpleIdentify) {
            const factPackResult = await buildFactPack(homeId);
            factPackText = factPackResult?.text || '';
            factPackStats = factPackResult?.stats || null;
        }

        // 2. Prepare System Prompt
        let systemPrompt = '';
        if (isSimpleIdentify) {
            systemPrompt = "You are a specialized home inventory vision assistant. Analyze the image and return ONLY the requested JSON.";
        } else {
            systemPrompt = `
SYSTEM PROMPT: ProvLy AI — Home Inventory Assistant
You are an intelligent assistant for a home inventory app. Help the user manage their inventory, estimate values, and organize items.

CONTEXT:
Home Name: "${homeName}"

${factPackText || 'FACT_PACK: [Data Unavailable, assume zero items]'}

INSTRUCTIONS:
- Answer questions based on the FACT_PACK.
- If asked about "total value", cite the "total_replacement_value_known" from FACT_PACK.
- If asked about missing items, cite "missing_photos_items_count" etc.
- Be concise, friendly, and helpful.
- If the user asks for an export/report, reply with "AGENT_ACTION: {"type": "EXPORT_CLAIM_REPORT"}" inside the text.
`;
        }

        // 3. Construct Gemini Parts
        const parts: any[] = [];
        parts.push({ text: systemPrompt });

        // Add history (if chat mode)
        if (!isSimpleIdentify && history && history.length > 0) {
            history.forEach(msg => {
                const roleLabel = msg.role === 'user' ? 'USER_PREVIOUS' : 'MODEL_PREVIOUS';
                // Simple history injection for single-turn API
                // A better approach would be startChat, but this fits the current structure
                if (msg.parts && msg.parts[0]?.text) {
                    parts.push({ text: `${roleLabel}: ${msg.parts[0].text}` });
                }
            });
        }

        // Add current user prompt
        parts.push({ text: `USER_CURRENT: ${prompt}` });

        // Add Image if present
        if (image) {
            parts.push({ inlineData: { data: image, mimeType: "image/jpeg" } });
        }

        console.log("[AI] calling gemini", Date.now() - t0, "ms");

        try {
            const result = await withTimeout<any>(model.generateContent(parts), 25000, "Gemini generateContent");
            const response = await result.response;
            const initialResponseText = response.text();

            console.log("[AI] gemini response", Date.now() - t0, "ms");

            if (isSimpleIdentify) {
                return initialResponseText;
            }

            // 4. Check for Actions (Agent Loop)
            // Parse for actions like AGENT_ACTION: {...}
            return await processAgentActions(
                { sendMessage: async (txt: string) => ({ response: { text: () => txt } }) }, // Mock chat interface for recursion
                initialResponseText,
                userId,
                accessToken,
                homeId,
                homeName,
                factPackStats
            );

        } catch (error) {
            console.error("Agent execution failed:", error);
            throw new Error("Agent failed to process request");
        }
    }
};

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        p,
        new Promise<T>((_, rej) =>
            setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
    ]);
}
