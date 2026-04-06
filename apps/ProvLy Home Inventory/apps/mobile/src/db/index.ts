import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDB = async () => {
  if (db) return db;
  if (dbPromise) return dbPromise;

  dbPromise = SQLite.openDatabaseAsync('home_inventory_final.db').then(newDb => {
    db = newDb;
    return newDb;
  });

  return dbPromise;
};

// Table creation strings moved here to ensure they are defined during init
const createHomesTableStr = `
  CREATE TABLE IF NOT EXISTS homes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    local_only INTEGER DEFAULT 1,
    dirty INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1
  );
`;

const createRoomsTableStr = `
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    room_type TEXT,
    parent_id TEXT,
    home_id TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    local_only INTEGER DEFAULT 1,
    dirty INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (home_id) REFERENCES homes (id)
  );
`;

const createItemsTableStr = `
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    room_id TEXT,
    home_id TEXT,
    description TEXT,
    category TEXT,
    purchase_price REAL,
    purchase_date TEXT,
    warranty_expiry TEXT,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    serial_number TEXT,
    model_number TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    local_only INTEGER DEFAULT 1,
    dirty INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (room_id) REFERENCES rooms (id),
    FOREIGN KEY (home_id) REFERENCES homes (id)
  );
`;

const createMediaTableStr = `
  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    type TEXT NOT NULL,
    local_uri TEXT NOT NULL,
    remote_ref TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    dirty INTEGER DEFAULT 1,
    FOREIGN KEY (item_id) REFERENCES items (id)
  );
`;

const createSyncStateTableStr = `
  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`;

const createActivitiesTableStr = `
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    home_id TEXT,
    FOREIGN KEY (home_id) REFERENCES homes (id)
  );
`;

const createMaintenanceTasksTableStr = `
  CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    frequency_days INTEGER,
    is_completed INTEGER DEFAULT 0,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    home_id TEXT,
    local_only INTEGER DEFAULT 1,
    dirty INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (item_id) REFERENCES items (id),
    FOREIGN KEY (home_id) REFERENCES homes (id)
  );
`;

export const initDB = async () => {
  const database = await getDB();
  try {
    console.log('Initializing database schema (Final V2)...');

    // Execute PRAGMAs separately
    await database.execAsync('PRAGMA foreign_keys = ON;');

    // Execute table creations individually to pinpoint issues
    await database.execAsync(createHomesTableStr);
    await database.execAsync(createRoomsTableStr);
    await database.execAsync(createItemsTableStr);
    await database.execAsync(createMediaTableStr);
    await database.execAsync(createSyncStateTableStr);
    await database.execAsync(createActivitiesTableStr);
    await database.execAsync(createMaintenanceTasksTableStr);

    console.log('Schema initialized, running migrations...');

    // Migrations / Column Additions for existing DBs
    try {
      await database.execAsync(createActivitiesTableStr);
      console.log('Migration: Ensured activities table exists');
    } catch (e) { /* Table might already exist */ }
    try {
      await database.execAsync(`ALTER TABLE rooms ADD COLUMN order_index INTEGER DEFAULT 0;`);
      console.log('Migration: Added rooms.order_index');
    } catch (e) { /* Column might already exist */ }

    try {
      await database.execAsync(`ALTER TABLE rooms ADD COLUMN home_id TEXT;`);
      console.log('Migration: Added rooms.home_id');
    } catch (e) { /* Column might already exist */ }

    try {
      await database.execAsync(`ALTER TABLE items ADD COLUMN home_id TEXT;`);
      console.log('Migration: Added items.home_id');
    } catch (e) { /* Column might already exist */ }

    try {
      await database.execAsync(`ALTER TABLE items ADD COLUMN serial_number TEXT;`);
      console.log('Migration: Added items.serial_number');
    } catch (e) { /* Column might already exist */ }

    try {
      await database.execAsync(`ALTER TABLE items ADD COLUMN model_number TEXT;`);
      console.log('Migration: Added items.model_number');
    } catch (e) { /* Column might already exist */ }

    try {
      await database.execAsync(`ALTER TABLE items ADD COLUMN warranty_expiry TEXT;`);
      console.log('Migration: Added items.warranty_expiry');
    } catch (e) { /* Column might already exist */ }

    try {
      await database.execAsync(createMaintenanceTasksTableStr);
      console.log('Migration: Ensured maintenance_tasks table exists');
    } catch (e) { /* Table might already exist */ }

    try {
      await database.execAsync(`ALTER TABLE maintenance_tasks ADD COLUMN deleted_at TEXT;`);
      console.log('Migration: Added maintenance_tasks.deleted_at');
    } catch (e) { /* Column might already exist */ }

    // Initialize default home if none exists
    const homeCount = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM homes');
    console.log('Existing homes count:', homeCount?.count);

    if (homeCount && homeCount.count === 0) {
      console.log('Creating default-home...');
      const now = new Date().toISOString();
      await database.runAsync(
        `INSERT INTO homes (id, name, address, created_at, updated_at, local_only, dirty, version) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['default-home', 'My Primary Home', null, now, now, 1, 0, 1]
      );
      console.log('Default home created successfully');
    }

    console.log('SQLite Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
