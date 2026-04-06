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
exports.clearWorkspaceSearchIndex = clearWorkspaceSearchIndex;
exports.searchCodebaseKeywords = searchCodebaseKeywords;
exports.extractKeywords = extractKeywords;
const vscode = __importStar(require("vscode"));
const workspace_js_1 = require("../../helpers/workspace.js");
const workspaceIndexCache = new Map();
function clearWorkspaceSearchIndex(rootPath) {
    if (rootPath) {
        workspaceIndexCache.delete(rootPath);
        return;
    }
    workspaceIndexCache.clear();
}
async function searchCodebaseKeywords(keywords, maxResults = 5) {
    const normalizedKeywords = normalizeKeywords(keywords);
    if (normalizedKeywords.length === 0) {
        return [];
    }
    const workspaceRoot = getWorkspaceRootPath();
    if (!workspaceRoot) {
        return [];
    }
    const index = await getOrBuildWorkspaceIndex(workspaceRoot);
    const results = [];
    for (const file of index.files) {
        const match = scoreFile(file, normalizedKeywords);
        if (match) {
            results.push(match);
        }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}
function extractKeywords(prompt) {
    const stopWords = new Set([
        "the",
        "and",
        "how",
        "what",
        "where",
        "show",
        "me",
        "this",
        "that",
        "is",
        "are",
        "of",
        "in",
        "for",
        "with",
        "from",
        "into",
        "about",
        "please",
    ]);
    const tokens = new Set();
    const candidates = prompt.toLowerCase().match(/[a-z0-9@/_-]+/g) ?? [];
    for (const candidate of candidates) {
        const parts = candidate.split(/[^a-z0-9]+/g).filter(Boolean);
        for (const part of parts) {
            if (part.length > 2 && !stopWords.has(part)) {
                tokens.add(part);
            }
        }
    }
    return [...tokens].slice(0, 8);
}
async function getOrBuildWorkspaceIndex(rootPath) {
    const cached = workspaceIndexCache.get(rootPath);
    if (cached) {
        return cached;
    }
    const built = await buildWorkspaceIndex(rootPath);
    workspaceIndexCache.set(rootPath, built);
    return built;
}
async function buildWorkspaceIndex(rootPath) {
    const includePattern = "**/*.{ts,tsx,js,jsx,mjs,cjs,json,md,sql,py,go,rs,css,html}";
    const uris = await vscode.workspace.findFiles(includePattern, workspace_js_1.WORKSPACE_SEARCH_EXCLUDE_GLOB, 500);
    const files = [];
    for (const uri of uris) {
        try {
            const buffer = await vscode.workspace.fs.readFile(uri);
            const content = Buffer.from(buffer).toString("utf8");
            if (!content.trim()) {
                continue;
            }
            const path = vscode.workspace.asRelativePath(uri);
            files.push({
                path,
                content,
                lowerPath: path.toLowerCase(),
                lowerContent: content.toLowerCase(),
            });
        }
        catch {
            continue;
        }
    }
    return {
        rootPath,
        indexedAt: new Date().toISOString(),
        files,
    };
}
function scoreFile(file, keywords) {
    let score = 0;
    let firstMatchIndex = Number.POSITIVE_INFINITY;
    for (const keyword of keywords) {
        const pathIndex = file.lowerPath.indexOf(keyword);
        if (pathIndex >= 0) {
            score += 4;
            firstMatchIndex = Math.min(firstMatchIndex, pathIndex);
        }
        const contentIndex = file.lowerContent.indexOf(keyword);
        if (contentIndex >= 0) {
            const contentOccurrences = countOccurrences(file.lowerContent, keyword);
            score += 2 + contentOccurrences;
            firstMatchIndex = Math.min(firstMatchIndex, contentIndex);
        }
    }
    if (score <= 0) {
        return undefined;
    }
    const matchIndex = Number.isFinite(firstMatchIndex) ? firstMatchIndex : 0;
    const snippet = buildSnippet(file.content, matchIndex);
    return {
        path: file.path,
        content: snippet,
        score,
    };
}
function buildSnippet(content, matchIndex) {
    const start = Math.max(0, matchIndex - 200);
    const end = Math.min(content.length, matchIndex + 600);
    const snippet = content.slice(start, end).trim();
    return `${start > 0 ? "... " : ""}${snippet}${end < content.length ? " ..." : ""}`;
}
function countOccurrences(haystack, needle) {
    if (!needle) {
        return 0;
    }
    let count = 0;
    let index = 0;
    while (index >= 0) {
        index = haystack.indexOf(needle, index);
        if (index >= 0) {
            count += 1;
            index += needle.length;
        }
    }
    return count;
}
function normalizeKeywords(keywords) {
    return [...new Set(keywords.map((keyword) => normalizeKeyword(keyword)).filter((keyword) => keyword.length > 0))];
}
function normalizeKeyword(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").trim();
}
function getWorkspaceRootPath() {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
//# sourceMappingURL=searchIndexingService.js.map