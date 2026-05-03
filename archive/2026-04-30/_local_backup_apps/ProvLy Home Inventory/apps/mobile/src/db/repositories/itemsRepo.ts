import { getDB } from '../index';
import * as Crypto from 'expo-crypto';

export interface Home {
    id: string;
    name: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
    localOnly: number;
    dirty: number;
    version: number;
}

export interface LocalItem {
    id: string;
    name: string;
    roomId?: string;
    homeId?: string;
    description?: string;
    category?: string;
    purchasePrice?: number;
    purchaseDate?: string;
    warrantyExpiry?: string;
    quantity: number;
    notes?: string;
    serialNumber?: string;
    modelNumber?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    localOnly: number; // 0 or 1
    dirty: number; // 0 or 1
    version: number;
    photos?: string[]; // Augmented
}

export const itemsRepo = {
    async listItems(): Promise<LocalItem[]> {
        const db = await getDB();
        const result = await db.getAllAsync<any>(
            `SELECT * FROM items WHERE deleted_at IS NULL ORDER BY created_at DESC`
        );

        // Map snake_case DB columns to camelCase interface
        return result.map(row => ({
            id: row.id,
            name: row.name,
            roomId: row.room_id,
            homeId: row.home_id,
            description: row.description,
            category: row.category,
            purchasePrice: row.purchase_price,
            purchaseDate: row.purchase_date,
            warrantyExpiry: row.warranty_expiry,
            quantity: row.quantity,
            notes: row.notes,
            serialNumber: row.serial_number,
            modelNumber: row.model_number,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            localOnly: row.local_only,
            dirty: row.dirty,
            version: row.version
        }));
    },

    async getItem(id: string): Promise<LocalItem | null> {
        const db = await getDB();
        const result = await db.getFirstAsync<any>(
            `SELECT * FROM items WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (!result) return null;

        return {
            id: result.id,
            name: result.name,
            roomId: result.room_id,
            homeId: result.home_id,
            description: result.description,
            category: result.category,
            purchasePrice: result.purchase_price,
            purchaseDate: result.purchase_date,
            warrantyExpiry: result.warranty_expiry,
            quantity: result.quantity,
            notes: result.notes,
            serialNumber: result.serial_number,
            modelNumber: result.model_number,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
            localOnly: result.local_only,
            dirty: result.dirty,
            version: result.version
        };
    },

    async createItem(item: Partial<LocalItem>): Promise<LocalItem> {
        const db = await getDB();
        const id = item.id || Crypto.randomUUID();
        const now = new Date().toISOString();

        const newItem: LocalItem = {
            id,
            name: item.name || 'New Item',
            roomId: item.roomId,
            homeId: item.homeId,
            description: item.description,
            category: item.category,
            purchasePrice: item.purchasePrice || 0,
            purchaseDate: item.purchaseDate,
            warrantyExpiry: item.warrantyExpiry,
            quantity: item.quantity || 1,
            notes: item.notes,
            serialNumber: item.serialNumber,
            modelNumber: item.modelNumber,
            createdAt: now,
            updatedAt: now,
            localOnly: 1, // Default to local only until synced
            dirty: 1,
            version: 1
        };

        await db.runAsync(
            `INSERT INTO items (
        id, name, room_id, home_id, description, category, purchase_price, purchase_date, warranty_expiry,
        quantity, notes, serial_number, model_number, created_at, updated_at, local_only, dirty, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newItem.id, newItem.name, newItem.roomId || null, newItem.homeId || null,
                newItem.description || null, newItem.category || null, newItem.purchasePrice ?? null,
                newItem.purchaseDate || null, newItem.warrantyExpiry || null, newItem.quantity ?? 1, newItem.notes || null,
                newItem.serialNumber || null, newItem.modelNumber || null,
                newItem.createdAt, newItem.updatedAt, newItem.localOnly, newItem.dirty, newItem.version
            ]
        );

        // Handle Photos
        if (item.photos && item.photos.length > 0) {
            for (const uri of item.photos) {
                await itemsRepo.addMedia(newItem.id, uri);
            }
        }

        return newItem;
    },

    async updateItem(id: string, updates: Partial<LocalItem>): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();

        // Construct dynamic update query
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.roomId !== undefined) { fields.push('room_id = ?'); values.push(updates.roomId); }
        if (updates.homeId !== undefined) { fields.push('home_id = ?'); values.push(updates.homeId); }
        if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
        if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
        if (updates.purchasePrice !== undefined) { fields.push('purchase_price = ?'); values.push(updates.purchasePrice); }
        if (updates.purchaseDate !== undefined) { fields.push('purchase_date = ?'); values.push(updates.purchaseDate); }
        if (updates.warrantyExpiry !== undefined) { fields.push('warranty_expiry = ?'); values.push(updates.warrantyExpiry); }
        if (updates.quantity !== undefined) { fields.push('quantity = ?'); values.push(updates.quantity); }
        if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
        if (updates.serialNumber !== undefined) { fields.push('serial_number = ?'); values.push(updates.serialNumber); }
        if (updates.modelNumber !== undefined) { fields.push('model_number = ?'); values.push(updates.modelNumber); }

        // Always update metadata
        fields.push('updated_at = ?'); values.push(now);
        fields.push('dirty = 1');
        fields.push('version = version + 1');

        if (fields.length === 0) return; // No fields to update

        values.push(id); // For WHERE clause

        await db.runAsync(
            `UPDATE items SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    },

    async softDeleteItem(id: string): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();

        await db.runAsync(
            `UPDATE items SET deleted_at = ?, dirty = 1, updated_at = ? WHERE id = ?`,
            [now, now, id]
        );
    },

    // Media Operations
    async addMedia(itemId: string, localUri: string): Promise<void> {
        const db = await getDB();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO media (
                id, item_id, type, local_uri, created_at, dirty
            ) VALUES (?, ?, 'image', ?, ?, 1)`,
            [id, itemId, localUri, now]
        );
    },

    async getMediaForItem(itemId: string): Promise<string[]> {
        const db = await getDB();
        const result = await db.getAllAsync<any>(
            `SELECT local_uri FROM media WHERE item_id = ? AND deleted_at IS NULL`,
            [itemId]
        );
        return result.map(r => r.local_uri);
    },

    async getAllMedia(): Promise<{ itemId: string, uri: string }[]> {
        const db = await getDB();
        const result = await db.getAllAsync<any>(
            `SELECT item_id, local_uri FROM media WHERE deleted_at IS NULL`
        );
        return result.map(r => ({ itemId: r.item_id, uri: r.local_uri }));
    },

    async getDirtyMedia(): Promise<any[]> {
        const db = await getDB();
        const result = await db.getAllAsync<any>(
            `SELECT * FROM media WHERE dirty = 1`
        );
        return result.map(r => ({
            id: r.id,
            itemId: r.item_id,
            type: r.type,
            localUri: r.local_uri,
            created_at: r.created_at,
            deleted_at: r.deleted_at
        }));
    },

    async markMediaAsClean(ids: string[]): Promise<void> {
        const db = await getDB();
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE media SET dirty = 0 WHERE id IN (${placeholders})`,
            ids
        );
    },

    // Home Operations
    async listHomes(): Promise<Home[]> {
        const db = await getDB();
        const result = await db.getAllAsync<any>(
            `SELECT * FROM homes WHERE deleted_at IS NULL ORDER BY created_at ASC`
        );
        return result.map(row => ({
            id: row.id,
            name: row.name,
            address: row.address,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            localOnly: row.local_only,
            dirty: row.dirty,
            version: row.version
        }));
    },

    async createHome(home: Partial<Home>): Promise<Home> {
        const db = await getDB();
        const id = home.id || Crypto.randomUUID();
        const now = new Date().toISOString();

        const newHome: Home = {
            id,
            name: home.name || 'New Home',
            address: home.address || '',
            createdAt: now,
            updatedAt: now,
            localOnly: 1,
            dirty: 1,
            version: 1
        };

        await db.runAsync(
            `INSERT INTO homes (id, name, address, created_at, updated_at, local_only, dirty, version)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newHome.id, newHome.name, newHome.address || null, newHome.createdAt, newHome.updatedAt, 1, 1, 1]
        );

        return newHome;
    },

    async updateHome(id: string, updates: Partial<Home>): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.address !== undefined) { fields.push('address = ?'); values.push(updates.address); }

        fields.push('updated_at = ?'); values.push(now);
        fields.push('dirty = 1');
        fields.push('version = version + 1');
        values.push(id);

        await db.runAsync(`UPDATE homes SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    async deleteHome(id: string): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();

        // Cascade soft delete: Home -> Rooms -> Items
        await db.runAsync(
            `UPDATE items SET deleted_at = ?, dirty = 1, updated_at = ? WHERE home_id = ?`,
            [now, now, id]
        );
        await db.runAsync(
            `UPDATE rooms SET deleted_at = ?, dirty = 1, updated_at = ? WHERE home_id = ?`,
            [now, now, id]
        );
        await db.runAsync(
            `UPDATE homes SET deleted_at = ?, dirty = 1, updated_at = ? WHERE id = ?`,
            [now, now, id]
        );
    },

    // Room Operations
    async listRooms(): Promise<any[]> {
        const db = await getDB();
        const result = await db.getAllAsync<any>(
            `SELECT * FROM rooms WHERE deleted_at IS NULL ORDER BY order_index ASC, created_at ASC`
        );
        return result.map(row => ({
            id: row.id,
            name: row.name,
            icon: row.room_type,
            parentId: row.parent_id,
            homeId: row.home_id,
            orderIndex: row.order_index,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            localOnly: row.local_only,
            dirty: row.dirty,
            version: row.version
        }));
    },

    async createRoom(room: any): Promise<any> {
        const db = await getDB();
        const id = room.id || Crypto.randomUUID();
        const now = new Date().toISOString();

        const newRoom = {
            id,
            name: room.name,
            room_type: room.icon || '📦',
            parent_id: room.parentId || null,
            home_id: room.homeId || 'default-home',
            order_index: room.orderIndex || 0,
            created_at: now,
            updated_at: now,
            local_only: 1,
            dirty: 1,
            version: 1
        };

        await db.runAsync(
            `INSERT INTO rooms (
        id, name, room_type, parent_id, home_id, order_index,
        created_at, updated_at, local_only, dirty, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newRoom.id, newRoom.name, newRoom.room_type, newRoom.parent_id, newRoom.home_id, newRoom.order_index,
                newRoom.created_at, newRoom.updated_at, newRoom.local_only, newRoom.dirty, newRoom.version
            ]
        );

        return newRoom;
    },

    async updateRoom(id: string, updates: any): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();

        // Construct dynamic update query
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.parentId !== undefined) { fields.push('parent_id = ?'); values.push(updates.parentId); }
        if (updates.icon !== undefined) { fields.push('room_type = ?'); values.push(updates.icon); }
        if (updates.orderIndex !== undefined) { fields.push('order_index = ?'); values.push(updates.orderIndex); }

        fields.push('updated_at = ?'); values.push(now);
        fields.push('dirty = 1');
        fields.push('version = version + 1');

        if (fields.length === 0) return;

        values.push(id);

        await db.runAsync(
            `UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    },

    async deleteRoom(id: string): Promise<void> {
        const db = await getDB();
        const now = new Date().toISOString();

        await db.runAsync(
            `UPDATE rooms SET deleted_at = ?, dirty = 1, updated_at = ? WHERE id = ?`,
            [now, now, id]
        );
    },

    // Sync Operations
    async getDirtyItems(): Promise<{ items: any[], rooms: any[] }> {
        const db = await getDB();
        const items = await db.getAllAsync<any>('SELECT * FROM items WHERE dirty = 1');
        const rooms = await db.getAllAsync<any>('SELECT * FROM rooms WHERE dirty = 1');

        // Map Items
        const mappedItems = items.map(row => ({
            id: row.id,
            name: row.name,
            roomId: row.room_id,
            description: row.description,
            category: row.category,
            purchasePrice: row.purchase_price,
            purchaseDate: row.purchase_date,
            warrantyExpiry: row.warranty_expiry,
            quantity: row.quantity,
            notes: row.notes,
            serialNumber: row.serial_number,
            modelNumber: row.model_number,
            homeId: row.home_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
            localOnly: row.local_only,
            dirty: row.dirty,
            version: row.version
        }));

        // Map Rooms
        const mappedRooms = rooms.map(row => ({
            id: row.id,
            name: row.name,
            icon: row.room_type,
            parentId: row.parent_id,
            homeId: row.home_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
            localOnly: row.local_only,
            dirty: row.dirty,
            version: row.version
        }));

        return { items: mappedItems, rooms: mappedRooms };
    },



    async markAsClean(ids: string[], type: 'item' | 'room' | 'media'): Promise<void> {
        const db = await getDB();
        const table = type === 'item' ? 'items' : (type === 'room' ? 'rooms' : 'media');
        if (ids.length === 0) return;

        const placeholders = ids.map(() => '?').join(',');

        await db.runAsync(
            `UPDATE ${table} SET dirty = 0 WHERE id IN (${placeholders})`,
            ids
        );
    },

    async upsertFromSync(record: any, type: 'item' | 'room' | 'media'): Promise<void> {
        const db = await getDB();

        if (type === 'item') {
            await db.runAsync(
                `INSERT INTO items (
                    id, name, room_id, home_id, description, category, purchase_price, purchase_date, warranty_expiry,
                    serial_number, model_number, quantity, notes, created_at, updated_at, deleted_at, local_only, dirty, version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name, room_id=excluded.room_id, home_id=excluded.home_id, 
                    description=excluded.description, category=excluded.category, 
                    purchase_price=excluded.purchase_price, purchase_date=excluded.purchase_date,
                    warranty_expiry=excluded.warranty_expiry, serial_number=excluded.serial_number,
                    model_number=excluded.model_number, quantity=excluded.quantity,
                    notes=excluded.notes, created_at=excluded.created_at, updated_at=excluded.updated_at,
                    deleted_at=excluded.deleted_at, dirty=0, version=excluded.version
                `,
                [
                    record.id, record.name, record.roomId, record.homeId, record.description, record.category,
                    record.purchasePrice, record.purchaseDate, record.warrantyExpiry,
                    record.serialNumber, record.modelNumber, record.quantity, record.notes,
                    record.createdAt, record.updatedAt, record.deletedAt, record.version
                ]
            );
        } else if (type === 'room') {
            await db.runAsync(
                `INSERT INTO rooms (
                    id, name, room_type, parent_id, home_id,
                    created_at, updated_at, deleted_at, local_only, dirty, version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name, room_type=excluded.room_type, parent_id=excluded.parent_id,
                    home_id=excluded.home_id, created_at=excluded.created_at, updated_at=excluded.updated_at,
                    deleted_at=excluded.deleted_at, dirty=0, version=excluded.version
                `,
                [
                    record.id, record.name, record.icon, record.parentId, record.homeId,
                    record.createdAt, record.updatedAt, record.deletedAt, record.version
                ]
            );
        } else if (type === 'media') {
            await db.runAsync(
                `INSERT INTO media (
                    id, item_id, type, local_uri, remote_ref, created_at, deleted_at, dirty
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                ON CONFLICT(id) DO UPDATE SET
                    item_id=excluded.item_id, type=excluded.type, local_uri=excluded.local_uri,
                    remote_ref=excluded.remote_ref, created_at=excluded.created_at,
                    deleted_at=excluded.deleted_at, dirty=0
                `,
                [
                    record.id, record.itemId, record.type, record.localUri, record.remoteRef,
                    record.createdAt, record.deletedAt
                ]
            );
        }
    },

    // AI Context Generation
    async getFactPack(homeId?: string): Promise<any> {
        const db = await getDB();
        const homeFilter = homeId ? `AND home_id = '${homeId}'` : '';
        const roomHomeFilter = homeId ? `AND home_id = '${homeId}'` : '';

        // 1. Totals
        const totalItemsResult = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM items WHERE deleted_at IS NULL ${homeFilter}`);
        const totalValueResult = await db.getFirstAsync<{ total: number }>(`SELECT SUM(purchase_price) as total FROM items WHERE deleted_at IS NULL ${homeFilter}`);

        // 2. Proof Gaps (Items with no media)
        const gapResult = await db.getFirstAsync<{ count: number }>(`
            SELECT COUNT(*) as count FROM items
            WHERE deleted_at IS NULL
            ${homeFilter}
            AND id NOT IN (SELECT item_id FROM media WHERE deleted_at IS NULL)
        `);

        // 3. Top High Value Items
        const topItems = await db.getAllAsync<any>(`
            SELECT i.id, i.name, i.purchase_price, i.serial_number, i.model_number,
            (SELECT COUNT(*) FROM media m WHERE m.item_id = i.id AND m.deleted_at IS NULL) as photo_count
            FROM items i
            WHERE i.deleted_at IS NULL AND i.purchase_price > 0
            ${homeFilter}
            ORDER BY i.purchase_price DESC
            LIMIT 5
        `);

        // 4. Room count
        const roomsResult = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM rooms WHERE deleted_at IS NULL ${roomHomeFilter}`);

        // 5. Home count
        const homesResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM homes');

        // 6. Recent items (last 5)
        const recentItems = await db.getAllAsync<any>(`
            SELECT name FROM items
            WHERE deleted_at IS NULL
            ${homeFilter}
            ORDER BY created_at DESC
            LIMIT 5
        `);

        // 7. Category Breakdown
        const categories = await db.getAllAsync<{ category: string, count: number }>(`
            SELECT category, COUNT(*) as count FROM items
            WHERE deleted_at IS NULL AND category IS NOT NULL
            ${homeFilter}
            GROUP BY category
            ORDER BY count DESC
        `);

        // 8. Weighted Proof Score Calculation
        const allItems = await db.getAllAsync<any>(`
            SELECT i.*, COUNT(m.id) as photo_count
            FROM items i
            LEFT JOIN media m ON i.id = m.item_id AND m.deleted_at IS NULL
            WHERE i.deleted_at IS NULL
            ${homeFilter}
            GROUP BY i.id
        `);

        let totalWeightedPoints = 0;
        allItems.forEach(item => {
            let points = 0;
            if (item.photo_count > 0) points += 40;
            if ((Number(item.purchase_price) || 0) > 0) points += 30;
            if (item.purchase_date) points += 5;
            if (item.serial_number || item.model_number) points += 10;
            if (item.description && item.description.length > 10) points += 15;
            totalWeightedPoints += points;
        });

        const aggregateProofScore = allItems.length > 0
            ? Math.round(totalWeightedPoints / allItems.length)
            : 100;

        // 9. Items needing photos (limit to 5 for context)
        const itemsNeedingPhotos = await db.getAllAsync<any>(`
            SELECT id, name FROM items
            WHERE deleted_at IS NULL
            ${homeFilter}
            AND id NOT IN (SELECT item_id FROM media WHERE deleted_at IS NULL)
            LIMIT 5
        `);

        // 10. Items needing receipts/price (limit to 5)
        const itemsNeedingReceipts = await db.getAllAsync<any>(`
            SELECT id, name FROM items
            WHERE deleted_at IS NULL
            ${homeFilter}
            AND (purchase_price IS NULL OR purchase_price = 0)
            LIMIT 5
        `);

        // 11. Items needing serial/model (limit to 5)
        const itemsNeedingSerial = await db.getAllAsync<any>(`
            SELECT id, name FROM items
            WHERE deleted_at IS NULL
            ${homeFilter}
            AND (serial_number IS NULL OR serial_number = '')
            AND (model_number IS NULL OR model_number = '')
            LIMIT 5
        `);

        const missingSerialCount = await db.getFirstAsync<{ count: number }>(`
            SELECT COUNT(*) as count FROM items
            WHERE deleted_at IS NULL
            ${homeFilter}
            AND (serial_number IS NULL OR serial_number = '')
            AND (model_number IS NULL OR model_number = '')
        `);

        const missingReceiptsCount = await db.getFirstAsync<{ count: number }>(`
            SELECT COUNT(*) as count FROM items
            WHERE deleted_at IS NULL
            ${homeFilter}
            AND (purchase_price IS NULL OR purchase_price = 0)
        `);

        return {
            total_items: totalItemsResult?.count || 0,
            total_value: totalValueResult?.total || 0,
            items_missing_proof: gapResult?.count || 0,
            items_missing_receipts: missingReceiptsCount?.count || 0,
            aggregate_proof_score: aggregateProofScore,
            high_value_items: topItems.map(i => ({
                id: i.id,
                name: i.name,
                price: i.purchase_price || 0,
                has_photo: i.photo_count > 0,
                has_receipt: (i.purchase_price || 0) > 0,
                has_serial: !!(i.serial_number || i.model_number)
            })),
            items_needing_photos: itemsNeedingPhotos.map(i => ({ id: i.id, name: i.name })),
            items_needing_receipts: itemsNeedingReceipts.map(i => ({ id: i.id, name: i.name })),
            items_needing_serial: itemsNeedingSerial.map(i => ({ id: i.id, name: i.name })),
            items_missing_serial: missingSerialCount?.count || 0,
            rooms_count: roomsResult?.count || 0,
            homes_count: homesResult?.count || 1,
            recent_items: recentItems.map(i => i.name),
            category_distribution: categories.reduce((acc, curr) => ({ ...acc, [curr.category]: curr.count }), {} as Record<string, number>),
        };
    }
};
