"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverProjectSchemas = discoverProjectSchemas;
const vscode = __importStar(require("vscode"));
const text_js_1 = require("../../helpers/text.js");
/**
 * Service to discover and summarize database and API schemas.
 * This provides the AI with "eyes" on the project's data layer.
 */
async function discoverProjectSchemas() {
    const schemas = [];
    // Patterns for finding schema files
    const schemaPatterns = [
        "**/prisma/schema.prisma",
        "**/src/db/schema.ts", // Drizzle or similar
        "**/db/*.sql",
        "**/apps/*/wrangler.toml", // Cloudflare D1/KV info
    ];
    for (const pattern of schemaPatterns) {
        try {
            const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 5);
            for (const uri of uris) {
                const doc = await vscode.workspace.openTextDocument(uri);
                const text = doc.getText();
                const relPath = vscode.workspace.asRelativePath(uri);
                // Basic summarization: keep the main structure
                // For Prisma, we keep models. For SQL, we keep CREATE TABLE statements.
                let summary = text;
                if (uri.fsPath.endsWith(".prisma")) {
                    summary = summarizePrismaSchema(text);
                }
                else if (uri.fsPath.endsWith(".sql")) {
                    summary = summarizeSqlSchema(text);
                }
                schemas.push({
                    path: relPath,
                    summary: (0, text_js_1.truncateText)(summary, 2000),
                });
            }
        }
        catch (err) {
            console.error(`NSS: Schema discovery failed for ${pattern}`, err);
        }
    }
    return schemas;
}
function summarizePrismaSchema(text) {
    // Keep model, enum, datasource, and specifically RELATIONSHIPS
    const lines = text.split("\n");
    const summarized = [];
    let inBlock = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("model ") || trimmed.startsWith("enum ") || trimmed.startsWith("datasource ") || trimmed.startsWith("generator ")) {
            inBlock = true;
        }
        if (inBlock) {
            // Keep only lines that define the structure or relationships
            if (trimmed.includes("@id") || trimmed.includes("@unique") || trimmed.includes("@relation") || trimmed.includes("model ") || trimmed.startsWith("}")) {
                summarized.push(line);
            }
            else if (!trimmed.startsWith("@@") && trimmed.length > 0) {
                // Keep standard fields too but omit most attributes if they aren't crucial for relationships
                summarized.push(line);
            }
        }
        if (trimmed.startsWith("}")) {
            inBlock = false;
            summarized.push("");
        }
    }
    return summarized.join("\n").trim() || text;
}
function summarizeSqlSchema(text) {
    // Keep CREATE TABLE and CREATE VIEW statements
    const lines = text.split("\n");
    const summarized = [];
    let inCreate = false;
    for (const line of lines) {
        const trimmed = line.trim().toUpperCase();
        if (trimmed.startsWith("CREATE TABLE") || trimmed.startsWith("CREATE VIEW") || trimmed.startsWith("ALTER TABLE")) {
            inCreate = true;
        }
        if (inCreate) {
            summarized.push(line);
        }
        if (trimmed.endsWith(";")) {
            inCreate = false;
            summarized.push("");
        }
    }
    return summarized.join("\n").trim() || text;
}
//# sourceMappingURL=schemaDiscoveryService.js.map