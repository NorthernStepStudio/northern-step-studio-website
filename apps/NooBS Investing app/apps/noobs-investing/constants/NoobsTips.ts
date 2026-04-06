export type TipCategory = 'behavior' | 'math' | 'technical' | 'market';

export type NoobsTip = {
    id: string;
    category: TipCategory;
    title: string;
    text: string;
    context?: string; // Where this tip is most relevant (e.g. 'portfolio', 'add-entry')
};

export const NOOBS_TIPS: NoobsTip[] = [
    {
        id: 'boring-gold',
        category: 'behavior',
        title: 'Boring is Gold',
        text: 'If your portfolio feels boring, you’re doing it right. Excitement is for gambling, not investing.',
        context: 'portfolio'
    },
    {
        id: 'fomo-trap',
        category: 'behavior',
        title: 'The FOMO Trap',
        text: 'When everyone is talking about a stock, it’s usually the worst time to buy. Build your own path.',
        context: 'add-entry'
    },
    {
        id: 'time-over-timing',
        category: 'math',
        title: 'Time > Timing',
        text: 'Being in the market for 10 years beats trying to guess the "perfect" day to buy.',
        context: 'plan'
    },
    {
        id: 'fees-matter',
        category: 'technical',
        title: 'Watch the Fees',
        text: 'A 1% fee might sound small, but over 30 years it can take 30% of your total wealth. Choose low-cost ETFs.',
        context: 'add-entry'
    },
    {
        id: 'rebalance-rule',
        category: 'technical',
        title: 'Rebalance, Don’t Chase',
        text: 'Sell a bit of what went up and buy what’s low. It feels wrong, but it’s how masters stay safe.',
        context: 'portfolio'
    }
];

export function getRandomTip(context?: string): NoobsTip {
    const relevant = context
        ? NOOBS_TIPS.filter(t => t.context === context)
        : NOOBS_TIPS;
    return relevant[Math.floor(Math.random() * relevant.length)];
}
