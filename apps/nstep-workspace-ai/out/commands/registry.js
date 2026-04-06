"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NSS_COMMANDS = void 0;
const abandonSession_command_js_1 = __importDefault(require("./abandonSession.command.js"));
const addProjectRule_command_js_1 = __importDefault(require("./addProjectRule.command.js"));
const addNoteToDiagnosticSession_command_js_1 = __importDefault(require("./addNoteToDiagnosticSession.command.js"));
const addRoadmapNote_command_js_1 = __importDefault(require("./addRoadmapNote.command.js"));
const applyApprovedReviewItem_command_js_1 = __importDefault(require("./applyApprovedReviewItem.command.js"));
const applyProposedEditToActiveFile_command_js_1 = __importDefault(require("./applyProposedEditToActiveFile.command.js"));
const applyReviewItemToFile_command_js_1 = __importDefault(require("./applyReviewItemToFile.command.js"));
const applyReviewItemToSelection_command_js_1 = __importDefault(require("./applyReviewItemToSelection.command.js"));
const approveReviewItem_command_js_1 = __importDefault(require("./approveReviewItem.command.js"));
const askAboutCurrentFile_command_js_1 = __importDefault(require("./askAboutCurrentFile.command.js"));
const askAboutErrorFile_command_js_1 = __importDefault(require("./askAboutErrorFile.command.js"));
const ask_command_js_1 = __importDefault(require("./ask.command.js"));
const cancelActiveWorkflow_command_js_1 = __importDefault(require("./cancelActiveWorkflow.command.js"));
const clearWorkspaceMemory_command_js_1 = __importDefault(require("./clearWorkspaceMemory.command.js"));
const compareLastTwoTaskResults_command_js_1 = __importDefault(require("./compareLastTwoTaskResults.command.js"));
const createNewFileFromLatestResponse_command_js_1 = __importDefault(require("./createNewFileFromLatestResponse.command.js"));
const explainFile_command_js_1 = __importDefault(require("./explainFile.command.js"));
const explainLastTaskFailure_command_js_1 = __importDefault(require("./explainLastTaskFailure.command.js"));
const explainProjectStructure_command_js_1 = __importDefault(require("./explainProjectStructure.command.js"));
const findLikelyErrorFiles_command_js_1 = __importDefault(require("./findLikelyErrorFiles.command.js"));
const findRelatedFiles_command_js_1 = __importDefault(require("./findRelatedFiles.command.js"));
const generateFromSelection_command_js_1 = __importDefault(require("./generateFromSelection.command.js"));
const insertLatestResponseIntoCurrentFile_command_js_1 = __importDefault(require("./insertLatestResponseIntoCurrentFile.command.js"));
const nextWorkflowStep_command_js_1 = __importDefault(require("./nextWorkflowStep.command.js"));
const openReviewCenter_command_js_1 = __importDefault(require("./openReviewCenter.command.js"));
const openSidebar_command_js_1 = __importDefault(require("./openSidebar.command.js"));
const planChange_command_js_1 = __importDefault(require("./planChange.command.js"));
const previewReviewItem_command_js_1 = __importDefault(require("./previewReviewItem.command.js"));
const proposeEditForCurrentFile_command_js_1 = __importDefault(require("./proposeEditForCurrentFile.command.js"));
const proposeFixForErrorFile_command_js_1 = __importDefault(require("./proposeFixForErrorFile.command.js"));
const proposeMultiFileChange_command_js_1 = __importDefault(require("./proposeMultiFileChange.command.js"));
const recallSimilarFailure_command_js_1 = __importDefault(require("./recallSimilarFailure.command.js"));
const rebuildKnowledgePacks_command_js_1 = __importDefault(require("./rebuildKnowledgePacks.command.js"));
const recommendNextWork_command_js_1 = __importDefault(require("./recommendNextWork.command.js"));
const refreshReviewItemAgainstCurrentFile_command_js_1 = __importDefault(require("./refreshReviewItemAgainstCurrentFile.command.js"));
const rejectReviewItem_command_js_1 = __importDefault(require("./rejectReviewItem.command.js"));
const rerunLastWorkspaceTask_command_js_1 = __importDefault(require("./rerunLastWorkspaceTask.command.js"));
const resolveSession_command_js_1 = __importDefault(require("./resolveSession.command.js"));
const runWorkflow_command_js_1 = __importDefault(require("./runWorkflow.command.js"));
const runWorkspaceTask_command_js_1 = __importDefault(require("./runWorkspaceTask.command.js"));
const saveRepairPattern_command_js_1 = __importDefault(require("./saveRepairPattern.command.js"));
const searchCodebase_command_js_1 = __importDefault(require("./searchCodebase.command.js"));
const searchKnowledgePacks_command_js_1 = __importDefault(require("./searchKnowledgePacks.command.js"));
const showAvailableWorkflows_command_js_1 = __importDefault(require("./showAvailableWorkflows.command.js"));
const showCrossProjectSummary_command_js_1 = __importDefault(require("./showCrossProjectSummary.command.js"));
const showCurrentModeDetails_command_js_1 = __importDefault(require("./showCurrentModeDetails.command.js"));
const showCurrentPreset_command_js_1 = __importDefault(require("./showCurrentPreset.command.js"));
const showDiffForReviewItem_command_js_1 = __importDefault(require("./showDiffForReviewItem.command.js"));
const showQuickStart_command_js_1 = __importDefault(require("./showQuickStart.command.js"));
const showBuildFoundation_command_js_1 = __importDefault(require("./showBuildFoundation.command.js"));
const showRoadmapNotesForActiveProject_command_js_1 = __importDefault(require("./showRoadmapNotesForActiveProject.command.js"));
const showStudioDashboard_command_js_1 = __importDefault(require("./showStudioDashboard.command.js"));
const showWorkspaceBriefing_command_js_1 = __importDefault(require("./showWorkspaceBriefing.command.js"));
const startDiagnosticSession_command_js_1 = __importDefault(require("./startDiagnosticSession.command.js"));
const suggestFixForTaskFailure_command_js_1 = __importDefault(require("./suggestFixForTaskFailure.command.js"));
const suggestPresetForWorkspace_command_js_1 = __importDefault(require("./suggestPresetForWorkspace.command.js"));
const suggestStudioProjectForWorkspace_command_js_1 = __importDefault(require("./suggestStudioProjectForWorkspace.command.js"));
const switchActiveStudioProject_command_js_1 = __importDefault(require("./switchActiveStudioProject.command.js"));
const switchMode_command_js_1 = __importDefault(require("./switchMode.command.js"));
const switchPreset_command_js_1 = __importDefault(require("./switchPreset.command.js"));
const viewActiveDiagnosticSession_command_js_1 = __importDefault(require("./viewActiveDiagnosticSession.command.js"));
exports.NSS_COMMANDS = [
    ask_command_js_1.default,
    explainFile_command_js_1.default,
    generateFromSelection_command_js_1.default,
    askAboutCurrentFile_command_js_1.default,
    explainProjectStructure_command_js_1.default,
    proposeEditForCurrentFile_command_js_1.default,
    proposeMultiFileChange_command_js_1.default,
    applyProposedEditToActiveFile_command_js_1.default,
    insertLatestResponseIntoCurrentFile_command_js_1.default,
    createNewFileFromLatestResponse_command_js_1.default,
    openSidebar_command_js_1.default,
    searchCodebase_command_js_1.default,
    findRelatedFiles_command_js_1.default,
    planChange_command_js_1.default,
    runWorkspaceTask_command_js_1.default,
    explainLastTaskFailure_command_js_1.default,
    suggestFixForTaskFailure_command_js_1.default,
    rerunLastWorkspaceTask_command_js_1.default,
    findLikelyErrorFiles_command_js_1.default,
    askAboutErrorFile_command_js_1.default,
    proposeFixForErrorFile_command_js_1.default,
    showQuickStart_command_js_1.default,
    showBuildFoundation_command_js_1.default,
    startDiagnosticSession_command_js_1.default,
    viewActiveDiagnosticSession_command_js_1.default,
    addNoteToDiagnosticSession_command_js_1.default,
    compareLastTwoTaskResults_command_js_1.default,
    resolveSession_command_js_1.default,
    abandonSession_command_js_1.default,
    addProjectRule_command_js_1.default,
    saveRepairPattern_command_js_1.default,
    recallSimilarFailure_command_js_1.default,
    clearWorkspaceMemory_command_js_1.default,
    switchActiveStudioProject_command_js_1.default,
    showStudioDashboard_command_js_1.default,
    addRoadmapNote_command_js_1.default,
    showRoadmapNotesForActiveProject_command_js_1.default,
    recommendNextWork_command_js_1.default,
    showCrossProjectSummary_command_js_1.default,
    suggestStudioProjectForWorkspace_command_js_1.default,
    switchMode_command_js_1.default,
    showCurrentModeDetails_command_js_1.default,
    runWorkflow_command_js_1.default,
    nextWorkflowStep_command_js_1.default,
    cancelActiveWorkflow_command_js_1.default,
    showAvailableWorkflows_command_js_1.default,
    switchPreset_command_js_1.default,
    showCurrentPreset_command_js_1.default,
    suggestPresetForWorkspace_command_js_1.default,
    rebuildKnowledgePacks_command_js_1.default,
    showWorkspaceBriefing_command_js_1.default,
    searchKnowledgePacks_command_js_1.default,
    openReviewCenter_command_js_1.default,
    previewReviewItem_command_js_1.default,
    showDiffForReviewItem_command_js_1.default,
    approveReviewItem_command_js_1.default,
    rejectReviewItem_command_js_1.default,
    applyApprovedReviewItem_command_js_1.default,
    applyReviewItemToSelection_command_js_1.default,
    applyReviewItemToFile_command_js_1.default,
    refreshReviewItemAgainstCurrentFile_command_js_1.default,
];
//# sourceMappingURL=registry.js.map