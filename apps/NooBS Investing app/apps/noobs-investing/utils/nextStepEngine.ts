import { getProfile } from '../storage/profile';
import { listLessons } from '../storage/lessons';
import { db } from '../storage/db';
import { COPY } from '../constants/copy';
import { getWeekStartISO } from './dates';
import { hasMajorDrift } from '../storage/rebalancing';
import { getPlan } from '../storage/plan';
import { getCurrentLanguage, getTranslator } from '../i18n';

export type NextStep =
    | { kind: 'onboarding'; title: string; subtitle: string; route: string }
    | { kind: 'stability'; title: string; subtitle: string; route: string }
    | { kind: 'lesson'; title: string; subtitle: string; route: string }
    | { kind: 'paper_entry'; title: string; subtitle: string; route: string }
    | { kind: 'weekly_checkin'; title: string; subtitle: string; route: string }
    | { kind: 'default'; title: string; subtitle: string; route: string };

export async function computeNextStep(): Promise<NextStep> {
    const { tr } = getTranslator(getCurrentLanguage());
    const profile = getProfile();
    if (!profile) {
        return {
            kind: 'onboarding',
            title: tr('Welcome to the reality check.'),
            subtitle: COPY.ONBOARDING_INTRO,
            route: '/onboarding',
        };
    }

    // 1) Emergency fund and Debt check (Stability)
    const hasEf = profile.emergency_fund_status !== 'none' && profile.emergency_fund_status !== '<1 month';
    const hasBadDebt = profile.debt_status === 'credit cards' || profile.debt_status === 'mixed';

    if (!hasEf || hasBadDebt) {
        return {
            kind: 'stability',
            title: tr('Stability first.'),
            subtitle: !hasEf ? tr('Build a cushion before you build a portfolio.') : tr('High-interest debt is a black hole. Close it first.'),
            route: '/(tabs)/plan',
        };
    }

    // 1.5) Consistency Check
    const plan = await getPlan();
    if (plan.contribution_amount > 0) {
        // Calculate period start
        const now = new Date();
        let periodStartISO = "";

        if (plan.frequency === 'weekly') {
            periodStartISO = getWeekStartISO(now);
        } else if (plan.frequency === 'biweekly') {
            // Simple heuristic: 14 days ago
            const d = new Date(now);
            d.setDate(d.getDate() - 14);
            periodStartISO = d.toISOString().slice(0, 10);
        } else {
            // Monthly: 1st of this month
            periodStartISO = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        }

        // Get actual buys in this period (Real and Paper)
        const actual = db.getFirstSync<any>(
            `SELECT SUM(amount) as total FROM transactions 
             WHERE amount > 0 
             AND asset_name != 'CASH'
             AND date_iso >= ?`,
            [periodStartISO]
        );


        const totalActual = actual?.total ?? 0;
        if (totalActual < plan.contribution_amount * 0.9) {
            // If we are more than 10% behind, warn
            return {
                kind: 'default',
                title: tr('You are falling behind.'),
                subtitle: `${tr('Plan')}: $${plan.contribution_amount} ${plan.frequency}. ${tr('Actual')}: $${Math.round(totalActual)}. ${tr('Stop making excuses, start making trades.')}`,
                route: '/invest?kind=paper', // Direct to invest or portfolio
            };
        }
    }

    // 2) Next incomplete lesson
    const lessons = listLessons();
    const nextLesson = lessons.find((l) => !l.completed);
    if (nextLesson) {
        return {
            kind: 'lesson',
            title: `Next: ${nextLesson.title}`,
            subtitle: COPY.DASHBOARD_LEARN,
            route: `/lesson/${nextLesson.id}`,
        };
    }

    // 2.5) Rebalancing check
    const needsRebalancingReal = await hasMajorDrift('real');
    const needsRebalancingPaper = await hasMajorDrift('paper');
    if (needsRebalancingReal || needsRebalancingPaper) {
        return {
            kind: 'default',
            title: tr('Your plan is drifting.'),
            subtitle: tr('You are no longer matching your target strategy. It is time to rebalance.'),
            route: '/(tabs)/portfolio',
        };
    }

    // 3) Paper Practice (Now as a Verified Resident)
    const paperTx = db.getFirstSync<any>(`SELECT id FROM transactions WHERE kind = 'paper' AND asset_name != 'CASH' LIMIT 1;`);

    if (!paperTx) {
        return {
            kind: 'paper_entry',
            title: tr('Graduate Task: Simulator sandbox.'),
            subtitle: tr("Class is over. Add your first 3 paper entries to see how the market actually 'drifts.' Theory ends here."),
            route: '/add-entry?kind=paper',
        };
    }

    // 4) Weekly check-in exists?
    const week = getWeekStartISO();
    const check = db.getFirstSync<any>(
        `SELECT week_start_iso FROM weekly_checkins WHERE week_start_iso = ?;`,
        [week]
    );
    if (!check) {
        return {
            kind: 'weekly_checkin',
            title: tr('Weekly check-in.'),
            subtitle: tr('Did you follow the plan... or vibes?'),
            route: '/checkin',
        };
    }

    return {
        kind: 'default',
        title: tr('Steady as she goes.'),
        subtitle: COPY.STAY_CONSISTENT,
        route: '/(tabs)',
    };
}