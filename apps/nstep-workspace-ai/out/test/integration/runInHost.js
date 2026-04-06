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
exports.run = run;
const node_assert_1 = require("node:assert");
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const searchIndexingService_js_1 = require("../../services/codebase/searchIndexingService.js");
const EXTENSION_ID = "northern-step-studio.nss-workspace-ai";
const REQUIRED_COMMANDS = [
    "nssWorkspaceAi.askWorkspaceAi",
    "nssWorkspaceAi.showQuickStart",
    "nssWorkspaceAi.askAboutErrorFile",
    "nssWorkspaceAi.proposeFixForErrorFile",
    "nssWorkspaceAi.proposeMultiFileChange",
    "nssWorkspaceAi.showBuildFoundation",
    "nss.showModeDetails",
    "nss.openReviewCenter",
];
async function run() {
    const serverUrl = process.env.NSS_TEST_SERVER_URL;
    (0, node_assert_1.strict)(serverUrl, "Expected NSS_TEST_SERVER_URL to be set for the extension-host run.");
    const availableCommands = await vscode.commands.getCommands(true);
    for (const commandId of REQUIRED_COMMANDS) {
        (0, node_assert_1.strict)(availableCommands.includes(commandId), `Expected command ${commandId} to be registered.`);
    }
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    (0, node_assert_1.strict)(workspaceFolder, "Expected the extension host to open a workspace folder.");
    await vscode.workspace.getConfiguration("nssWorkspaceAi").update("serverUrl", serverUrl, vscode.ConfigurationTarget.Workspace);
    const fixturePath = path.join(workspaceFolder.uri.fsPath, "src", "integration.ts");
    const fixtureDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(fixturePath));
    await vscode.window.showTextDocument(fixtureDocument, { preview: false });
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    (0, node_assert_1.strict)(extension, `Expected ${EXTENSION_ID} to be installed in the extension host.`);
    await extension.activate();
    node_assert_1.strict.equal(extension.isActive, true, "Expected NSS Workspace AI to activate.");
    await vscode.commands.executeCommand("nssWorkspaceAi.explainThisFile");
    const roundtripSnapshot = await waitForSnapshot((snapshot) => snapshot.latestResponse?.sourceCommand === "nssWorkspaceAi.explainThisFile");
    node_assert_1.strict.equal(roundtripSnapshot.serverHealth.status, "online");
    node_assert_1.strict.equal(roundtripSnapshot.latestResponse?.title, "Explain integration.ts");
    (0, node_assert_1.strict)(roundtripSnapshot.latestResponse?.body.includes("Intent: explain-file"));
    (0, node_assert_1.strict)(roundtripSnapshot.latestResponse?.body.includes("Agent: NSS Stack Expert"));
    (0, node_assert_1.strict)(roundtripSnapshot.latestResponse?.body.includes("Active file:"));
    node_assert_1.strict.equal(roundtripSnapshot.currentFilePath?.endsWith(`${path.sep}integration.ts`), true);
    const ragResults = await (0, searchIndexingService_js_1.searchCodebaseKeywords)((0, searchIndexingService_js_1.extractKeywords)("hono supabase react calculate studio score"));
    (0, node_assert_1.strict)(ragResults.some((result) => result.path.includes("src/integration.ts")));
    (0, node_assert_1.strict)(ragResults.some((result) => result.content.includes("createWorkspaceApp")));
    await vscode.commands.executeCommand("nssWorkspaceAi.showQuickStart");
    const document = await waitForVisibleMarkdown("NSS Quick Start");
    (0, node_assert_1.strict)(document, "Expected NSS Quick Start markdown preview to open.");
    (0, node_assert_1.strict)(document.getText().includes("Ask NSS"), "Expected the quick start document to contain NSS guidance.");
}
async function waitForVisibleMarkdown(titleFragment) {
    const deadline = Date.now() + 5_000;
    while (Date.now() < deadline) {
        const activeDocument = vscode.window.activeTextEditor?.document;
        if (activeDocument &&
            activeDocument.languageId === "markdown" &&
            activeDocument.getText().includes(titleFragment)) {
            return activeDocument;
        }
        await delay(100);
    }
    return undefined;
}
async function waitForSnapshot(predicate) {
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
        const snapshot = (await vscode.commands.executeCommand("nssWorkspaceAi.dev.snapshotState"));
        if (predicate(snapshot)) {
            return snapshot;
        }
        await delay(100);
    }
    throw new Error("Timed out waiting for NSS debug snapshot state.");
}
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
//# sourceMappingURL=runInHost.js.map