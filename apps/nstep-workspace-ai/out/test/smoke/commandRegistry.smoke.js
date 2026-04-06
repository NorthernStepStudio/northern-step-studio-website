"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommandRegistrySmoke = runCommandRegistrySmoke;
const node_assert_1 = require("node:assert");
const registry_js_1 = require("../../commands/registry.js");
function runCommandRegistrySmoke() {
    const commandIds = registry_js_1.NSS_COMMANDS.map((command) => command.id);
    node_assert_1.strict.equal(new Set(commandIds).size, commandIds.length, "Expected NSS command ids to be unique.");
    (0, node_assert_1.strict)(commandIds.includes("nssWorkspaceAi.proposeMultiFileChange"));
    (0, node_assert_1.strict)(commandIds.includes("nssWorkspaceAi.askAboutErrorFile"));
    (0, node_assert_1.strict)(commandIds.includes("nssWorkspaceAi.proposeFixForErrorFile"));
}
//# sourceMappingURL=commandRegistry.smoke.js.map