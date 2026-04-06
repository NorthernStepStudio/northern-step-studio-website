/**
 * 🔇 PRODUCTION LOGGER
 * 
 * Wrapper around console that can be silenced in production.
 * Import this instead of using console directly.
 */

const isDev = __DEV__;

export const logger = {
    log: (...args) => {
        if (isDev) console.log(...args);
    },
    warn: (...args) => {
        if (isDev) console.warn(...args);
    },
    error: (...args) => {
        // Always log errors
        console.error(...args);

        // Production error tracking - uncomment when Sentry is installed
        // To install: npx expo install @sentry/react-native
        // if (!isDev && Sentry) {
        //     Sentry.captureException(args[0] instanceof Error ? args[0] : new Error(args.join(' ')));
        // }
    },
    info: (...args) => {
        if (isDev) console.info(...args);
    },
};

export default logger;
