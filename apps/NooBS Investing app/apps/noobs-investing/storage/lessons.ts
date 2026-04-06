import { db, all, run } from "./db";
import { LESSONS, LessonSeed, LessonPhase } from "../data/lessons";

export type Lesson = {
    id: string;
    title: string;
    content: string;
    summary: string;
    sort_order: number;
    completed: boolean;
    phase: LessonPhase;
    question: string;
    correctAnswer: string;
    wrongAnswer: string;
    wrongRationale: string;
    wrongAnswer2: string;
    wrongRationale2: string;
};

export function seedLessonsIfEmpty() {
    const tableInfo = db.getAllSync<any>("PRAGMA table_info(lessons)");
    const hasPhase = tableInfo.some((c: any) => c.name === 'phase');

    if (!hasPhase) {
        db.execSync('ALTER TABLE lessons ADD COLUMN phase TEXT DEFAULT "Stability"');
    }

    const hasQuizFields = tableInfo.some((c: any) => c.name === 'question');
    if (!hasQuizFields) {
        db.execSync('ALTER TABLE lessons ADD COLUMN question TEXT DEFAULT ""');
        db.execSync('ALTER TABLE lessons ADD COLUMN correct_answer TEXT DEFAULT ""');
        db.execSync('ALTER TABLE lessons ADD COLUMN wrong_answer TEXT DEFAULT ""');
        db.execSync('ALTER TABLE lessons ADD COLUMN wrong_rationale TEXT DEFAULT ""');
    }

    const hasQuizFields2 = tableInfo.some((c: any) => c.name === 'wrong_answer_2');
    if (!hasQuizFields2) {
        db.execSync('ALTER TABLE lessons ADD COLUMN wrong_answer_2 TEXT DEFAULT ""');
        db.execSync('ALTER TABLE lessons ADD COLUMN wrong_rationale_2 TEXT DEFAULT ""');
    }

    const countRow = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM lessons');
    const existingCount = countRow?.count ?? 0;

    db.execSync('BEGIN TRANSACTION');
    try {
        for (const l of LESSONS) {
            // Try to update existing first
            const result = db.runSync(
                'UPDATE lessons SET title = ?, content = ?, summary = ?, sort_order = ?, phase = ?, question = ?, correct_answer = ?, wrong_answer = ?, wrong_rationale = ?, wrong_answer_2 = ?, wrong_rationale_2 = ? WHERE id = ?',
                [l.title, l.content, l.summary, l.sortOrder, l.phase, l.question, l.correctAnswer, l.wrongAnswer, l.wrongRationale, l.wrongAnswer2, l.wrongRationale2, l.id]
            );

            // If no rows were updated, it's a new lesson, so insert it
            if (result.changes === 0) {
                db.runSync(
                    'INSERT INTO lessons (id, title, content, summary, sort_order, completed, phase, question, correct_answer, wrong_answer, wrong_rationale, wrong_answer_2, wrong_rationale_2) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)',
                    [l.id, l.title, l.content, l.summary, l.sortOrder, l.phase, l.question, l.correctAnswer, l.wrongAnswer, l.wrongRationale, l.wrongAnswer2, l.wrongRationale2]
                );
            }
        }
        db.execSync('COMMIT');
    } catch (e) {
        db.execSync('ROLLBACK');
        console.error("Failed to seed lessons:", e);
    }
}

export type LessonRow = {
    id: string;
    title: string;
    content: string;
    summary: string;
    sort_order: number;
    completed: number;
    phase: LessonPhase;
    question: string;
    correct_answer: string;
    wrong_answer: string;
    wrong_rationale: string;
    wrong_answer_2: string;
    wrong_rationale_2: string;
};

export function listLessons(): Lesson[] {
    const rows = db.getAllSync<LessonRow>('SELECT * FROM lessons ORDER BY sort_order ASC');
    return rows.map(r => ({
        ...r,
        completed: !!r.completed,
        correctAnswer: r.correct_answer,
        wrongAnswer: r.wrong_answer,
        wrongRationale: r.wrong_rationale,
        wrongAnswer2: r.wrong_answer_2,
        wrongRationale2: r.wrong_rationale_2
    }));
}

export async function getCompletedLessonIds(): Promise<string[]> {
    const rows = await all<{ id: string }>('SELECT id FROM lessons WHERE completed = 1');
    return rows.map(r => r.id);
}

export function getLesson(id: string): Lesson | null {
    const r = db.getFirstSync<LessonRow>('SELECT * FROM lessons WHERE id = ?', [id]);
    return r ? {
        ...r,
        completed: !!r.completed,
        correctAnswer: r.correct_answer,
        wrongAnswer: r.wrong_answer,
        wrongRationale: r.wrong_rationale,
        wrongAnswer2: r.wrong_answer_2,
        wrongRationale2: r.wrong_rationale_2
    } : null;
}

import { unlockMedal } from "./achievements";

export function markLessonComplete(id: string) {
    db.runSync('UPDATE lessons SET completed = 1 WHERE id = ?', [id]);

    // Check if all lessons are done
    const total = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM lessons');
    const done = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM lessons WHERE completed = 1');

    if (total && done && total.count === done.count) {
        unlockMedal('MASTER_STUDENT');
    }
}

export function getNextLessonId(currentId: string): string | null {
    const current = getLesson(currentId);
    if (!current) return null;
    const next = db.getFirstSync<LessonRow>(
        'SELECT id FROM lessons WHERE sort_order > ? ORDER BY sort_order ASC LIMIT 1',
        [current.sort_order]
    );
    return next ? next.id : null;
}
