export interface ScenarioEvent {
  month: number;
  title: string;
  description: string;
  debrief: string;
}

const monthlyReturns: Record<number, number> = {
  1: 0.5,
  2: 1.1,
  3: 1.3,
  4: -10,
  5: -2,
  6: 1,
  7: -20,
};

const scheduledEvents: ScenarioEvent[] = [
  {
    month: 4,
    title: "First Blood",
    description:
      "Markets tumble 10%. Headlines turn fearful and the tape is red from start to finish.",
    debrief: "Pulse racing? That's FOMO, not a strategy. Sit on your hands until you've calmed down.",
  },
  {
    month: 7,
    title: "The Test",
    description:
      "A 20% drawdown shakes the Residency. Peers second-guess every allocation move.",
    debrief: "Whoa. That's a lot of one thing. Diversification is insurance—this is asking for a bad headline to ruin you.",
  },
];

export const getMonthlyReturn = (month: number): number => {
  return monthlyReturns[month] ?? 0;
};

export const getScenarioEvent = (month: number): ScenarioEvent | undefined => {
  return scheduledEvents.find((event) => event.month === month);
};
