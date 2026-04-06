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
exports.discoverApiRoutes = discoverApiRoutes;
const vscode = __importStar(require("vscode"));
/**
 * Service to discover and map API routes (specifically Hono).
 * This gives the AI a direct look at the backend network layer.
 */
async function discoverApiRoutes() {
    const apiMaps = [];
    const apiPatterns = [
        "**/src/index.ts",
        "**/src/routes/*.ts",
        "**/apps/*/src/index.ts",
    ];
    for (const pattern of apiPatterns) {
        try {
            const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 10);
            for (const uri of uris) {
                const doc = await vscode.workspace.openTextDocument(uri);
                const text = doc.getText();
                const relPath = vscode.workspace.asRelativePath(uri);
                // Simple regex-based route extraction for Hono/Express style
                // Matches: app.get('/path', ...) or routes.post('/path', ...)
                const routeRegex = /(?:app|route|router|api)\.(get|post|put|delete|patch|all)\(['"]([^'"]+)['"]/gi;
                const routes = [];
                let match;
                while ((match = routeRegex.exec(text)) !== null) {
                    routes.push(`${match[1].toUpperCase()} ${match[2]}`);
                }
                if (routes.length > 0) {
                    apiMaps.push({
                        path: relPath,
                        routes: [...new Set(routes)], // Unique routes
                    });
                }
            }
        }
        catch (err) {
            console.error(`NSS: API route discovery failed for ${pattern}`, err);
        }
    }
    return apiMaps;
}
//# sourceMappingURL=apiDiscoveryService.js.map