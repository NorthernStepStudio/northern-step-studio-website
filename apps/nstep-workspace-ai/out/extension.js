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
exports.activate = activate;
exports.deactivate = deactivate;
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const client_js_1 = require("./api/client.js");
const health_js_1 = require("./api/health.js");
const requestBuilder_js_1 = require("./api/requestBuilder.js");
const index_js_1 = require("./commands/index.js");
const commands_js_1 = require("./config/commands.js");
const registerDebugCommands_js_1 = require("./dev/registerDebugCommands.js");
const modes_js_1 = require("./config/modes.js");
const presets_js_1 = require("./config/presets.js");
const studioProjects_js_1 = require("./config/studioProjects.js");
const config_js_1 = require("./helpers/config.js");
const editor_js_1 = require("./helpers/editor.js");
const files_js_1 = require("./helpers/files.js");
const notifications_js_1 = require("./helpers/notifications.js");
const paths_js_1 = require("./helpers/paths.js");
const prompts_js_1 = require("./helpers/prompts.js");
const text_js_1 = require("./helpers/text.js");
const time_js_1 = require("./helpers/time.js");
const workspace_js_1 = require("./helpers/workspace.js");
const codebaseSearchService_js_1 = require("./services/codebase/codebaseSearchService.js");
const errorFileService_js_1 = require("./services/codebase/errorFileService.js");
const projectTreeService_js_1 = require("./services/codebase/projectTreeService.js");
const relatedFilesService_js_1 = require("./services/codebase/relatedFilesService.js");
const searchIndexingService_js_1 = require("./services/codebase/searchIndexingService.js");
const schemaDiscoveryService_js_1 = require("./services/codebase/schemaDiscoveryService.js");
const documentationDiscoveryService_js_1 = require("./services/codebase/documentationDiscoveryService.js");
const dependencyAnalysisService_js_1 = require("./services/codebase/dependencyAnalysisService.js");
const operationalDiscoveryService_js_1 = require("./services/codebase/operationalDiscoveryService.js");
const apiDiscoveryService_js_1 = require("./services/codebase/apiDiscoveryService.js");
const compareTaskResultsService_js_1 = require("./services/diagnostics/compareTaskResultsService.js");
const diagnosticService_js_1 = require("./services/diagnostics/diagnosticService.js");
const repairTrailService_js_1 = require("./services/diagnostics/repairTrailService.js");
const knowledgePackService_js_1 = require("./services/knowledge/knowledgePackService.js");
const knowledgeSearchService_js_1 = require("./services/knowledge/knowledgeSearchService.js");
const workspaceBriefingService_js_1 = require("./services/knowledge/workspaceBriefingService.js");
const buildFoundationService_js_1 = require("./services/foundation/buildFoundationService.js");
const buildContextService_js_1 = require("./services/foundation/buildContextService.js");
const projectRulesService_js_1 = require("./services/memory/projectRulesService.js");
const recurringFailureService_js_1 = require("./services/memory/recurringFailureService.js");
const repairPatternService_js_1 = require("./services/memory/repairPatternService.js");
const memoryRecallService_js_1 = require("./services/memory/memoryRecallService.js");
const workspaceMemoryService_js_1 = require("./services/memory/workspaceMemoryService.js");
const memoryCommands_js_1 = require("./commands/memoryCommands.js");
const applyService_js_1 = require("./services/review/applyService.js");
const diffService_js_1 = require("./services/review/diffService.js");
const reviewService_js_1 = require("./services/review/reviewService.js");
const staleCheckService_js_1 = require("./services/review/staleCheckService.js");
const dashboardService_js_1 = require("./services/studio/dashboardService.js");
const modeService_js_1 = require("./services/studio/modeService.js");
const nextWorkService_js_1 = require("./services/studio/nextWorkService.js");
const presetService_js_1 = require("./services/studio/presetService.js");
const roadmapService_js_1 = require("./services/studio/roadmapService.js");
const studioProjectService_js_1 = require("./services/studio/studioProjectService.js");
const taskExplainService_js_1 = require("./services/tasks/taskExplainService.js");
const taskFailureService_js_1 = require("./services/tasks/taskFailureService.js");
const taskRunnerService_js_1 = require("./services/tasks/taskRunnerService.js");
const workflowService_js_1 = require("./services/workflow/workflowService.js");
const workflowDefinitions_js_1 = require("./services/workflow/workflowDefinitions.js");
const sidebarProvider_js_1 = require("./sidebar/sidebarProvider.js");
const diagnosticState_js_1 = require("./state/diagnosticState.js");
const knowledgeState_js_1 = require("./state/knowledgeState.js");
const memoryState_js_1 = require("./state/memoryState.js");
const modeState_js_1 = require("./state/modeState.js");
const presetState_js_1 = require("./state/presetState.js");
const projectState_js_1 = require("./state/projectState.js");
const reviewState_js_1 = require("./state/reviewState.js");
const store_js_1 = require("./state/store.js");
const taskState_js_1 = require("./state/taskState.js");
const uiState_js_1 = require("./state/uiState.js");
const workflowState_js_1 = require("./state/workflowState.js");
const eventTracker_js_1 = require("./state/eventTracker.js");
const snapshotHelper_js_1 = require("./helpers/snapshotHelper.js");
class NssWorkspaceAiController {
    store;
    outputChannel = vscode.window.createOutputChannel("NSS Workspace AI");
    sidebar;
    constructor(store) {
        this.store = store;
    }
    dispose() {
        this.outputChannel.dispose();
    }
    bindSidebar(sidebar) {
        this.sidebar = sidebar;
    }
    async initialize() {
        const workspacePath = (0, workspace_js_1.getPrimaryWorkspaceFolder)()?.uri.fsPath;
        const config = (0, config_js_1.getRuntimeConfig)();
        this.outputChannel.appendLine(`[NSS] Initializing with workspace: ${workspacePath ?? "none"}`);
        this.outputChannel.appendLine(`[NSS] Server URL: ${config.serverUrl} (source: ${config.serverUrlSource})`);
        await this.store.initialize();
        await this.store.update((draft) => {
            draft.mode = (0, modeState_js_1.resolveModeSelection)(draft.mode, config.defaultMode);
            draft.presetId = (0, presetState_js_1.resolvePresetSelection)(draft.presetId, workspacePath, config.autoSuggestPresetForWorkspace);
            draft.studioProjectId = (0, projectState_js_1.resolveStudioProjectSelection)(draft.studioProjectId, workspacePath, config.autoSuggestPresetForWorkspace);
        });
        try {
            this.outputChannel.appendLine("[NSS] Probing backend health...");
            const serverHealth = await probeWorkspaceServerHealth();
            this.outputChannel.appendLine(`[NSS] Backend health: ${serverHealth.status} (${serverHealth.mode} mode)`);
            await this.store.update((draft) => {
                draft.serverHealth = serverHealth;
            });
            if (serverHealth.mode === "mock") {
                this.outputChannel.appendLine("[NSS] WARNING: Server is in MOCK mode. Real AI features are disabled.");
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`[NSS] ERROR: Health probe failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Initialize event tracking
        this.registerEventListeners();
    }
    registerEventListeners() {
        // Track file opens
        vscode.workspace.onDidOpenTextDocument((doc) => {
            eventTracker_js_1.eventTracker.track("file_opened", { path: vscode.workspace.asRelativePath(doc.uri) });
        });
        vscode.workspace.onDidSaveTextDocument((doc) => {
            (0, searchIndexingService_js_1.clearWorkspaceSearchIndex)();
            eventTracker_js_1.eventTracker.track("file_saved", { path: vscode.workspace.asRelativePath(doc.uri) });
        });
        // Track active editor changes
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                eventTracker_js_1.eventTracker.track("active_editor_changed", { path: vscode.workspace.asRelativePath(editor.document.uri) });
            }
        });
    }
    async getSidebarViewModel() {
        const state = this.store.snapshot();
        const editor = vscode.window.activeTextEditor;
        const selection = editor ? (0, editor_js_1.getTrimmedSelection)(editor) : "";
        const activeReview = this.getActiveReview(state.reviewItems, state.activeReviewId);
        const lastTask = (0, taskState_js_1.getLastTask)(state.taskHistory);
        const activeDiagnostic = this.getActiveDiagnosticSession(state.diagnosticSessions, state.activeDiagnosticSessionId);
        const reviewCounts = (0, reviewState_js_1.getReviewCounts)(state.reviewItems);
        return {
            title: "NSS Workspace AI",
            workspaceName: (0, workspace_js_1.getWorkspaceName)(),
            serverStatus: (0, uiState_js_1.getServerStatusLabel)(state.serverHealth),
            serverMode: state.serverHealth.mode ?? "unknown",
            serverDetail: state.serverHealth.detail,
            modeTitle: (0, modeService_js_1.getModeTitle)(state.mode),
            presetTitle: (0, presetService_js_1.getPresetTitle)(state.presetId),
            studioProjectTitle: (0, studioProjectService_js_1.getStudioProjectTitle)(state.studioProjectId),
            currentFilePath: editor ? (0, paths_js_1.toWorkspaceRelativePath)(editor.document.uri) : undefined,
            currentSelectionPreview: selection ? (0, text_js_1.truncateText)(selection, 240) : undefined,
            latestResponse: state.latestResponse
                ? {
                    title: state.latestResponse.title,
                    excerpt: (0, text_js_1.truncateText)(state.latestResponse.body, 160),
                    createdAt: (0, time_js_1.formatTimestamp)(state.latestResponse.createdAt),
                    kind: state.latestResponse.kind,
                    proposedMemories: state.latestResponse.proposedMemories?.map((m) => ({
                        content: m.content,
                        tags: m.tags,
                    })),
                }
                : undefined,
            activeProposal: activeReview
                ? {
                    title: activeReview.title,
                    summary: (0, text_js_1.truncateText)(activeReview.summary, 240),
                    targetPath: activeReview.targetPath,
                    canApply: (0, reviewService_js_1.canApplyReviewItem)(activeReview),
                }
                : undefined,
            lastTask: lastTask
                ? {
                    label: `${lastTask.kind} (${lastTask.status})`,
                    status: lastTask.status,
                    summary: (0, text_js_1.truncateText)(lastTask.summary, 160),
                }
                : undefined,
            activeWorkflow: state.activeWorkflow
                ? {
                    title: state.activeWorkflow.title,
                    step: (0, workflowState_js_1.getActiveWorkflowStep)(state.activeWorkflow) ?? "Complete",
                }
                : undefined,
            activeDiagnostic: activeDiagnostic
                ? {
                    title: activeDiagnostic.title,
                    status: activeDiagnostic.status,
                }
                : undefined,
            reviewCounts,
            persistentMemories: state.persistentMemories
                .filter((m) => m.projectId === state.studioProjectId)
                .map((m) => ({
                id: m.id,
                content: (0, text_js_1.truncateText)(m.content, 120),
                tags: m.tags,
            })),
            quickActions: (0, commands_js_1.buildSidebarQuickActions)({
                mode: state.mode,
                hasActiveReview: Boolean(activeReview),
                hasFailedTask: lastTask?.status === "failed",
                hasActiveWorkflow: Boolean(state.activeWorkflow),
                hasActiveDiagnostic: Boolean(activeDiagnostic),
            }),
        };
    }
    getDebugSnapshot() {
        const state = this.store.snapshot();
        const activeReview = this.getActiveReview(state.reviewItems, state.activeReviewId);
        return {
            serverHealth: state.serverHealth,
            mode: state.mode,
            presetId: state.presetId,
            studioProjectId: state.studioProjectId,
            currentFilePath: vscode.window.activeTextEditor?.document.uri.fsPath,
            latestResponse: state.latestResponse
                ? {
                    title: state.latestResponse.title,
                    body: state.latestResponse.body,
                    kind: state.latestResponse.kind,
                    sourceCommand: state.latestResponse.sourceCommand,
                }
                : undefined,
            activeReview: activeReview
                ? {
                    title: activeReview.title,
                    status: activeReview.status,
                    targetPath: activeReview.targetPath,
                    hasProposedText: (0, reviewService_js_1.canApplyReviewItem)(activeReview),
                }
                : undefined,
            reviewItemCount: state.reviewItems.length,
        };
    }
    async handleSidebarAction(message) {
        switch (message.command) {
            case "nssWorkspaceAi.askWorkspaceAi":
                await this.askWorkspaceAi(message.prompt, message.agentId);
                break;
            case "nssWorkspaceAi.approveProposedMemory":
                if (message.memory && typeof message.index === "number") {
                    await this.approveProposedMemory(message.memory, message.index);
                }
                break;
            case "nssWorkspaceAi.editProposedMemory":
                if (message.memory && typeof message.index === "number") {
                    await this.editProposedMemory(message.memory, message.index);
                }
                break;
            case "nssWorkspaceAi.editMemory":
                if (message.memory) {
                    await this.editMemory(message.memory);
                }
                break;
            case "nssWorkspaceAi.forgetMemory":
                if (message.memory) {
                    await this.forgetMemory(message.memory);
                }
                break;
            case "nssWorkspaceAi.refreshSidebar":
                await this.refreshSidebar();
                break;
            case "nssWorkspaceAi.searchCodebase":
                if (message.prompt) {
                    const keywords = (0, searchIndexingService_js_1.extractKeywords)(message.prompt);
                    const results = await (0, searchIndexingService_js_1.searchCodebaseKeywords)(keywords);
                    await this.sidebar?.postSearchResults(results);
                }
                break;
            case "vscode.open":
                if (message.path) {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                    if (workspaceFolder) {
                        const uri = vscode.Uri.joinPath(workspaceFolder.uri, message.path);
                        await vscode.commands.executeCommand("vscode.open", uri);
                    }
                }
                break;
            case "nss.previewActiveProposal":
                await this.previewActiveProposal();
                break;
            default:
                await vscode.commands.executeCommand(message.command, message);
                break;
        }
    }
    async refreshSidebar() {
        await this.sidebar?.refresh();
    }
    async openSidebar() {
        await this.sidebar?.reveal();
    }
    async askWorkspaceAi(promptFromSidebar, preferredAgentId) {
        const prompt = promptFromSidebar ??
            (await vscode.window.showInputBox({
                prompt: "Ask NSS about the current workspace",
                placeHolder: "What do you want NSS to help with?",
            }));
        if (!prompt) {
            return;
        }
        await this.runBackendCommand({
            commandId: "nssWorkspaceAi.askWorkspaceAi",
            intent: "ask",
            prompt,
            responseTitle: "NSS Response",
            responseKind: "answer",
            preferredAgentId,
        });
    }
    async explainThisFile() {
        const editor = (0, editor_js_1.requireActiveEditor)();
        await this.runBackendCommand({
            commandId: "nssWorkspaceAi.explainThisFile",
            intent: "explain-file",
            prompt: "Explain this file clearly, including its role, structure, and anything risky or confusing.",
            responseTitle: `Explain ${path.basename(editor.document.uri.fsPath)}`,
            responseKind: "analysis",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
        });
    }
    async generateFromSelection() {
        const editor = (0, editor_js_1.requireActiveEditor)();
        const selection = (0, editor_js_1.getTrimmedSelection)(editor);
        if (!selection) {
            throw new Error("Select some text before running Generate From Selection.");
        }
        const prompt = await vscode.window.showInputBox({
            prompt: "What should NSS generate from the current selection?",
            placeHolder: "Example: rewrite this into a clearer helper function",
        });
        if (!prompt) {
            return;
        }
        await this.runBackendCommand({
            commandId: "nssWorkspaceAi.generateFromSelection",
            intent: "generate-from-selection",
            prompt,
            responseTitle: "Generated From Selection",
            responseKind: "generation",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
        });
    }
    async askAboutCurrentFile() {
        const editor = (0, editor_js_1.requireActiveEditor)();
        const prompt = await vscode.window.showInputBox({
            prompt: "What do you want NSS to answer about the current file?",
            placeHolder: "Ask a focused question about this file",
        });
        if (!prompt) {
            return;
        }
        await this.runBackendCommand({
            commandId: "nssWorkspaceAi.askAboutCurrentFile",
            intent: "ask-current-file",
            prompt,
            responseTitle: `Ask About ${path.basename(editor.document.uri.fsPath)}`,
            responseKind: "analysis",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
        });
    }
    async explainProjectStructure() {
        const workspaceFolder = (0, workspace_js_1.getPrimaryWorkspaceFolder)();
        if (!workspaceFolder) {
            throw new Error("Open a workspace folder before asking NSS to explain the project structure.");
        }
        const structureSummary = await (0, projectTreeService_js_1.buildProjectStructureSummary)(workspaceFolder);
        await this.runBackendCommand({
            commandId: "nssWorkspaceAi.explainProjectStructure",
            intent: "explain-project-structure",
            prompt: "Explain this project's structure and the likely purpose of the main folders.",
            responseTitle: "Project Structure",
            responseKind: "analysis",
            project: { structureSummary },
        });
    }
    async proposeEditForCurrentFile() {
        const editor = (0, editor_js_1.requireActiveEditor)();
        const prompt = await vscode.window.showInputBox({
            prompt: "What edit should NSS propose for the current file?",
            placeHolder: "Describe the change you want reviewed before applying",
        });
        if (!prompt) {
            return;
        }
        const result = await this.runBackendCommand({
            commandId: "nssWorkspaceAi.proposeEditForCurrentFile",
            intent: "propose-edit",
            prompt,
            responseTitle: `Proposed Edit: ${path.basename(editor.document.uri.fsPath)}`,
            responseKind: "proposal",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
        });
        if (!result) {
            return;
        }
        const activeFile = (0, files_js_1.buildActiveFileSnapshot)(editor);
        await this.queueReviewItems([
            (0, reviewService_js_1.createReviewItem)({
                title: `Proposed Edit: ${path.basename(editor.document.uri.fsPath)}`,
                prompt,
                targetPath: (0, paths_js_1.toWorkspaceRelativePath)(editor.document.uri),
                originalText: activeFile.content,
                responseText: result.record.body,
                proposedText: result.response.proposedText,
                sourceResponseId: result.record.id,
            }),
        ]);
    }
    async applyProposedEditToActiveFile() {
        const state = this.store.snapshot();
        const reviewItem = this.getActiveReview(state.reviewItems, state.activeReviewId);
        if (!reviewItem) {
            throw new Error("There is no active proposed edit to apply.");
        }
        if (!(0, reviewService_js_1.canApplyReviewItem)(reviewItem)) {
            await (0, notifications_js_1.openMarkdownPreview)(reviewItem.title, reviewItem.previewMarkdown);
            throw new Error("The current proposal is preview-only because the backend did not return a concrete file body.");
        }
        const editor = (0, editor_js_1.requireActiveEditor)();
        const confirm = await vscode.window.showWarningMessage(`Replace the active file with the proposed edit for ${reviewItem.targetPath}?`, { modal: true }, "Apply Proposed Edit");
        if (confirm !== "Apply Proposed Edit") {
            return;
        }
        await (0, applyService_js_1.applyReviewItemToActiveFile)(editor, reviewItem);
        await this.store.update((draft) => {
            draft.reviewItems = draft.reviewItems.map((item) => item.id === reviewItem.id
                ? {
                    ...item,
                    status: "applied",
                    updatedAt: new Date().toISOString(),
                }
                : item);
        });
        await vscode.window.showInformationMessage("Applied the proposed edit to the active file.");
        await this.refreshSidebar();
    }
    async insertLatestResponseIntoCurrentFile() {
        const latestResponse = this.store.snapshot().latestResponse;
        if (!latestResponse) {
            throw new Error("There is no latest NSS response to insert.");
        }
        const editor = (0, editor_js_1.requireActiveEditor)();
        const confirm = await vscode.window.showWarningMessage("Insert the latest NSS response into the active file or current selection?", { modal: true }, "Insert Response");
        if (confirm !== "Insert Response") {
            return;
        }
        await (0, editor_js_1.insertTextIntoEditor)(editor, this.getWritableResponseText(latestResponse));
    }
    async createNewFileFromLatestResponse() {
        const latestResponse = this.store.snapshot().latestResponse;
        if (!latestResponse) {
            throw new Error("There is no latest NSS response to write into a new file.");
        }
        const workspaceFolder = (0, workspace_js_1.getPrimaryWorkspaceFolder)();
        if (!workspaceFolder) {
            throw new Error("Open a workspace folder before creating files from NSS responses.");
        }
        const relativePath = await vscode.window.showInputBox({
            prompt: "Enter the workspace-relative path for the new file",
            placeHolder: "Example: docs/nss-output.md",
        });
        if (!relativePath) {
            return;
        }
        const segments = relativePath.split(/[\\/]+/).filter(Boolean);
        const targetUri = vscode.Uri.joinPath(workspaceFolder.uri, ...segments);
        const parentSegments = segments.slice(0, -1);
        const confirm = await vscode.window.showWarningMessage(`Create ${relativePath} from the latest NSS response?`, { modal: true }, "Create File");
        if (confirm !== "Create File") {
            return;
        }
        try {
            await vscode.workspace.fs.stat(targetUri);
            throw new Error(`The file ${relativePath} already exists.`);
        }
        catch (error) {
            if (!(error instanceof vscode.FileSystemError)) {
                throw error;
            }
        }
        if (parentSegments.length > 0) {
            await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(workspaceFolder.uri, ...parentSegments));
        }
        await vscode.workspace.fs.writeFile(targetUri, Buffer.from(this.getWritableResponseText(latestResponse), "utf8"));
        const document = await vscode.workspace.openTextDocument(targetUri);
        await vscode.window.showTextDocument(document, { preview: false });
    }
    async searchCodebaseCommand() {
        const query = await vscode.window.showInputBox({
            prompt: "Search the current workspace codebase",
            placeHolder: "Enter a string to search for",
        });
        if (!query) {
            return;
        }
        const results = await (0, codebaseSearchService_js_1.searchCodebase)(query);
        const body = results.length > 0
            ? results.map((result) => `- ${result.path}\n  ${result.preview}`).join("\n")
            : `No matches found for "${query}".`;
        await this.saveLocalResponse(this.createLocalResponseRecord("Codebase Search", body, "analysis", "nssWorkspaceAi.searchCodebase", query));
        await (0, notifications_js_1.openMarkdownPreview)("Codebase Search", body);
    }
    async findRelatedFilesCommand() {
        const editor = (0, editor_js_1.requireActiveEditor)();
        const results = await (0, relatedFilesService_js_1.findRelatedFiles)(editor.document.uri);
        const body = results.length > 0
            ? results.map((result) => `- ${result.path} (${result.reason})`).join("\n")
            : "No related files were found with the current heuristic.";
        await this.saveLocalResponse(this.createLocalResponseRecord("Related Files", body, "analysis", "nssWorkspaceAi.findRelatedFiles"));
        await (0, notifications_js_1.openMarkdownPreview)("Related Files", body);
    }
    async planChangeCommand() {
        const prompt = await vscode.window.showInputBox({
            prompt: "Describe the change you want to plan",
            placeHolder: "Example: add a safer approval flow for review items",
        });
        if (!prompt) {
            return;
        }
        const workspaceFolder = (0, workspace_js_1.getPrimaryWorkspaceFolder)();
        if (!workspaceFolder) {
            const activePath = vscode.window.activeTextEditor?.document.uri;
            const relatedFiles = activePath ? await (0, relatedFilesService_js_1.findRelatedFiles)(activePath, 6) : [];
            const lines = [
                `Requested change: ${prompt}`,
                "",
                "Suggested plan:",
                "- clarify the desired behavior and acceptance criteria",
                "- inspect the active file and nearby related files",
                "- draft the smallest safe implementation path",
                "- create or review a proposal before applying edits",
            ];
            if (relatedFiles.length > 0) {
                lines.push("", "Likely impacted files:", ...relatedFiles.map((file) => `- ${file.path}`));
            }
            const body = lines.join("\n");
            await this.saveLocalResponse(this.createLocalResponseRecord("Change Plan", body, "plan", "nssWorkspaceAi.planChange", prompt));
            await (0, notifications_js_1.openMarkdownPreview)("Change Plan", body);
            return;
        }
        const report = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "NSS Change Plan",
            cancellable: false,
        }, async () => (0, buildFoundationService_js_1.createBuildFoundationReport)({ goal: prompt, workspaceFolder }));
        const lines = [
            `Requested change: ${prompt}`,
            "",
            "Suggested build foundation:",
            `- Workspace kind: ${report.capabilityProfile.primaryKind}`,
            `- Scope: ${report.buildSpec.scope}`,
            `- Target: ${report.buildSpec.target}`,
            `- Template: ${report.plan.template.title}`,
            "",
            "Plan:",
            ...report.plan.steps.map((step, index) => `${index + 1}. ${step}`),
            "",
            "Likely impacted files:",
            ...report.relatedFiles.map((file) => `- ${file.path} (score ${file.score})`),
            "",
            "Next actions:",
            "- Review the build foundation report for the full capability profile and rollback notes.",
            "- Use the proposal flows for risky multi-file edits.",
            "- Re-run the change plan after the target scope is confirmed.",
        ];
        const body = lines.join("\n");
        await this.saveLocalResponse(this.createLocalResponseRecord("Change Plan", body, "plan", "nssWorkspaceAi.planChange", prompt));
        await (0, notifications_js_1.openMarkdownPreview)("Change Plan", body);
    }
    async runWorkspaceTaskCommand() {
        const taskKind = await (0, prompts_js_1.pickWorkspaceTaskKind)();
        if (!taskKind) {
            return;
        }
        await this.runTaskKind(taskKind);
    }
    async explainLastTaskFailure() {
        const lastTask = this.getLastTask();
        if (!lastTask) {
            throw new Error("No workspace task has been run yet.");
        }
        const body = (0, taskExplainService_js_1.explainTaskResult)(lastTask);
        await this.saveLocalResponse(this.createLocalResponseRecord("Last Task Failure", body, "task", "nssWorkspaceAi.explainLastTaskFailure"));
        await (0, notifications_js_1.openMarkdownPreview)("Last Task Failure", body);
    }
    async suggestFixForLastTaskFailure() {
        const lastTask = this.getLastTask();
        if (!lastTask) {
            throw new Error("No workspace task has been run yet.");
        }
        const fixes = (0, taskFailureService_js_1.suggestFixesForTaskFailure)(lastTask);
        const body = fixes.map((fix) => `- ${fix}`).join("\n");
        await this.saveLocalResponse(this.createLocalResponseRecord("Suggested Fixes", body, "task", "nssWorkspaceAi.suggestFixForLastTaskFailure"));
        await (0, notifications_js_1.openMarkdownPreview)("Suggested Fixes", body);
    }
    async rerunLastWorkspaceTask() {
        const lastTask = this.getLastTask();
        if (!lastTask) {
            throw new Error("No workspace task has been run yet.");
        }
        await this.runTaskKind(lastTask.kind);
    }
    async findLikelyErrorFiles() {
        const likelyFiles = await this.resolveLikelyErrorFiles();
        const picked = await vscode.window.showQuickPick(likelyFiles.map((file) => ({
            label: file,
        })), {
            placeHolder: "Likely error files from the last task",
        });
        if (!picked) {
            return;
        }
        const document = await vscode.workspace.openTextDocument(picked.label);
        await vscode.window.showTextDocument(document, { preview: false });
    }
    async askAboutErrorFileCommand() {
        const editor = await this.openLikelyErrorFileEditor();
        if (!editor) {
            return;
        }
        const prompt = await vscode.window.showInputBox({
            prompt: "What should NSS answer about this likely error file?",
            placeHolder: "Explain the failure source and the next safe debugging steps",
            value: "Explain the likely failure source in this file and the next safe debugging steps.",
        });
        if (!prompt) {
            return;
        }
        await this.runBackendCommand({
            commandId: "nssWorkspaceAi.askAboutErrorFile",
            intent: "ask-error-file",
            prompt,
            responseTitle: `Likely Error File: ${path.basename(editor.document.uri.fsPath)}`,
            responseKind: "analysis",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
            codebase: {
                likelyErrorFiles: this.getLastTask()?.likelyErrorFiles,
            },
        });
    }
    async proposeFixForErrorFileCommand() {
        const editor = await this.openLikelyErrorFileEditor();
        if (!editor) {
            return;
        }
        const prompt = await vscode.window.showInputBox({
            prompt: "What safe fix should NSS propose for this likely error file?",
            placeHolder: "Keep the proposal minimal, reviewable, and targeted to the failing code path",
            value: "Propose a minimal, reviewable fix for the failure in this file.",
        });
        if (!prompt) {
            return;
        }
        const result = await this.runBackendCommand({
            commandId: "nssWorkspaceAi.proposeFixForErrorFile",
            intent: "propose-error-file-fix",
            prompt,
            responseTitle: `Proposed Error Fix: ${path.basename(editor.document.uri.fsPath)}`,
            responseKind: "proposal",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
            codebase: {
                likelyErrorFiles: this.getLastTask()?.likelyErrorFiles,
            },
        });
        if (!result) {
            return;
        }
        await this.queueReviewItems([
            (0, reviewService_js_1.createReviewItem)({
                title: `Proposed Error Fix: ${path.basename(editor.document.uri.fsPath)}`,
                prompt,
                targetPath: (0, paths_js_1.toWorkspaceRelativePath)(editor.document.uri),
                originalText: editor.document.getText(),
                responseText: result.record.body,
                proposedText: result.response.proposedText,
                sourceResponseId: result.record.id,
            }),
        ]);
    }
    async proposeMultiFileChangeCommand() {
        const editor = (0, editor_js_1.requireActiveEditor)();
        const prompt = await vscode.window.showInputBox({
            prompt: "Describe the coordinated multi-file change you want NSS to propose",
            placeHolder: "Example: add a safer task-debug-review flow across the sidebar and review center",
        });
        if (!prompt) {
            return;
        }
        const relatedFiles = await (0, relatedFilesService_js_1.findRelatedFiles)(editor.document.uri, 4);
        const fileSnapshots = [
            (0, files_js_1.buildActiveFileSnapshot)(editor),
            ...(await Promise.all(relatedFiles.map((file) => (0, files_js_1.readFileSnapshot)(vscode.Uri.file(file.path))))),
        ];
        const targetFiles = fileSnapshots.map((snapshot) => (0, paths_js_1.toWorkspaceRelativePath)(vscode.Uri.file(snapshot.path)));
        const result = await this.runBackendCommand({
            commandId: "nssWorkspaceAi.proposeMultiFileChange",
            intent: "propose-multi-file-change",
            prompt: `${prompt}\n\nTarget files:\n${targetFiles.map((targetFile) => `- ${targetFile}`).join("\n")}`,
            responseTitle: `Multi-File Proposal: ${path.basename(editor.document.uri.fsPath)}`,
            responseKind: "proposal",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
            codebase: {
                relatedFiles: targetFiles.slice(1),
                searchSummary: relatedFiles.map((file) => `${(0, paths_js_1.toWorkspaceRelativePath)(vscode.Uri.file(file.path))} (${file.reason})`),
            },
        });
        if (!result) {
            return;
        }
        const reviewItems = fileSnapshots.map((snapshot, index) => (0, reviewService_js_1.createReviewItem)({
            title: `Multi-File Proposal: ${path.basename(snapshot.path)}`,
            prompt: `${prompt}\n\nFile focus: ${(0, paths_js_1.toWorkspaceRelativePath)(vscode.Uri.file(snapshot.path))}`,
            targetPath: (0, paths_js_1.toWorkspaceRelativePath)(vscode.Uri.file(snapshot.path)),
            originalText: snapshot.content,
            responseText: index === 0
                ? result.record.body
                : `${result.record.body}\n\nThis queued review item focuses on ${(0, paths_js_1.toWorkspaceRelativePath)(vscode.Uri.file(snapshot.path))}.`,
            proposedText: index === 0 ? result.response.proposedText : undefined,
            sourceResponseId: result.record.id,
        }));
        await this.queueReviewItems(reviewItems, `Queued ${reviewItems.length} review items for the multi-file proposal.`);
    }
    async startDiagnosticSession() {
        const lastTask = this.getLastTask();
        if (!lastTask) {
            throw new Error("Run a workspace task before starting a diagnostic session.");
        }
        const session = (0, diagnosticService_js_1.startDiagnosticSessionFromTask)(lastTask);
        await this.store.update((draft) => {
            draft.diagnosticSessions = [session, ...draft.diagnosticSessions];
            draft.activeDiagnosticSessionId = session.id;
        });
        await (0, notifications_js_1.openMarkdownPreview)(session.title, (0, repairTrailService_js_1.buildRepairTrail)(session, [lastTask]));
        await this.refreshSidebar();
    }
    async viewActiveDiagnosticSession() {
        const state = this.store.snapshot();
        const session = this.getActiveDiagnosticSession(state.diagnosticSessions, state.activeDiagnosticSessionId);
        if (!session) {
            throw new Error("There is no active diagnostic session.");
        }
        const body = (0, repairTrailService_js_1.buildRepairTrail)(session, state.taskHistory);
        await (0, notifications_js_1.openMarkdownPreview)(session.title, body);
    }
    async addNoteToSession() {
        const state = this.store.snapshot();
        const session = this.getActiveDiagnosticSession(state.diagnosticSessions, state.activeDiagnosticSessionId);
        if (!session) {
            throw new Error("There is no active diagnostic session.");
        }
        const note = await vscode.window.showInputBox({
            prompt: "Add a note to the active diagnostic session",
        });
        if (!note) {
            return;
        }
        await this.store.update((draft) => {
            draft.diagnosticSessions = draft.diagnosticSessions.map((item) => item.id === session.id ? (0, diagnosticService_js_1.addNoteToDiagnosticSession)(item, note) : item);
        });
        await this.refreshSidebar();
    }
    async compareLastTwoResultsCommand() {
        const state = this.store.snapshot();
        if (state.taskHistory.length < 2) {
            throw new Error("NSS needs at least two task runs to compare results.");
        }
        const body = (0, compareTaskResultsService_js_1.compareTaskResults)(state.taskHistory[1], state.taskHistory[0]);
        await (0, notifications_js_1.openMarkdownPreview)("Compare Last Two Task Results", body);
    }
    async resolveSession() {
        await this.closeActiveDiagnosticSession("resolved");
    }
    async abandonSession() {
        await this.closeActiveDiagnosticSession("abandoned");
    }
    async addProjectRuleCommand() {
        const rule = await vscode.window.showInputBox({
            prompt: "Add a project rule for the active studio project",
            placeHolder: "Example: prefer review approval before file-wide apply",
        });
        if (!rule) {
            return;
        }
        const state = this.store.snapshot();
        const projectRule = (0, projectRulesService_js_1.createProjectRule)(state.studioProjectId, rule);
        await this.store.update((draft) => {
            draft.projectRules = [projectRule, ...draft.projectRules];
        });
    }
    async saveRepairPatternCommand() {
        const state = this.store.snapshot();
        const session = this.getActiveDiagnosticSession(state.diagnosticSessions, state.activeDiagnosticSessionId);
        if (!session) {
            throw new Error("There is no active diagnostic session to save as a repair pattern.");
        }
        const pattern = (0, repairPatternService_js_1.createRepairPattern)(state.studioProjectId, session);
        await this.store.update((draft) => {
            draft.repairPatterns = [pattern, ...draft.repairPatterns];
        });
        await vscode.window.showInformationMessage(`Saved repair pattern "${pattern.title}".`);
    }
    async recallSimilarFailureCommand() {
        const state = this.store.snapshot();
        const query = this.getLastTask()?.summary ??
            (await vscode.window.showInputBox({
                prompt: "Describe the failure or symptom to recall",
            }));
        if (!query) {
            return;
        }
        const recurring = (0, recurringFailureService_js_1.recallSimilarFailure)(state.recurringFailures, query);
        const matchingPattern = state.repairPatterns.find((pattern) => pattern.symptom.toLowerCase().includes(query.toLowerCase()));
        const lines = [
            recurring ? `Recurring failure: ${recurring.summary}` : "No recurring failure matched.",
            matchingPattern ? `Repair pattern: ${matchingPattern.title} -> ${matchingPattern.fix}` : "No repair pattern matched.",
        ];
        await (0, notifications_js_1.openMarkdownPreview)("Recall Similar Failure", lines.join("\n\n"));
    }
    async clearWorkspaceMemoryCommand() {
        const confirm = await vscode.window.showWarningMessage("Clear project rules, repair patterns, recurring failures, and roadmap notes for NSS Workspace AI?", { modal: true }, "Clear Memory");
        if (confirm !== "Clear Memory") {
            return;
        }
        await this.store.update((draft) => {
            (0, memoryState_js_1.clearWorkspaceMemory)(draft);
        });
        await this.refreshSidebar();
    }
    async switchModeCommand() {
        const picked = await vscode.window.showQuickPick(modes_js_1.NSS_MODES.map((mode) => ({ label: mode.title, id: mode.id })), { placeHolder: "Choose an NSS mode" });
        if (!picked) {
            return;
        }
        await this.store.update((draft) => {
            draft.mode = picked.id;
        });
        await this.refreshSidebar();
    }
    async showModeDetailsCommand() {
        const state = this.store.snapshot();
        await (0, notifications_js_1.openMarkdownPreview)((0, modeService_js_1.getModeTitle)(state.mode), (0, modeService_js_1.getModeDetails)(state.mode));
    }
    async runWorkflowCommand() {
        const picked = await vscode.window.showQuickPick(workflowDefinitions_js_1.WORKFLOW_DEFINITIONS.map((workflow) => ({
            label: workflow.title,
            description: workflow.description,
            id: workflow.id,
        })), { placeHolder: "Choose an NSS workflow" });
        if (!picked) {
            return;
        }
        const definition = (0, workflowDefinitions_js_1.getWorkflowDefinition)(picked.id);
        if (!definition) {
            return;
        }
        await this.store.update((draft) => {
            draft.activeWorkflow = (0, workflowService_js_1.startWorkflow)(definition);
        });
        await this.refreshSidebar();
    }
    async nextWorkflowStepCommand() {
        const state = this.store.snapshot();
        if (!state.activeWorkflow) {
            throw new Error("There is no active workflow.");
        }
        await this.store.update((draft) => {
            if (draft.activeWorkflow) {
                draft.activeWorkflow = (0, workflowDefinitions_js_1.advanceWorkflowRun)(draft.activeWorkflow);
            }
        });
        await this.refreshSidebar();
    }
    async cancelWorkflowCommand() {
        const state = this.store.snapshot();
        if (!state.activeWorkflow) {
            throw new Error("There is no active workflow.");
        }
        await this.store.update((draft) => {
            if (draft.activeWorkflow) {
                draft.activeWorkflow = (0, workflowService_js_1.cancelWorkflow)(draft.activeWorkflow);
            }
        });
        await this.refreshSidebar();
    }
    async showWorkflowsCommand() {
        const body = workflowDefinitions_js_1.WORKFLOW_DEFINITIONS.map((workflow) => `- ${workflow.title}: ${workflow.description}`).join("\n");
        await (0, notifications_js_1.openMarkdownPreview)("Available Workflows", body);
    }
    async switchPresetCommand() {
        const picked = await vscode.window.showQuickPick(presets_js_1.NSS_PRESETS.map((preset) => ({ label: preset.title, id: preset.id })), { placeHolder: "Choose an NSS preset" });
        if (!picked) {
            return;
        }
        await this.store.update((draft) => {
            draft.presetId = picked.id;
        });
        await this.refreshSidebar();
    }
    async showPresetCommand() {
        const state = this.store.snapshot();
        await (0, notifications_js_1.openMarkdownPreview)("Current Preset", (0, presetService_js_1.getPresetTitle)(state.presetId));
    }
    async suggestPresetCommand() {
        const pathHint = vscode.window.activeTextEditor?.document.uri.fsPath ?? (0, workspace_js_1.getPrimaryWorkspaceFolder)()?.uri.fsPath;
        const suggestedPreset = (0, workspace_js_1.inferPresetIdFromPath)(pathHint);
        await this.store.update((draft) => {
            draft.presetId = suggestedPreset;
        });
        await vscode.window.showInformationMessage(`Suggested preset: ${(0, presetService_js_1.getPresetTitle)(suggestedPreset)}.`);
        await this.refreshSidebar();
    }
    async rebuildKnowledgePacksCommand() {
        const state = this.store.snapshot();
        const knowledgeItems = await (0, knowledgePackService_js_1.rebuildKnowledgePacks)(state.presetId);
        await this.store.update((draft) => {
            draft.knowledgeItems = knowledgeItems;
        });
        await vscode.window.showInformationMessage(`Rebuilt ${knowledgeItems.length} knowledge pack item(s).`);
    }
    async showBriefingCommand() {
        const state = this.store.snapshot();
        const body = (0, workspaceBriefingService_js_1.buildWorkspaceBriefing)({
            workspaceName: (0, workspace_js_1.getWorkspaceName)(),
            modeTitle: (0, modeService_js_1.getModeTitle)(state.mode),
            presetTitle: (0, presetService_js_1.getPresetTitle)(state.presetId),
            projectTitle: (0, studioProjectService_js_1.getStudioProjectTitle)(state.studioProjectId),
            projectRules: (0, projectRulesService_js_1.listProjectRulesForProject)(state.projectRules, state.studioProjectId),
            knowledgeItems: state.knowledgeItems,
            roadmapNotes: (0, roadmapService_js_1.listRoadmapNotes)(state.roadmapNotes, state.studioProjectId),
        });
        await (0, notifications_js_1.openMarkdownPreview)("Workspace Briefing", body);
    }
    async searchKnowledgeCommand() {
        const query = await vscode.window.showInputBox({
            prompt: "Search NSS knowledge packs",
        });
        if (!query) {
            return;
        }
        const state = this.store.snapshot();
        const results = (0, knowledgeSearchService_js_1.searchKnowledgeItems)(state.knowledgeItems, query);
        const body = results.length > 0
            ? results.map((item) => `- ${item.title}\n  ${item.path}\n  ${item.excerpt}`).join("\n")
            : `No knowledge items matched "${query}".`;
        await (0, notifications_js_1.openMarkdownPreview)("Knowledge Search", body);
    }
    async openReviewCenterCommand() {
        const state = this.store.snapshot();
        const body = state.reviewItems.length > 0
            ? state.reviewItems
                .map((item) => `- ${item.title} (${item.status}${item.stale ? ", stale" : ""}) -> ${item.targetPath}`)
                .join("\n")
            : "No review items yet.";
        await (0, notifications_js_1.openMarkdownPreview)("Review Center", body);
    }
    async previewReviewItemCommand() {
        const reviewItem = this.requireActiveReview();
        await (0, notifications_js_1.openMarkdownPreview)(reviewItem.title, reviewItem.previewMarkdown);
    }
    async showDiffForReviewItemCommand() {
        const reviewItem = this.requireActiveReview();
        await (0, diffService_js_1.showReviewDiff)(reviewItem);
    }
    async approveReviewItemCommand() {
        const reviewItem = this.requireActiveReview();
        await this.store.update((draft) => {
            draft.reviewItems = draft.reviewItems.map((item) => item.id === reviewItem.id ? (0, reviewService_js_1.approveReviewItem)(item) : item);
        });
        await this.refreshSidebar();
    }
    async rejectReviewItemCommand() {
        const reviewItem = this.requireActiveReview();
        await this.store.update((draft) => {
            draft.reviewItems = draft.reviewItems.map((item) => item.id === reviewItem.id ? (0, reviewService_js_1.rejectReviewItem)(item) : item);
        });
        await this.refreshSidebar();
    }
    async applyApprovedItemCommand() {
        await this.applyReviewItemToFileCommand();
    }
    async applyReviewItemToSelectionCommand() {
        const reviewItem = this.requireActiveReview();
        await this.ensureReviewReadyForApply(reviewItem);
        const editor = (0, editor_js_1.requireActiveEditor)();
        await (0, applyService_js_1.applyReviewItemToSelection)(editor, reviewItem);
        await this.markReviewItemApplied(reviewItem.id);
    }
    async applyReviewItemToFileCommand() {
        const reviewItem = this.requireActiveReview();
        await this.ensureReviewReadyForApply(reviewItem);
        const editor = (0, editor_js_1.requireActiveEditor)();
        await (0, applyService_js_1.applyReviewItemToActiveFile)(editor, reviewItem);
        await this.markReviewItemApplied(reviewItem.id);
    }
    async refreshReviewItemAgainstCurrentFileCommand() {
        const reviewItem = this.requireActiveReview();
        const editor = (0, editor_js_1.requireActiveEditor)();
        const result = await this.runBackendCommand({
            commandId: "nss.refreshReviewItemAgainstCurrentFile",
            intent: "review-refresh",
            prompt: reviewItem.prompt,
            responseTitle: reviewItem.title,
            responseKind: "proposal",
            activeFile: (0, files_js_1.buildActiveFileSnapshot)(editor),
        });
        if (!result) {
            return;
        }
        const refreshed = (0, reviewService_js_1.createReviewItem)({
            title: reviewItem.title,
            prompt: reviewItem.prompt,
            targetPath: reviewItem.targetPath,
            originalText: editor.document.getText(),
            responseText: result.record.body,
            proposedText: result.response.proposedText,
            sourceResponseId: result.record.id,
        });
        await this.store.update((draft) => {
            draft.reviewItems = draft.reviewItems.map((item) => (item.id === reviewItem.id ? refreshed : item));
            draft.activeReviewId = refreshed.id;
        });
        await (0, notifications_js_1.openMarkdownPreview)(refreshed.title, refreshed.previewMarkdown);
    }
    async switchActiveStudioProjectCommand() {
        const picked = await vscode.window.showQuickPick(studioProjects_js_1.STUDIO_PROJECTS.map((project) => ({
            label: project.title,
            description: project.description,
            id: project.id,
        })), { placeHolder: "Choose the active studio project" });
        if (!picked) {
            return;
        }
        await this.store.update((draft) => {
            draft.studioProjectId = picked.id;
        });
        await this.refreshSidebar();
    }
    async showStudioDashboardCommand() {
        const state = this.store.snapshot();
        const body = (0, dashboardService_js_1.buildStudioDashboard)({
            workspaceName: (0, workspace_js_1.getWorkspaceName)(),
            modeTitle: (0, modeService_js_1.getModeTitle)(state.mode),
            presetTitle: (0, presetService_js_1.getPresetTitle)(state.presetId),
            projectTitle: (0, studioProjectService_js_1.getStudioProjectTitle)(state.studioProjectId),
            taskHistory: state.taskHistory,
            reviewItems: state.reviewItems,
            diagnosticSessions: state.diagnosticSessions,
            roadmapNotes: (0, roadmapService_js_1.listRoadmapNotes)(state.roadmapNotes, state.studioProjectId),
        });
        await (0, notifications_js_1.openMarkdownPreview)("Studio Dashboard", body);
    }
    async addRoadmapNoteCommand() {
        const note = await vscode.window.showInputBox({
            prompt: "Add a roadmap note for the active studio project",
        });
        if (!note) {
            return;
        }
        const state = this.store.snapshot();
        const roadmapNote = (0, roadmapService_js_1.createRoadmapNote)(state.studioProjectId, note);
        await this.store.update((draft) => {
            draft.roadmapNotes = [roadmapNote, ...draft.roadmapNotes];
        });
    }
    async showRoadmapNotesForActiveProjectCommand() {
        const state = this.store.snapshot();
        const notes = (0, roadmapService_js_1.listRoadmapNotes)(state.roadmapNotes, state.studioProjectId);
        const body = notes.length > 0 ? notes.map((note) => `- ${note.note} (${note.status})`).join("\n") : "No roadmap notes yet.";
        await (0, notifications_js_1.openMarkdownPreview)("Roadmap Notes", body);
    }
    async whatShouldIWorkOnNextCommand() {
        const state = this.store.snapshot();
        const suggestion = (0, nextWorkService_js_1.suggestNextWork)({
            reviewItems: state.reviewItems,
            diagnosticSessions: state.diagnosticSessions,
            taskHistory: state.taskHistory,
            roadmapNotes: (0, roadmapService_js_1.listRoadmapNotes)(state.roadmapNotes, state.studioProjectId),
        });
        await (0, notifications_js_1.openMarkdownPreview)("What Should I Work On Next?", suggestion);
    }
    async showCrossProjectSummaryCommand() {
        const state = this.store.snapshot();
        const body = studioProjects_js_1.STUDIO_PROJECTS.map((project) => {
            const roadmapCount = state.roadmapNotes.filter((note) => note.projectId === project.id).length;
            const ruleCount = state.projectRules.filter((rule) => rule.projectId === project.id).length;
            return `- ${project.title}: ${project.description} | roadmap ${roadmapCount} | rules ${ruleCount}`;
        }).join("\n");
        await (0, notifications_js_1.openMarkdownPreview)("Cross-Project Summary", body);
    }
    async suggestStudioProjectForWorkspaceCommand() {
        const pathHint = vscode.window.activeTextEditor?.document.uri.fsPath ?? (0, workspace_js_1.getPrimaryWorkspaceFolder)()?.uri.fsPath;
        const suggestedProject = (0, workspace_js_1.inferStudioProjectIdFromPath)(pathHint);
        await this.store.update((draft) => {
            draft.studioProjectId = suggestedProject;
        });
        await vscode.window.showInformationMessage(`Suggested studio project: ${(0, studioProjectService_js_1.getStudioProjectTitle)(suggestedProject)}.`);
        await this.refreshSidebar();
    }
    async showQuickStartCommand() {
        const body = [
            "1. Ask NSS from the sidebar or command palette.",
            "2. Explain the current file before editing.",
            "3. Search the codebase or find related files.",
            "4. Run a safe workspace task and inspect likely error files.",
            "5. Start a diagnostic session if a task fails.",
            "6. Rebuild knowledge packs and show the workspace briefing.",
            "7. Propose edits, approve them, and use the review center before applying.",
            "8. Use the studio dashboard and roadmap notes to manage cross-project work.",
        ].join("\n");
        await (0, notifications_js_1.openMarkdownPreview)("NSS Quick Start", body);
    }
    async showBuildFoundationCommand() {
        const workspaceFolder = (0, workspace_js_1.getPrimaryWorkspaceFolder)();
        if (!workspaceFolder) {
            throw new Error("Open a workspace folder before using the build foundation report.");
        }
        const goal = await vscode.window.showInputBox({
            prompt: "What do you want NSS to help build or plan?",
            placeHolder: "Example: add a reusable auth flow for the workspace",
            ignoreFocusOut: true,
        });
        if (!goal) {
            return;
        }
        const report = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "NSS Build Foundation",
            cancellable: false,
        }, async () => (0, buildFoundationService_js_1.createBuildFoundationReport)({ goal, workspaceFolder }));
        await this.saveLocalResponse(this.createLocalResponseRecord("Build Foundation", report.markdown, "plan", "nssWorkspaceAi.showBuildFoundation", goal));
        await (0, notifications_js_1.openMarkdownPreview)("Build Foundation", report.markdown);
    }
    async previewActiveProposal() {
        const state = this.store.snapshot();
        const reviewItem = this.getActiveReview(state.reviewItems, state.activeReviewId);
        if (!reviewItem) {
            throw new Error("There is no active proposal to preview.");
        }
        await (0, notifications_js_1.openMarkdownPreview)(reviewItem.title, reviewItem.previewMarkdown);
    }
    async runBackendCommand(options) {
        const state = this.store.snapshot();
        const workspaceFolder = (0, workspace_js_1.getPrimaryWorkspaceFolder)();
        const lastTask = (0, taskState_js_1.getLastTask)(state.taskHistory);
        const isStructuralIntent = [
            "propose-multi-file-change",
            "explain-project-structure",
            "change-plan",
            "propose-edit",
            "propose-error-file-fix",
        ].includes(options.intent);
        const needsBuildFoundation = ["change-plan", "propose-multi-file-change", "explain-project-structure"].includes(options.intent);
        eventTracker_js_1.eventTracker.track("backend_command_start", {
            commandId: options.commandId,
            intent: options.intent,
        });
        try {
            const { record, response } = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "NSS Workspace AI",
                cancellable: false,
            }, async (progress) => {
                progress.report({ message: "Searching codebase..." });
                const keywords = (0, searchIndexingService_js_1.extractKeywords)(options.prompt);
                const searchResults = await (0, searchIndexingService_js_1.searchCodebaseKeywords)(keywords);
                progress.report({ message: "Analyzing schemas..." });
                const schemas = isStructuralIntent ? await (0, schemaDiscoveryService_js_1.discoverProjectSchemas)() : [];
                progress.report({ message: "Reading documentation..." });
                const docs = isStructuralIntent ? await (0, documentationDiscoveryService_js_1.discoverProjectDocumentation)() : [];
                progress.report({ message: "Mapping dependencies..." });
                const dependencies = await (0, dependencyAnalysisService_js_1.analyzeProjectDependencies)();
                progress.report({ message: "Gathering operational context..." });
                const operations = isStructuralIntent ? await (0, operationalDiscoveryService_js_1.discoverOperationalConfig)() : [];
                progress.report({ message: "Mapping API endpoints..." });
                const apiRoutes = await (0, apiDiscoveryService_js_1.discoverApiRoutes)();
                progress.report({ message: "Preparing build foundation..." });
                const buildFoundation = needsBuildFoundation
                    ? await (0, buildFoundationService_js_1.createBuildFoundationReport)({ goal: options.prompt, workspaceFolder })
                    : undefined;
                const request = (0, requestBuilder_js_1.buildAskRequest)({
                    prompt: options.prompt,
                    intent: options.intent,
                    workspaceName: (0, workspace_js_1.getWorkspaceName)(),
                    workspacePath: workspaceFolder?.uri.fsPath,
                    preferredAgentId: options.preferredAgentId,
                    mode: state.mode,
                    presetId: state.presetId,
                    studioProjectId: state.studioProjectId,
                    activeFile: options.activeFile,
                    project: options.project,
                    memory: (0, workspaceMemoryService_js_1.buildWorkspaceMemoryContext)({
                        projectRules: state.projectRules,
                        repairPatterns: state.repairPatterns,
                        recurringFailures: state.recurringFailures,
                        persistentMemories: (0, memoryRecallService_js_1.recallRelevantMemories)(options.prompt, state.studioProjectId, state.persistentMemories),
                        projectId: state.studioProjectId,
                    }),
                    knowledge: (0, knowledgeState_js_1.getKnowledgeRequestItems)(state.knowledgeItems).map((item) => ({
                        title: item.title,
                        path: item.path,
                        excerpt: item.excerpt,
                    })),
                    task: options.task ??
                        (lastTask
                            ? {
                                commandLine: lastTask.commandLine,
                                exitCode: lastTask.exitCode,
                                stderr: lastTask.stderr,
                                summary: lastTask.summary,
                                likelyErrorFiles: lastTask.likelyErrorFiles,
                            }
                            : undefined),
                    codebase: {
                        ...(options.codebase ?? {}),
                        dependencies,
                        apiRoutes,
                        schemas,
                        docs,
                        operations,
                    },
                    codebaseSearchResults: searchResults,
                    build: buildFoundation ? (0, buildContextService_js_1.createBuildContext)(buildFoundation) : undefined,
                    workflow: state.activeWorkflow
                        ? {
                            title: state.activeWorkflow.title,
                            currentStep: state.activeWorkflow.steps[state.activeWorkflow.currentStepIndex] ?? "Complete",
                        }
                        : undefined,
                    events: eventTracker_js_1.eventTracker.getEvents(),
                    appSnapshot: workspaceFolder ? await (0, snapshotHelper_js_1.generateAppSnapshot)(workspaceFolder.uri.fsPath) : undefined,
                });
                progress.report({ message: "Consulting AI..." });
                const response = await (0, client_js_1.postAskRequest)((0, config_js_1.getRuntimeConfig)(), request);
                const record = this.createResponseRecord(options.responseTitle, response, options.responseKind, options.commandId, options.prompt);
                return { record, response };
            });
            await this.store.update((draft) => {
                draft.latestResponse = record;
                draft.responseHistory = [record, ...draft.responseHistory];
                draft.serverHealth = this.createServerHealth("online", "Last backend request succeeded.");
            });
            const proposalCount = record.proposedMemories?.length ?? 0;
            if (proposalCount > 0) {
                void vscode.window.setStatusBarMessage(`NSS: ${proposalCount} memory proposal${proposalCount === 1 ? "" : "s"} ready to review.`, 5000);
            }
            this.outputChannel.appendLine(`[${record.createdAt}] ${record.sourceCommand}`);
            this.outputChannel.appendLine(record.body);
            this.outputChannel.appendLine("");
            await this.openSidebar();
            await this.refreshSidebar();
            return { record, response };
        }
        catch (error) {
            await this.store.update((draft) => {
                draft.serverHealth = this.createServerHealth("offline", error instanceof Error ? error.message : "Backend request failed.");
            });
            await this.refreshSidebar();
            await vscode.window.showErrorMessage(error instanceof Error ? error.message : "NSS Workspace AI could not reach the backend.");
            return undefined;
        }
    }
    createResponseRecord(fallbackTitle, response, kind, sourceCommand, prompt) {
        return {
            id: `response-${Date.now()}`,
            title: response.title?.trim() || fallbackTitle,
            body: response.response,
            kind,
            sourceCommand,
            createdAt: new Date().toISOString(),
            prompt,
            proposedText: response.proposedText,
            preview: response.preview,
            proposedMemories: response.proposedMemories?.map((m) => ({
                content: m.content,
                tags: [...m.tags],
            })),
        };
    }
    createLocalResponseRecord(title, body, kind, sourceCommand, prompt) {
        return {
            id: `response-${Date.now()}`,
            title,
            body,
            kind,
            sourceCommand,
            createdAt: new Date().toISOString(),
            prompt,
        };
    }
    async approveProposedMemory(memory, index) {
        const state = this.store.snapshot();
        await this.store.update((draft) => {
            // Add to persistent memories
            draft.persistentMemories = [
                ...draft.persistentMemories,
                {
                    id: `mem-${Date.now()}`,
                    projectId: state.studioProjectId,
                    content: memory.content,
                    tags: [...memory.tags],
                    importance: 3, // Default importance
                    createdAt: new Date().toISOString(),
                },
            ];
            // Remove from proposed in latest response
            if (draft.latestResponse?.proposedMemories) {
                draft.latestResponse = {
                    ...draft.latestResponse,
                    proposedMemories: draft.latestResponse.proposedMemories.filter((_, i) => i !== index),
                };
            }
        });
        await this.refreshSidebar();
        void vscode.window.showInformationMessage("NSS: Memory saved to project bank.");
    }
    async editProposedMemory(memory, index) {
        const updated = await this.promptForMemoryDetails("Edit suggested memory", memory);
        if (!updated) {
            return;
        }
        await this.approveProposedMemory(updated, index);
    }
    async editMemory(memory) {
        const updated = await this.promptForMemoryDetails("Edit memory", memory);
        if (!updated) {
            return;
        }
        await this.store.update((draft) => {
            draft.persistentMemories = draft.persistentMemories.map((item) => item.id === memory.id || (!memory.id && item.content === memory.content)
                ? {
                    ...item,
                    content: updated.content,
                    tags: [...updated.tags],
                }
                : item);
        });
        await this.refreshSidebar();
        void vscode.window.showInformationMessage("NSS: Memory updated.");
    }
    async forgetMemory(memory) {
        await this.store.update((draft) => {
            draft.persistentMemories = draft.persistentMemories.filter((m) => m.id !== memory.id && m.content !== memory.content);
        });
        await this.refreshSidebar();
        void vscode.window.showInformationMessage("NSS: Memory removed from project bank.");
    }
    async promptForMemoryDetails(title, memory) {
        const content = await vscode.window.showInputBox({
            prompt: `${title} content`,
            value: memory.content,
            ignoreFocusOut: true,
        });
        if (content === undefined) {
            return undefined;
        }
        const tags = await vscode.window.showInputBox({
            prompt: `${title} tags`,
            placeHolder: "Comma-separated tags",
            value: memory.tags.join(", "),
            ignoreFocusOut: true,
        });
        if (tags === undefined) {
            return undefined;
        }
        return {
            content: content.trim(),
            tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        };
    }
    async saveLocalResponse(record) {
        await this.store.update((draft) => {
            draft.latestResponse = record;
            draft.responseHistory = [record, ...draft.responseHistory];
        });
        await this.openSidebar();
        await this.refreshSidebar();
    }
    async queueReviewItems(reviewItems, message) {
        const [firstReviewItem] = reviewItems;
        if (!firstReviewItem) {
            return;
        }
        await this.store.update((draft) => {
            draft.reviewItems = [...reviewItems, ...draft.reviewItems];
            draft.activeReviewId = firstReviewItem.id;
        });
        await (0, notifications_js_1.openMarkdownPreview)(firstReviewItem.title, firstReviewItem.previewMarkdown);
        if (message) {
            await vscode.window.showInformationMessage(message);
        }
        await this.refreshSidebar();
    }
    createServerHealth(status, detail) {
        return {
            status,
            detail,
            checkedAt: new Date().toISOString(),
        };
    }
    getActiveReview(reviewItems, activeReviewId) {
        return (0, reviewState_js_1.getActiveReview)(reviewItems, activeReviewId);
    }
    requireActiveReview() {
        const state = this.store.snapshot();
        const reviewItem = this.getActiveReview(state.reviewItems, state.activeReviewId);
        if (!reviewItem) {
            throw new Error("There is no active review item.");
        }
        return reviewItem;
    }
    getActiveDiagnosticSession(sessions, activeSessionId) {
        return (0, diagnosticState_js_1.getActiveDiagnosticSession)(sessions, activeSessionId);
    }
    getLastTask() {
        return (0, taskState_js_1.getLastTask)(this.store.snapshot().taskHistory);
    }
    async runTaskKind(kind) {
        const task = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `NSS running ${kind}`,
        }, async () => {
            return (0, taskRunnerService_js_1.runWorkspaceTask)(kind);
        });
        await this.store.update((draft) => {
            draft.taskHistory = [task, ...draft.taskHistory];
            const activeDiagnostic = this.getActiveDiagnosticSession(draft.diagnosticSessions, draft.activeDiagnosticSessionId);
            if (activeDiagnostic && activeDiagnostic.status === "active") {
                draft.diagnosticSessions = draft.diagnosticSessions.map((session) => session.id === activeDiagnostic.id ? (0, diagnosticService_js_1.attachTaskToDiagnosticSession)(session, task) : session);
            }
            if (task.status === "failed") {
                draft.recurringFailures = [(0, recurringFailureService_js_1.createRecurringFailure)(draft.studioProjectId, task.summary), ...draft.recurringFailures];
            }
        });
        await this.saveLocalResponse(this.createLocalResponseRecord(`Task: ${kind}`, (0, taskExplainService_js_1.explainTaskResult)(task), "task", "nssWorkspaceAi.runWorkspaceTask"));
    }
    async closeActiveDiagnosticSession(status) {
        const state = this.store.snapshot();
        const session = this.getActiveDiagnosticSession(state.diagnosticSessions, state.activeDiagnosticSessionId);
        if (!session) {
            throw new Error("There is no active diagnostic session.");
        }
        await this.store.update((draft) => {
            draft.diagnosticSessions = draft.diagnosticSessions.map((item) => item.id === session.id ? (0, diagnosticService_js_1.closeDiagnosticSession)(item, status) : item);
            draft.activeDiagnosticSessionId = undefined;
        });
        await this.refreshSidebar();
    }
    async ensureReviewReadyForApply(reviewItem) {
        if (!(0, reviewService_js_1.canApplyReviewItem)(reviewItem)) {
            throw new Error("This review item does not include concrete text to apply.");
        }
        if (reviewItem.status !== "approved") {
            throw new Error("Approve the review item before applying it.");
        }
        const editor = (0, editor_js_1.requireActiveEditor)();
        const stale = (0, staleCheckService_js_1.isReviewItemStale)(reviewItem, editor.document.getText());
        if (!stale) {
            return;
        }
        await this.store.update((draft) => {
            draft.reviewItems = draft.reviewItems.map((item) => item.id === reviewItem.id ? (0, reviewService_js_1.markReviewItemStale)(item, true) : item);
        });
        const confirm = await vscode.window.showWarningMessage("The target file changed since NSS created this review item. Apply anyway?", { modal: true }, "Apply Anyway");
        if (confirm !== "Apply Anyway") {
            throw new Error("Apply cancelled because the review item is stale.");
        }
    }
    async markReviewItemApplied(reviewId) {
        await this.store.update((draft) => {
            draft.reviewItems = (0, reviewState_js_1.markReviewItemApplied)(draft.reviewItems, reviewId);
        });
        await this.refreshSidebar();
    }
    async openLikelyErrorFileEditor() {
        const likelyFiles = await this.resolveLikelyErrorFiles();
        const picked = await vscode.window.showQuickPick(likelyFiles.map((file) => ({ label: file })), {
            placeHolder: "Choose a likely error file",
        });
        if (!picked) {
            return undefined;
        }
        const document = await vscode.workspace.openTextDocument(picked.label);
        return vscode.window.showTextDocument(document, { preview: false });
    }
    async resolveLikelyErrorFiles() {
        const lastTask = this.getLastTask();
        if (!lastTask) {
            throw new Error("No workspace task has been run yet.");
        }
        const likelyFiles = lastTask.likelyErrorFiles.length > 0
            ? [...lastTask.likelyErrorFiles]
            : await (0, errorFileService_js_1.findLikelyErrorFilesFromOutput)(`${lastTask.stderr}\n${lastTask.stdout}`);
        if (likelyFiles.length === 0) {
            throw new Error("NSS could not identify likely error files from the last task output.");
        }
        return likelyFiles;
    }
    getWritableResponseText(response) {
        return (0, text_js_1.extractCodeFence)(response.body) ?? response.body;
    }
}
async function probeWorkspaceServerHealth() {
    const deadline = Date.now() + 5_000;
    let lastHealth;
    while (Date.now() < deadline) {
        const config = (0, config_js_1.getRuntimeConfig)();
        const health = await (0, health_js_1.probeServerHealth)(config.serverUrl);
        lastHealth = health;
        if (health.status === "online" || config.serverUrlSource === "configured") {
            return health;
        }
        await delay(200);
    }
    return (lastHealth ?? {
        status: "offline",
        detail: "Backend health probe timed out before the workspace server became available.",
        checkedAt: new Date().toISOString(),
    });
}
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function activate(context) {
    const store = new store_js_1.NssStateStore(context);
    const controller = new NssWorkspaceAiController(store);
    const sidebarProvider = new sidebarProvider_js_1.NssSidebarProvider(context.extensionUri, controller);
    controller.bindSidebar(sidebarProvider);
    context.subscriptions.push(controller, vscode.window.registerWebviewViewProvider("nssWorkspaceAi.sidebar", sidebarProvider), vscode.window.onDidChangeActiveTextEditor(() => {
        void controller.refreshSidebar();
    }), vscode.window.onDidChangeTextEditorSelection(() => {
        void controller.refreshSidebar();
    }));
    await controller.initialize();
    (0, index_js_1.registerNssCommands)(context, controller);
    (0, memoryCommands_js_1.registerMemoryCommands)(context, store);
    (0, registerDebugCommands_js_1.registerDebugCommands)(context, controller);
    await controller.refreshSidebar();
}
async function deactivate() { }
//# sourceMappingURL=extension.js.map