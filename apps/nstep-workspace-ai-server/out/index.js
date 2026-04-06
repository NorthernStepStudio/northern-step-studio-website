"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("./config/env.js");
const server_js_1 = require("./server.js");
async function main() {
    const config = (0, env_js_1.getServerConfig)();
    const started = await (0, server_js_1.startNssWorkspaceAiServer)(config);
    const portMessage = config.port !== 0 && started.port !== config.port ? ` (requested ${config.port} was busy)` : "";
    console.log(`NSS Workspace AI server listening on http://127.0.0.1:${started.port}${portMessage} (${(0, env_js_1.describeProvider)(config)})`);
}
void main().catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map