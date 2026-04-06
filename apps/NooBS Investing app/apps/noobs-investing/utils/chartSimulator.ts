/**
 * Chart Simulator Utility
 * Generates realistic price data using Brownian motion for educational simulations.
 */

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export interface PricePoint {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ChartData {
    symbol: string;
    prices: PricePoint[];
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
}

/**
 * MARKET HOURS LOGIC
 * Teaching: Markets ARE NOT ALWAYS OPEN. Liquidity evaporates outside these hours.
 */
export function isMarketOpen(): boolean {
    const now = new Date();
    // Convert to EST (Roughly UTC-5)
    const estOffset = -5;
    const utcHour = now.getUTCHours();
    const estHour = (utcHour + estOffset + 24) % 24;
    const estMinutes = now.getUTCMinutes();
    const day = now.getUTCDay(); // 0 is Sunday, 6 is Saturday

    // Monday (1) to Friday (5)
    const isWeekday = day >= 1 && day <= 5;
    const timeInMinutes = estHour * 60 + estMinutes;
    // 9:30 AM is 570 mins, 4:00 PM is 960 mins
    const isOpenTime = timeInMinutes >= 570 && timeInMinutes <= 960;

    return isWeekday && isOpenTime;
}

/**
 * SLIPPAGE & FRICTION LOGIC
 * Teaching: Large orders move the price against you. 
 */
export const COMMISSION_FLAT = 0.01; // $0.01 fixed exchange fee
export function calculateSlippage(amount: number, symbol: string): number {
    // Large amounts cause more slippage (simulating depth of book)
    // 1 BTC order moves price more than 0.001 BTC
    const baseSlippage = 0.0002; // 0.02% base
    const sizePremium = Math.max(0, (amount - 5000) / 1000000); // Penalty for orders over $5k
    return baseSlippage + sizePremium;
}

// Volatility profiles for different asset types
const VOLATILITY_PROFILES: Record<string, number> = {
    // Broad market ETFs - low volatility
    'VTI': 0.012,
    'VOO': 0.012,
    'VXUS': 0.014,
    'BND': 0.003,
    'SCHD': 0.010,
    'VNQ': 0.015,
    'DGRO': 0.011,
    // Tech/Growth - higher volatility
    'QQQ': 0.018,
    'NVDA': 0.035,
    'TSLA': 0.045,
    'AAPL': 0.020,
    'MSFT': 0.018,
    'GOOGL': 0.022,
    'AMZN': 0.025,
    'XLK': 0.020,
    // Sector ETFs - medium volatility
    'XLF': 0.016,
    'XLE': 0.022,
    'XLI': 0.014,
    'XLP': 0.008,
    'XLV': 0.010,
    'XLRE': 0.016,
    // Individual stocks - higher volatility
    'JPM': 0.018,
    'KO': 0.010,
    'JNJ': 0.012,
    'PG': 0.010,
    'COST': 0.015,
    'XOM': 0.020,
    // Safe haven
    'GLD': 0.010,
    'TLT': 0.012,
    'SHV': 0.001,
    'ASML': 0.030,
    'BRK.B': 0.012,
};

// Get points count based on time range
function getPointsCount(range: TimeRange): number {
    switch (range) {
        case '1D': return 78; // 5-minute intervals for 6.5 hours
        case '1W': return 7 * 24; // hourly for a week
        case '1M': return 30; // daily for a month
        case '3M': return 90; // daily for 3 months
        case '1Y': return 252; // trading days in a year
        case 'ALL': return 252 * 5; // 5 years
        default: return 30;
    }
}

// Generate a single price movement using Brownian motion
function brownianStep(currentPrice: number, volatility: number, drift: number = 0.0001): number {
    const randomShock = (Math.random() - 0.5) * 2 * volatility;
    const movement = drift + randomShock;
    return currentPrice * (1 + movement);
}

// Generate OHLCV data from a sequence of close prices
function generateOHLCV(prices: number[], baseTimestamp: number, intervalMs: number): PricePoint[] {
    return prices.map((close, index) => {
        const open = index === 0 ? close * (1 + (Math.random() - 0.5) * 0.005) : prices[index - 1];
        const variance = close * 0.015;
        const high = Math.max(open, close) + Math.random() * variance;
        const low = Math.min(open, close) - Math.random() * variance;
        const volume = Math.floor(1000000 + Math.random() * 5000000);

        return {
            timestamp: baseTimestamp + index * intervalMs,
            open,
            high,
            low,
            close,
            volume
        };
    });
}

/**
 * Generate historical price data for an asset
 */
export function generateHistoricalPrices(
    symbol: string,
    currentPrice: number,
    range: TimeRange
): ChartData {
    const volatility = VOLATILITY_PROFILES[symbol] || 0.015;
    const pointsCount = getPointsCount(range);

    // Work backwards from current price
    const closePrices: number[] = [currentPrice];
    let price = currentPrice;

    // Calculate appropriate drift based on historical context (slight upward bias)
    const drift = range === 'ALL' ? 0.0003 : 0.0001;

    for (let i = 1; i < pointsCount; i++) {
        // Go backwards in time (reverse drift)
        price = brownianStep(price, volatility, -drift);
        closePrices.unshift(price);
    }

    // Calculate time intervals
    const now = Date.now();
    let intervalMs: number;
    switch (range) {
        case '1D': intervalMs = 5 * 60 * 1000; break; // 5 minutes
        case '1W': intervalMs = 60 * 60 * 1000; break; // 1 hour
        case '1M': intervalMs = 24 * 60 * 60 * 1000; break; // 1 day
        case '3M': intervalMs = 24 * 60 * 60 * 1000; break;
        case '1Y': intervalMs = 24 * 60 * 60 * 1000; break;
        case 'ALL': intervalMs = 24 * 60 * 60 * 1000; break;
        default: intervalMs = 24 * 60 * 60 * 1000;
    }

    const startTimestamp = now - (pointsCount - 1) * intervalMs;
    const prices = generateOHLCV(closePrices, startTimestamp, intervalMs);

    const startPrice = closePrices[0];
    const priceChange = currentPrice - startPrice;
    const priceChangePercent = ((currentPrice - startPrice) / startPrice) * 100;

    return {
        symbol,
        prices,
        currentPrice,
        priceChange,
        priceChangePercent
    };
}

/**
 * Simulate real-time price movement (for live ticker effect)
 * Teaching: Prices move violently when open, and drift flatly when closed.
 */
export function simulatePriceMovement(currentPrice: number, symbol: string): number {
    const isOpen = isMarketOpen();
    const baseVol = VOLATILITY_PROFILES[symbol] || 0.015;

    // Reduce volatility by 90% during after-hours to simulate low activity
    const activeVolatility = isOpen ? (baseVol * 0.1) : (baseVol * 0.01);

    // Drift slightly towards open price if closed? For now just keep it random
    return brownianStep(currentPrice, activeVolatility, 0);
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            sma.push(NaN);
        } else {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
    }
    return sma;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = 0; i < prices.length; i++) {
        if (i < period) {
            rsi.push(NaN);
        } else {
            const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi.push(100 - (100 / (1 + rs)));
        }
    }

    return rsi;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format percentage for display
 */
export function formatPercent(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
}
