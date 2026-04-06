import { db } from './db';

export type UserProfile = {
    age_range: string;
    income_range: string;
    expense_range: string;
    emergency_fund_status: string;
    debt_status: string;
    goal_type: string;
    risk_level: number;
};

export function getProfile(): UserProfile | null {
    const row = db.getFirstSync<any>(`SELECT * FROM user_profile WHERE id = 1;`);
    if (!row) return null;
    return {
        age_range: row.age_range ?? '',
        income_range: row.income_range ?? '',
        expense_range: row.expense_range ?? '',
        emergency_fund_status: row.emergency_fund_status ?? '',
        debt_status: row.debt_status ?? '',
        goal_type: row.goal_type ?? '',
        risk_level: typeof row.risk_level === 'number' ? row.risk_level : 0,
    };
}

export function upsertProfile(p: UserProfile) {
    db.runSync(
        `INSERT INTO user_profile (id, age_range, income_range, expense_range, emergency_fund_status, debt_status, goal_type, risk_level)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       age_range=excluded.age_range,
       income_range=excluded.income_range,
       expense_range=excluded.expense_range,
       emergency_fund_status=excluded.emergency_fund_status,
       debt_status=excluded.debt_status,
       goal_type=excluded.goal_type,
       risk_level=excluded.risk_level;`,
        [
            p.age_range,
            p.income_range,
            p.expense_range,
            p.emergency_fund_status,
            p.debt_status,
            p.goal_type,
            p.risk_level,
        ]
    );
}
