"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineCommand = defineCommand;
function defineCommand(id, methodName) {
    return {
        id,
        run: (host) => host[methodName](),
    };
}
//# sourceMappingURL=shared.js.map