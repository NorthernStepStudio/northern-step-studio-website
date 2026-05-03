import { ensureFallbackCatalogCheck } from './fallbackCatalog';

const MIN_PRICE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
let intervalRef: NodeJS.Timeout | null = null;

const resolvePriceCheckIntervalMs = () => {
    const raw = Number.parseInt(
        String(process.env.NEXUSBUILD_PRICE_CHECK_INTERVAL_MS ?? ''),
        10
    );
    if (!Number.isFinite(raw) || raw <= 0) {
        return MIN_PRICE_CHECK_INTERVAL_MS;
    }
    return Math.max(raw, MIN_PRICE_CHECK_INTERVAL_MS);
};

const getConfiguredPricingMode = () =>
    String(process.env.NEXUSBUILD_PRICING_MODE || 'mock')
        .trim()
        .toLowerCase();

const runCatalogCheck = () => {
    const status = ensureFallbackCatalogCheck({
        intervalMs: resolvePriceCheckIntervalMs(),
    });
    console.log(
        `[Pricing] Mock catalog check complete at ${status.checkedAt} (run ${status.totalChecks}).`
    );
};

export const startPriceCatalogMonitor = () => {
    if (intervalRef) {
        return;
    }

    if (getConfiguredPricingMode() === 'live') {
        console.log('[Pricing] Live pricing mode enabled. Mock catalog monitor is idle.');
        return;
    }

    runCatalogCheck();
    const intervalMs = resolvePriceCheckIntervalMs();

    intervalRef = setInterval(() => {
        runCatalogCheck();
    }, intervalMs);

    if (typeof intervalRef.unref === 'function') {
        intervalRef.unref();
    }

    console.log(
        `[Pricing] Mock catalog monitor started (interval: ${Math.round(
            intervalMs / (60 * 60 * 1000)
        )}h).`
    );
};

export const stopPriceCatalogMonitor = () => {
    if (!intervalRef) {
        return;
    }

    clearInterval(intervalRef);
    intervalRef = null;
};
