let Sentry = null;

export const initSentry = () => {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
    
    if (!dsn && !__DEV__) {
        console.warn('Sentry DSN is missing. Crash reporting is disabled.');
        return;
    }

    try {
        // Only try to load Sentry if we have a DSN and are not in Expo Go (optional check)
        // Or simply try-catch the require
        Sentry = require('@sentry/react-native');
        
        Sentry.init({
            dsn,
            debug: __DEV__,
            environment: __DEV__ ? 'development' : 'production',
            enableInExpoDevelopment: true,
        });
    } catch (e) {
        console.warn('Sentry native module not available. Sentry is disabled locally.');
        Sentry = null;
    }
};

/**
 * Log a breadcrumb to Sentry for the 'emergency' flow debugging
 */
export const addBreadcrumb = (category, message, data = {}, level = 'info') => {
    if (!Sentry || !Sentry.addBreadcrumb) return;
    try {
        Sentry.addBreadcrumb({
            category,
            message,
            level,
            data: {
                ...data,
                timestamp: new Date().toISOString(),
            },
        });
        
        if (__DEV__) {
            console.log(`[Sentry Breadcrumb] [${category}] ${message}`, data);
        }
    } catch (e) {
        // Fail silently
    }
};

/**
 * Track an event with manual logging
 */
export const trackEvent = (name, data = {}) => {
    try {
        Sentry.captureMessage(name, {
            level: 'info',
            extra: data,
        });
        
        if (__DEV__) {
            console.log(`[Sentry Event] ${name}`, data);
        }
    } catch (e) {
        // Fail silently
    }
};

/**
 * Capture an exception with context
 */
export const logError = (error, context = {}) => {
    try {
        Sentry.captureException(error, {
            extra: {
                ...context,
                timestamp: new Date().toISOString(),
            },
        });
        
        if (__DEV__) {
            console.error(`[Sentry Error]`, error, context);
        }
    } catch (e) {
        // Fail silently
    }
};

export default Sentry;
