"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsoleLogger = createConsoleLogger;
exports.createNoopLogger = createNoopLogger;
function createConsoleLogger(prefix = "m-core") {
    return {
        debug(message, meta) {
            write("debug", prefix, message, meta);
        },
        info(message, meta) {
            write("info", prefix, message, meta);
        },
        warn(message, meta) {
            write("warn", prefix, message, meta);
        },
        error(message, meta) {
            write("error", prefix, message, meta);
        },
    };
}
function createNoopLogger() {
    return {
        debug() { },
        info() { },
        warn() { },
        error() { },
    };
}
function write(level, prefix, message, meta) {
    const formatted = `[${prefix}] ${message}`;
    if (meta === undefined) {
        console[level](formatted);
        return;
    }
    console[level](formatted, meta);
}
//# sourceMappingURL=logger.js.map