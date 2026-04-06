export const createHomesTable = `
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

export const createRoomsTable = `
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

export const createItemsTable = `
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    room_id TEXT,
    home_id TEXT,
    description TEXT,
    category TEXT,
    purchase_price REAL,
    purchase_date TEXT,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
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

export const createMediaTable = `
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

export const createSyncStateTable = `
  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`;
