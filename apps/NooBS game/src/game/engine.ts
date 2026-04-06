import { clamp, GameState, StepResult, Decision, MarketEvent, ActProfile, HeadlineType } from "./types";
import { applyMarketShock, getInitialMarketPrices } from "./market";
import { logger } from "./logger";

const INITIAL_NET_WORTH = 0;
const FREEDOM_TARGET = 500000;

// Headlines (merged from user snippet)
export const HEADLINES: Record<string, string[]> = {
  CRASH: [
    "PANIC SELLING: The Fed loses control of inflation narratives.",
    "BLACK SWAN EVENT: Global supply chains paralyzed by new rift.",
    "FLASH CRASH: Algorithms trigger mass liquidation.",
    "BUBBLE BURSTS: Investors discover the line doesn’t go up forever.",
    "SYSTEMIC RISK: A major institution quietly halts withdrawals."
  ],
  CORRECTION: [
    "MARKET CORRECTION: Profit taking hits the leaders.",
    "FEAR INDEX RISES: Volatility returns as uncertainty peaks.",
    "EARNINGS MISS: Corporate giants show signs of slowing growth.",
    "BOND YIELD SPIKE: Risk assets lose appeal relative to cash.",
    "GEOPOLITICAL TENSIONS: The headlines turn loud again."
  ],
  POSITIVE: [
    "BULL RUN: Optimism grows as rate cuts are hinted.",
    "SOFT LANDING: The economy refuses to break.",
    "TAILWINDS: Markets climb quietly while nobody trusts it."
  ],
  MOON: [
    "MOON MISSION: Retail frenzy sends prices into orbit.",
    "SHORT SQUEEZE: Bears forced to buy back at any price.",
    "PARABOLIC MOVE: The chart goes vertical. Everyone feels smart."
  ]
};

// VOLUME 1 SCRIPTED EVENTS
const EVENTS: MarketEvent[] = [
  {
    id: "FIRST_BLOOD",
    month: 4,
    title: "Market Event",
    body: "Global markets drop -10%. Headlines turn fearful.",
    severity: "CORRECTION",
    impactMagnitude: 1,
    feedback: {
      HOLD: "Decision: Maintain position. Status: Protocol adhered to.",
      REBALANCE: "Decision: Portfolio adjustment. Status: Statistical balance restored.",
      SELL: "Decision: Total liquidation. Status: Breach of contract detected. Emotional compromise confirmed.",
      BUY_DIP: "Decision: Capital deployment. Status: Opportunistic efficiency high.",
      TACTICAL_TRIM: "Decision: Partial de-risking. Status: Tactical discipline maintained."
    }
  },
  {
    id: "THE_TEST",
    month: 7,
    title: "Market Event",
    body: "The floor breaks. A -20% leg down hits fast. Your stomach drops.",
    severity: "CRASH",
    impactMagnitude: 2,
    feedback: {
      HOLD: "Decision: Maintain position. Status: Resolve confirmed. Resilience +8.",
      REBALANCE: "Decision: Opportunistic adjustment. Status: Rationality maintained.",
      SELL: "Decision: Panic exit. Status: Fatal error. Psych-profile: Weak.",
      BUY_DIP: "Decision: Aggressive deployment. Status: Alpha-seeking behavior confirmed. Resilience +10.",
      TACTICAL_TRIM: "Decision: Preservation of capital. Status: Defensive protocols active."
    }
  },
  {
    id: "THE_REAL_TEST",
    month: 9,
    title: "SYSTEMIC CRASH",
    body: "The floor breaks. A sudden -30% leg down hits fast. Social pressure is mounting.",
    severity: "CRASH",
    impactMagnitude: 3,
    feedback: {
      HOLD: "Decision: Maintain position. Status: Survival achieved. You are the outlier.",
      REBALANCE: "Decision: Strategic entry. Status: Professional excellence.",
      SELL: "Decision: Termination. Status: Abandonment protocol triggered. You have failed.",
      BUY_DIP: "Decision: Maximum Conviction. Status: Institutional-grade deployment. Psych-profile: Unshakeable.",
      TACTICAL_TRIM: "Decision: Calculated retreat. Status: Survival priority established."
    }
  }
];

const CORE_SYMBOL = "VTI";

function getHoldingsValue(holdings: GameState["holdings"], prices: GameState["marketPrices"]) {
  return Object.values(holdings).reduce((sum, holding) => {
    const price = prices[holding.symbol] ?? 0;
    return sum + holding.shares * price;
  }, 0);
}

function buyHolding(
  holdings: GameState["holdings"],
  symbol: string,
  cashAmount: number,
  price: number
) {
  if (cashAmount <= 0 || price <= 0) return holdings;
  const current = holdings[symbol];
  const sharesToBuy = cashAmount / price;
  if (!current) {
    return {
      ...holdings,
      [symbol]: { symbol, shares: sharesToBuy, avgCost: price }
    };
  }
  const newShares = current.shares + sharesToBuy;
  const newCost = (current.avgCost * current.shares + price * sharesToBuy) / newShares;
  return {
    ...holdings,
    [symbol]: { ...current, shares: newShares, avgCost: newCost }
  };
}

function sellHoldingsPercent(
  holdings: GameState["holdings"],
  prices: GameState["marketPrices"],
  percent: number
) {
  const next: GameState["holdings"] = {};
  let cashOut = 0;
  Object.values(holdings).forEach(holding => {
    const price = prices[holding.symbol] ?? 0;
    const sharesToSell = holding.shares * percent;
    cashOut += sharesToSell * price;
    const remaining = holding.shares - sharesToSell;
    if (remaining > 0.0001) {
      next[holding.symbol] = { ...holding, shares: remaining };
    }
  });
  return { holdings: next, cashOut };
}

function liquidateHoldings(holdings: GameState["holdings"], prices: GameState["marketPrices"]) {
  const cashOut = getHoldingsValue(holdings, prices);
  return { holdings: {}, cashOut };
}

// VOLUME 1 SCRIPTED RETURNS
const MONTHLY_RETURNS_PCT: Record<number, number> = {
  2: 0.8,
  3: 1.2,
  4: -10.0, // First Blood
  5: -1.4,
  6: 0.6,
  7: -20.0, // The Test
  8: 1.1,
  9: -30.0, // Systemic Crash
  10: -2.0,
  11: 1.5,
  12: 2.1,
  13: 1.8
};

export function createInitialState(): GameState {
  return {
    month: 1,
    cash: 0,
    netWorth: INITIAL_NET_WORTH,
    history: [INITIAL_NET_WORTH],
    simMultiplier: 1,
    ruleIntegrity: 100,
    isRuleIntegrityVisible: false,
    stats: { patience: 50, discipline: 50, conviction: 50 },
    currentAct: "I",
    targetNetWorth: FREEDOM_TARGET,
    freedomNumber: INITIAL_NET_WORTH / FREEDOM_TARGET,
    violations: [],
    phase: "MAIN_MENU",
    isPaidUser: false,
    marketCondition: "CALM",
    statusText: "Market is calm.",
    nextMonthPenaltyPct: 0,
    job: undefined,
    selectedRules: [],
    lastSessionTime: Date.now(),
    hasSeenTutorial: false,
    holdings: {},
    marketPrices: getInitialMarketPrices(),
    timeScale: "ONE_WEEK",
    openOrders: [],
    marketClockMinutes: 9 * 60 + 30,
    marketDay: 1,
    pendingShockPct: 0,
    hasCompletedStory: false,
    monthlyExpenses: 3000,
    emergencyFundStatus: "NONE",
  };
}

function pickHeadline(type: string): string {
  const list = HEADLINES[type] || HEADLINES["CORRECTION"];
  return list[Math.floor(Math.random() * list.length)];
}

function getMarketCondition(returnPct: number): { condition: HeadlineType; status: string } {
  if (returnPct <= -15) return { condition: "CRASH", status: "🔴 Volatility spike detected. Your emotions are the enemy." };
  if (returnPct <= -5) return { condition: "VOLATILE", status: "🟠 Market stress rising. This is where people break rules." };
  return { condition: "CALM", status: "🟢 Market conditions are stable. Volatility is low." };
}

function getActProfile(month: number): ActProfile {
  if (month <= 3) return "I";
  if (month <= 7) return "II";
  if (month <= 10) return "III";
  return "IV";
}

export function advanceMonth(state: GameState): StepResult {
  const nextMonth = state.month + 1;
  const nextAct = getActProfile(nextMonth);
  const baseReturnPct = MONTHLY_RETURNS_PCT[nextMonth] ?? 0.7;

  // RULE INTEGRITY VISIBILITY (Visible starting Act III)
  const isRuleIntegrityVisible = state.isRuleIntegrityVisible || nextAct === "III";

  const penaltyPct = state.nextMonthPenaltyPct;
  const appliedReturnPct = baseReturnPct + penaltyPct;

  // INCOME LOGIC (160h work month approx)
  const monthlyIncome = state.job ? (state.job.hourlyWage * 160) : 0;
  const nextCash = state.cash + monthlyIncome;

  // Apply market return to prices and revalue holdings
  let shockedPrices = applyMarketShock(state.marketPrices, appliedReturnPct);
  const nextInvested = Object.values(state.holdings).reduce((sum, holding) => {
    const price = shockedPrices[holding.symbol] ?? 0;
    return sum + holding.shares * price;
  }, 0);
  const nextMultiplier = state.simMultiplier * (1 + appliedReturnPct / 100);

  // TOTAL WEALTH for History & Freedom
  const totalWealth = nextInvested + nextCash;
  const nextHistory = [...state.history, totalWealth];

  // STAT EVOLUTION
  let { patience, discipline, conviction } = state.stats;
  if (baseReturnPct >= 0) conviction += 0.2;
  else discipline += 0.5;

  const { condition, status } = getMarketCondition(baseReturnPct);

  const next: GameState = {
    ...state,
    month: nextMonth,
    cash: nextCash,
    netWorth: Math.round(nextInvested + nextCash), // Corrected: Invested + Cash
    history: nextHistory,
    simMultiplier: nextMultiplier,
    freedomNumber: totalWealth / FREEDOM_TARGET,
    currentAct: nextAct,
    marketCondition: condition,
    statusText: status,
    isRuleIntegrityVisible,
    nextMonthPenaltyPct: 0, // Reset penalty
    lastSessionTime: Date.now(),
    marketPrices: shockedPrices,
    pendingShockPct: 0,
    stats: {
      patience: clamp(patience, 0, 100),
      discipline: clamp(discipline, 0, 100),
      conviction: clamp(conviction, 0, 100)
    },
    monthlyExpenses: state.monthlyExpenses,
    emergencyFundStatus: state.emergencyFundStatus,
  };

  const event = EVENTS.find(e => e.month === nextMonth && (nextMonth <= 7 || state.isPaidUser));

  let headline;
  let toast;

  if (event) {
    const headlineType = event.severity === "CRASH" ? "CRASH" : "CORRECTION";
    headline = { text: pickHeadline(headlineType), type: headlineType as any };
    toast = event.severity === "CRASH"
      ? { message: "MARKET CRASH: Nerves of steel required.", type: "WARNING" as const }
      : { message: "CORRECTION: Noise is loud. Your plan must be louder.", type: "TRUTH" as const };
    const shock = event.severity === "CRASH" ? -6 : -3;
    shockedPrices = applyMarketShock(shockedPrices, shock);
    next.marketPrices = shockedPrices;
  }

  const res = {
    next,
    event,
    headline,
    toast,
    isCrash: condition === "CRASH"
  };

  logger.info(`[SYSTEM FEED]: Advancing to Month ${nextMonth}`, { condition, cash: nextCash, netWorth: Math.round(nextInvested + nextCash) });
  if (res.isCrash) logger.warn("[SYSTEM FEED]: MARKET CRASH DETECTED");
  if (res.event) logger.info(`[SYSTEM FEED]: New Event: ${res.event.title}`);

  return res;
}

function checkRuleViolations(state: GameState, event: MarketEvent, decision: Decision): string[] {
  const violations: string[] = [];
  const isSelling = decision === "SELL";
  if (!isSelling) return [];

  for (const rule of state.selectedRules) {
    if (rule.id === 'diamond_hands' && state.marketCondition === 'CRASH') {
      violations.push("VIOLATION: Sold during CRASH protocol breach.");
    }
    if (rule.id === 'anti_panic' && (state.marketCondition === 'CRASH' || state.marketCondition === 'VOLATILE')) {
      violations.push("VIOLATION: Anti-Panic protocol breached.");
    }
    if (rule.id === 'dca_only' && isSelling) {
      violations.push("VIOLATION: Asset liquidation restricted under DCA ONLY.");
    }
    if (rule.id === 'no_market_timing' && isSelling) {
      violations.push("VIOLATION: Attempted market timing detected.");
    }
  }

  return violations;
}

export function applyDecision(state: GameState, event: MarketEvent, decision: Decision): { next: GameState; feedback: string } {
  let { patience, discipline, conviction } = state.stats;
  let ruleIntegrity = state.ruleIntegrity;
  let violations = [...state.violations];
  let nextMonthPenaltyPct = 0;

  const ruleBreaches = checkRuleViolations(state, event, decision);
  const feedback = event.feedback[decision] || "Protocol updated.";

  let nextCash = state.cash;
  let nextNetWorth = state.netWorth;
  let nextHoldings = state.holdings;

  if (decision === "HOLD") {
    patience += 8; discipline += 5;
    ruleIntegrity = clamp(ruleIntegrity + 1, 0, 100);
  } else if (decision === "REBALANCE") {
    discipline += 8; conviction += 4;
  } else if (decision === "BUY_DIP") {
    const buyAmount = Math.floor(nextCash * 0.25);
    const buyPrice = state.marketPrices[CORE_SYMBOL] ?? 0;
    if (buyAmount > 0 && buyPrice > 0) {
      nextHoldings = buyHolding(nextHoldings, CORE_SYMBOL, buyAmount, buyPrice);
      nextCash -= buyAmount;
    }
    conviction += 10;
    discipline += 5;
  } else if (decision === "TACTICAL_TRIM") {
    const result = sellHoldingsPercent(nextHoldings, state.marketPrices, 0.1);
    nextHoldings = result.holdings;
    nextCash += result.cashOut;
    discipline += 10;
    if (state.marketCondition === 'CRASH') conviction -= 5;
  } else {
    // SELL action
    patience -= 10; discipline -= 10; conviction -= 5;
    nextMonthPenaltyPct = -2; // miss the rebound
    const result = liquidateHoldings(nextHoldings, state.marketPrices);
    nextHoldings = result.holdings;
    nextCash += result.cashOut;
    nextNetWorth = 0;

    if (ruleBreaches.length > 0) {
      // THE GUILT ENGINE: Fast drop when rules break
      patience -= 30; // Brutal drop
      discipline -= 40;
      conviction -= 20;
      ruleIntegrity -= (20 * ruleBreaches.length);
      ruleBreaches.forEach(v => violations.push(`❌ ${v} (Month ${state.month})`));
    } else {
      // Regular sell (no rule broken, maybe just rebalancing or tactical)
      ruleIntegrity -= 5;
    }
  }

  const recalculatedNetWorth = getHoldingsValue(nextHoldings, state.marketPrices);
  const next: GameState = {
    ...state,
    cash: nextCash,
    netWorth: Math.round(recalculatedNetWorth + nextCash), // Corrected: Invested + Cash
    lastDecision: decision,
    holdings: nextHoldings,
    ruleIntegrity: clamp(ruleIntegrity, 0, 100),
    violations,
    nextMonthPenaltyPct,
    stats: {
      patience: clamp(patience, 0, 100),
      discipline: clamp(discipline, 0, 100),
      conviction: clamp(conviction, 0, 100)
    }
  };

  logger.info(`[DECISION FEED]: ${decision}`, { feedback, breaches: violations.length });
  if (violations.length > 0) {
    logger.warn(`[PROTOCOL BREACH]: ${violations.join(", ")}`);
  }

  return { next, feedback };
}
