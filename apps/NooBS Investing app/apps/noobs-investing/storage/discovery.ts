import { db } from "./db";

export interface Reaction {
    type: 'FIRE' | 'CLOWN' | 'ROCKET' | 'BEAR';
    count: number;
    userReacted?: boolean;
}

export interface DiscoveryItem {
    id: string;
    userName: string;
    type: 'TRADE' | 'ACHIEVEMENT' | 'MILESTONE';
    headline: string;
    thesis?: string;
    timestamp: string;
    reactions?: Reaction[];
}

export interface SentimentData {
    bullish: number;
    bearish: number;
    neutral: number;
    userVote?: 'BULL' | 'BEAR' | 'NEUTRAL';
}

const SIMULATED_ITEMS: DiscoveryItem[] = [
    {
        id: 'sim1',
        userName: 'Atlas01',
        type: 'TRADE',
        headline: 'Locked in VTI',
        thesis: 'Core baseline established. High fee era for my family is over.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        reactions: [{ type: 'FIRE', count: 12 }, { type: 'ROCKET', count: 4 }]
    },
    {
        id: 'sim2',
        userName: 'CompoundCat',
        type: 'ACHIEVEMENT',
        headline: 'Reached 50% Freedom Number',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        reactions: [{ type: 'FIRE', count: 45 }, { type: 'ROCKET', count: 20 }]
    },
    {
        id: 'sim3',
        userName: 'ThetaKing',
        type: 'TRADE',
        headline: 'Sold SCHD Covered Calls',
        thesis: 'Specializing in the Specialist Residency. Harvesting yield.',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        reactions: [{ type: 'CLOWN', count: 8 }, { type: 'BEAR', count: 2 }]
    },
];

export async function broadcastTrade(userName: string, asset: string, thesis: string) {
    const item: Omit<DiscoveryItem, 'id'> = {
        userName,
        type: 'TRADE',
        headline: `Bought ${asset}`,
        thesis,
        timestamp: new Date().toISOString()
    };

    await db.runAsync(
        `INSERT INTO discovery_feed (user_name, type, headline, thesis, timestamp) VALUES (?, ?, ?, ?, ?)`,
        [item.userName, item.type, item.headline, item.thesis || null, item.timestamp]
    );
}

export async function getDiscoveryFeed(): Promise<DiscoveryItem[]> {
    const rows = await db.getAllAsync<any>(`SELECT * FROM discovery_feed ORDER BY timestamp DESC LIMIT 20`);

    const localItems: DiscoveryItem[] = rows.map(r => ({
        id: r.id.toString(),
        userName: r.user_name,
        type: r.type as any,
        headline: r.headline,
        thesis: r.thesis,
        timestamp: r.timestamp,
        reactions: []
    }));

    return [...localItems, ...SIMULATED_ITEMS].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export async function getSentiment(): Promise<SentimentData> {
    const row = await db.getFirstAsync<any>(`SELECT * FROM market_sentiment LIMIT 1`);

    // Simulated base sentiment
    const base: SentimentData = { bullish: 682, bearish: 412, neutral: 215 };

    if (row) {
        return {
            ...base,
            userVote: row.user_vote,
            bullish: base.bullish + (row.user_vote === 'BULL' ? 1 : 0),
            bearish: base.bearish + (row.user_vote === 'BEAR' ? 1 : 0),
            neutral: base.neutral + (row.user_vote === 'NEUTRAL' ? 1 : 0),
        };
    }
    return base;
}

export async function voteSentiment(vote: 'BULL' | 'BEAR' | 'NEUTRAL') {
    await db.runAsync(`DELETE FROM market_sentiment`);
    await db.runAsync(`INSERT INTO market_sentiment (user_vote) VALUES (?)`, [vote]);
}
