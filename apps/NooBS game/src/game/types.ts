export type HeadlineType = "CRASH" | "CORRECTION" | "POSITIVE" | "MOON" | "CALM" | "NOISY" | "VOLATILE";
export type Decision = "HOLD" | "REBALANCE" | "SELL" | "BUY_DIP" | "TACTICAL_TRIM";
export type ToastType = "TRUTH" | "WARNING";

export type GamePhase =
  | "MAIN_MENU"
  | "JOB_SELECTION"
  | "RULE_SELECTION"
  | "COLD_OPEN"
  | "PROGRAM_DETAILS"
  | "CONTRACT_SETUP"
  | "SIMULATION"
  | "PAYWALL"
  | "GRADUATION";
export type ActProfile = "I" | "II" | "III" | "IV";

export type GameStats = {
  patience: number;
  discipline: number;
  conviction: number;
};

export type TimeScale = "FOUR_DAYS" | "ONE_WEEK" | "ONE_MONTH";


export type PayFrequency = "WEEKLY" | "BI_WEEKLY" | "MONTHLY";

export type Job = {
  id: string;
  title: string;
  hourlyWage: number;
  payFrequency: PayFrequency;
  description: string;
  stressLevel: "LOW" | "MEDIUM" | "HIGH";
};

export type Rule = {
  id: string;
  title: string;
  description: string;
};

export type Holding = {
  symbol: string;
  shares: number;
  avgCost: number;
};

export type MarketPrices = Record<string, number>;

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT";
export type OrderStatus = "OPEN" | "FILLED" | "CANCELLED";

export type Order = {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  amount: number; // dollar amount
  limitPrice?: number;
  createdAt: number;
  status: OrderStatus;
  filledAt?: number;
  filledPrice?: number;
};

export type GameState = {
  month: number;
  cash: number; // Liquid cash from job
  netWorth: number; // Invested + Cash
  history: number[];
  simMultiplier: number; // starts at 1 and tracks cumulative market returns
  ruleIntegrity: number; // 0..100 (The "Guilt" Meter)
  isRuleIntegrityVisible: boolean;
  stats: GameStats;
  lastDecision?: Decision;
  violations: string[]; // Explicit strings for the "Guilt Engine"
  currentAct: ActProfile;
  targetNetWorth: number;
  freedomNumber: number; // 0..1 (netWorth / target)
  phase: GamePhase;
  isPaidUser: boolean;
  marketCondition: HeadlineType;
  statusText: string;
  nextMonthPenaltyPct: number; // missed rebound penalty
  job?: Job;
  selectedRules: Rule[];
  lastSessionTime: number;
  hasSeenTutorial: boolean;
  holdings: Record<string, Holding>;
  marketPrices: MarketPrices;
  timeScale: TimeScale;
  openOrders: Order[];
  marketClockMinutes: number;
  marketDay: number;
  pendingShockPct?: number;
  hasCompletedStory: boolean;
  monthlyExpenses: number;
  emergencyFundStatus: "NONE" | "PARTIAL" | "FULL";
};

export type MarketEvent = {
  id: string;
  month: number;
  title: string;
  body: string;
  severity: "CORRECTION" | "CRASH";
  impactMagnitude: 1 | 2 | 3;
  feedback: {
    [K in Decision]: string; // "The Teacher" copy
  };
};

export type Headline = {
  text: string;
  type: HeadlineType;
};

export type StepResult = {
  next: GameState;
  headline?: Headline;
  toast?: { message: string; type: ToastType };
  event?: MarketEvent;
  isCrash?: boolean;
};

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
