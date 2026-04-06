export const MARKET_TICKERS = [
  { symbol: "VTI", name: "Vanguard Total Market" },
  { symbol: "SPY", name: "SPDR S&P 500" },
  { symbol: "QQQ", name: "Invesco QQQ" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
];

export const MARKET_OPEN_MIN = 9 * 60 + 30;
export const MARKET_CLOSE_MIN = 16 * 60;

export type MarketClock = {
  marketClockMinutes: number;
  marketDay: number;
};

const ASSET_CLASS: Record<string, "ETF" | "STOCK" | "CRYPTO"> = {
  VTI: "ETF",
  SPY: "ETF",
  QQQ: "ETF",
  AAPL: "STOCK",
  MSFT: "STOCK",
  NVDA: "STOCK",
  TSLA: "STOCK",
  AMZN: "STOCK",
  BTC: "CRYPTO",
  ETH: "CRYPTO",
};

const BASE_PRICES: Record<string, number> = {
  VTI: 250,
  SPY: 470,
  QQQ: 420,
  AAPL: 190,
  MSFT: 430,
  NVDA: 520,
  TSLA: 220,
  AMZN: 180,
  BTC: 42000,
  ETH: 2500,
};

export function getInitialMarketPrices(): Record<string, number> {
  const prices: Record<string, number> = {};
  MARKET_TICKERS.forEach(t => {
    prices[t.symbol] = BASE_PRICES[t.symbol] ?? 100;
  });
  return prices;
}

export function clampPrice(value: number) {
  return Math.max(0.01, value);
}

export function getMinutesPerTick(timeScale: "FOUR_DAYS" | "ONE_WEEK" | "ONE_MONTH") {
  if (timeScale === "FOUR_DAYS") return 5;
  if (timeScale === "ONE_MONTH") return 20;
  return 10;
}

export function advanceMarketClock(clock: MarketClock, minutesToAdvance: number): MarketClock {
  let nextMinutes = clock.marketClockMinutes + minutesToAdvance;
  let nextDay = clock.marketDay;
  while (nextMinutes >= 24 * 60) {
    nextMinutes -= 24 * 60;
    nextDay += 1;
  }
  return { marketClockMinutes: nextMinutes, marketDay: nextDay };
}

export function isMarketOpen(clock: MarketClock) {
  const day = clock.marketDay % 7;
  const isWeekend = day === 0 || day === 6;
  if (isWeekend) return false;
  return clock.marketClockMinutes >= MARKET_OPEN_MIN && clock.marketClockMinutes <= MARKET_CLOSE_MIN;
}

export function formatMarketTime(clock: MarketClock) {
  const hours = Math.floor(clock.marketClockMinutes / 60);
  const minutes = clock.marketClockMinutes % 60;
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hour12}:${minStr} ${ampm}`;
}

export function getSpreadPct(symbol: string) {
  const cls = ASSET_CLASS[symbol] ?? "STOCK";
  if (cls === "ETF") return 0.0002;
  if (cls === "CRYPTO") return 0.001;
  return 0.0005;
}

export function getSlippagePct(symbol: string, amount: number) {
  const cls = ASSET_CLASS[symbol] ?? "STOCK";
  const base = cls === "ETF" ? 0.0004 : cls === "CRYPTO" ? 0.0012 : 0.0008;
  const scale = Math.log10(1 + amount / 5000);
  return base * Math.max(0, scale);
}

export function getBidAsk(symbol: string, midPrice: number) {
  const spread = getSpreadPct(symbol) * midPrice;
  return {
    bid: clampPrice(midPrice - spread / 2),
    ask: clampPrice(midPrice + spread / 2),
  };
}

export function applyPriceTick(
  current: Record<string, number>,
  isOpen: boolean,
  minutesPerTick: number
) {
  const next: Record<string, number> = {};
  Object.entries(current).forEach(([symbol, price]) => {
    const cls = ASSET_CLASS[symbol] ?? "STOCK";
    const open = isOpen || cls === "CRYPTO";
    if (!open) {
      next[symbol] = price;
      return;
    }
    const baseVol = cls === "CRYPTO" ? 0.006 : cls === "ETF" ? 0.0012 : 0.002;
    const timeScaleVol = Math.sqrt(minutesPerTick / 5);
    const change = (Math.random() - 0.5) * baseVol * timeScaleVol;
    next[symbol] = clampPrice(price * (1 + change));
  });
  return next;
}

export function applyMarketShock(current: Record<string, number>, pct: number) {
  const factor = 1 + pct / 100;
  const next: Record<string, number> = {};
  Object.entries(current).forEach(([symbol, price]) => {
    next[symbol] = clampPrice(price * factor);
  });
  return next;
}
