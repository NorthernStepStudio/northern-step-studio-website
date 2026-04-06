
import { Rule } from './types';

export const AVAILABLE_RULES: Rule[] = [
    {
        id: 'diamond_hands',
        title: 'DIAMOND HANDS',
        description: 'I will not sell any asset that is currently in a loss position of >15%.'
    },
    {
        id: 'dca_only',
        title: 'DCA ONLY',
        description: 'I will only perform buy/deposit actions. Selling is restricted to rebalancing only.'
    },
    {
        id: 'anti_panic',
        title: 'ANTI PANIC',
        description: 'I will never liquidate positions during a CRASH or CORRECTION market event.'
    },
    {
        id: 'the_rebalancer',
        title: 'SYSTEMATIC REBALANCE',
        description: 'Selling is permitted ONLY when an asset exceeds its target allocation by 10%.'
    },
    {
        id: 'impulse_buffer',
        title: 'IMPULSE BUFFER',
        description: 'I will wait at least one month after a negative market headline before selling.'
    },
    {
        id: 'stay_invested',
        title: 'MAXIMUM EXPOSURE',
        description: 'I will maintain a liquid cash balance of no more than 10% of total equity.'
    },
    {
        id: 'no_market_timing',
        title: 'ZERO MARKET TIMING',
        description: 'I will not attempt to sell assets to buy back lower later.'
    }
];
