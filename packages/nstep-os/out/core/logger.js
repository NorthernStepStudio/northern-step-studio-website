function formatData(data) {
    if (!data || Object.keys(data).length === 0) {
        return "";
    }
    return ` ${JSON.stringify(data)}`;
}
function createLogger(scope) {
    const prefix = `[nstep-os:${scope}]`;
    return {
        debug(message, data) {
            console.debug(`${prefix} ${message}${formatData(data)}`);
        },
        info(message, data) {
            console.info(`${prefix} ${message}${formatData(data)}`);
        },
        warn(message, data) {
            console.warn(`${prefix} ${message}${formatData(data)}`);
        },
        error(message, data) {
            console.error(`${prefix} ${message}${formatData(data)}`);
        },
        child(childScope) {
            return createLogger(`${scope}/${childScope}`);
        },
    };
}
export function createConsoleLogger(scope = "runtime") {
    return createLogger(scope);
}
export function createNoopLogger() {
    const noop = () => undefined;
    return {
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
        child: () => createNoopLogger(),
    };
}
//# sourceMappingURL=logger.js.map