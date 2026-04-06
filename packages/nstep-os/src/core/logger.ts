import type { NStepLogger } from "./types.js";

function formatData(data?: Record<string, unknown>): string {
  if (!data || Object.keys(data).length === 0) {
    return "";
  }

  return ` ${JSON.stringify(data)}`;
}

function createLogger(scope: string): NStepLogger {
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

export function createConsoleLogger(scope = "runtime"): NStepLogger {
  return createLogger(scope);
}

export function createNoopLogger(): NStepLogger {
  const noop = () => undefined;
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    child: () => createNoopLogger(),
  };
}
