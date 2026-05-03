import { getDB } from '../index';
import * as Crypto from 'expo-crypto';

export interface MaintenanceTask {
    id: string;
    itemId: string;
    title: string;
    description?: string;
    dueDate?: string;
    frequencyDays?: number;
    isCompleted: number; // 0 or 1
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    homeId?: string;
    localOnly: number;
    dirty: number;
    version: number;
    deletedAt?: string;
}

export const maintenanceTasksRepo = {
    async listTasks(homeId?: string): Promise<MaintenanceTask[]> {
        const db = await getDB();
        const filter = homeId ? 'WHERE home_id = ? AND deleted_at IS NULL' : 'WHERE deleted_at IS NULL';
        const params = homeId ? [homeId] : [];
        const result = await db.getAllAsync<any>(
            `SELECT * FROM maintenance_tasks ${filter} ORDER BY due_date ASC`,
            params
        );

        return result.map(row => ({
            id: row.id,
            itemId: row.item_id,
            title: row.title,
            description: row.description,
            dueDate: row.due_date,
            frequencyDays: row.frequency_days,
            isCompleted: row.is_completed,
            completedAt: row.completed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            homeId: row.home_id,
            localOnly: row.local_only,
            dirty: row.dirty,
            version: row.version,
            deletedAt: row.deleted_at
        }));
    },

    async createTask(task: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
        const db = await getDB();
        const id = task.id || Crypto.randomUUID();
        const now = new Date().toISOString();

        const newTask: MaintenanceTask = {
            id,
            itemId: task.itemId!,
            title: task.title || 'New Task',
            description: task.description,
            dueDate: task.dueDate,
            frequencyDays: task.frequencyDays,
            isCompleted: 0,
            createdAt: now,
            updatedAt: now,
            homeId: task.homeId,
            localOnly: 1,
            dirty: 1,
            version: 1
        };

        await db.runAsync(
            `INSERT INTO maintenance_tasks (
                id, item_id, title, description, due_date, frequency_days, 
                is_completed, created_at, updated_at, deleted_at, home_id, local_only, dirty, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newTask.id, newTask.itemId, newTask.title, newTask.description || null,
                newTask.dueDate || null, newTask.frequencyDays || null,
                newTask.isCompleted, newTask.createdAt, newTask.updatedAt,
                null, newTask.homeId || null, newTask.localOnly, newTask.dirty, newTask.version
            ]
        );

        return newTask;
    },

    async updateTask(id: string, updates: Partial<MaintenanceTask>): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
        if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
        if (updates.dueDate !== undefined) { fields.push('due_date = ?'); values.push(updates.dueDate); }
        if (updates.frequencyDays !== undefined) { fields.push('frequency_days = ?'); values.push(updates.frequencyDays); }
        if (updates.isCompleted !== undefined) {
            fields.push('is_completed = ?'); values.push(updates.isCompleted);
            if (updates.isCompleted) {
                fields.push('completed_at = ?'); values.push(now);
            } else {
                fields.push('completed_at = ?'); values.push(null);
            }
        }

        fields.push('updated_at = ?'); values.push(now);
        fields.push('dirty = 1');
        fields.push('version = version + 1');

        if (fields.length === 0) return;
        values.push(id);

        await db.runAsync(`UPDATE maintenance_tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    async deleteTask(id: string): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();
        await db.runAsync(
            `UPDATE maintenance_tasks SET deleted_at = ?, dirty = 1, updated_at = ? WHERE id = ?`,
            [now, now, id]
        );
    },

    async getDirtyTasks(): Promise<any[]> {
        const db = await getDB();
        const result = await db.getAllAsync<any>('SELECT * FROM maintenance_tasks WHERE dirty = 1');
        return result.map(row => ({
            id: row.id,
            itemId: row.item_id,
            title: row.title,
            description: row.description,
            dueDate: row.due_date,
            frequencyDays: row.frequency_days,
            isCompleted: row.is_completed,
            completedAt: row.completed_at,
            homeId: row.home_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
            localOnly: row.local_only,
            dirty: row.dirty,
            version: row.version
        }));
    },

    async markAsClean(ids: string[]): Promise<void> {
        const db = await getDB();
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE maintenance_tasks SET dirty = 0 WHERE id IN (${placeholders})`,
            ids
        );
    },

    async upsertFromSync(record: any): Promise<void> {
        const db = await getDB();
        await db.runAsync(
            `INSERT INTO maintenance_tasks (
                id, item_id, title, description, due_date, frequency_days, is_completed, 
                completed_at, created_at, updated_at, deleted_at, home_id, local_only, dirty, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
            ON CONFLICT(id) DO UPDATE SET
                item_id=excluded.item_id, title=excluded.title, description=excluded.description,
                due_date=excluded.due_date, frequency_days=excluded.frequency_days,
                is_completed=excluded.is_completed, completed_at=excluded.completed_at,
                created_at=excluded.created_at, updated_at=excluded.updated_at,
                deleted_at=excluded.deleted_at, home_id=excluded.home_id, dirty=0, version=excluded.version
            `,
            [
                record.id, record.itemId, record.title, record.description, record.dueDate,
                record.frequencyDays, record.isCompleted, record.completedAt,
                record.createdAt, record.updatedAt, record.deletedAt, record.homeId, record.version
            ]
        );
    }
};
