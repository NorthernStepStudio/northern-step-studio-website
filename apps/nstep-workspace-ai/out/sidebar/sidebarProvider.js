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
exports.NssSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const template_js_1 = require("./webview/template.js");
class NssSidebarProvider {
    extensionUri;
    host;
    view;
    constructor(extensionUri, host) {
        this.extensionUri = extensionUri;
        this.host = host;
    }
    async resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "src", "sidebar", "webview")],
        };
        webviewView.webview.html = (0, template_js_1.renderSidebarTemplate)(webviewView.webview, this.extensionUri);
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.type === "ready") {
                await this.refresh();
                return;
            }
            if (message.type === "action") {
                await this.host.handleSidebarAction(message);
            }
        });
    }
    async refresh() {
        if (!this.view) {
            return;
        }
        await this.view.webview.postMessage({
            type: "state",
            payload: await this.host.getSidebarViewModel(),
        });
    }
    async postSearchResults(results) {
        if (!this.view) {
            return;
        }
        await this.view.webview.postMessage({
            type: "search-results",
            payload: { results },
        });
    }
    async reveal() {
        await vscode.commands.executeCommand("workbench.view.extension.nssWorkspaceAi");
        if (this.view) {
            this.view.show?.(true);
            await this.refresh();
        }
    }
}
exports.NssSidebarProvider = NssSidebarProvider;
//# sourceMappingURL=sidebarProvider.js.map