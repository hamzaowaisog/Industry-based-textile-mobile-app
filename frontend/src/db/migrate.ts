import { sqlite } from './index';

type Migration = { version: number; sql: string };

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        client_type_id INTEGER NOT NULL DEFAULT 1,
        credit_limit REAL,
        opening_balance REAL,
        notes TEXT,
        is_active INTEGER DEFAULT 1,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        name TEXT NOT NULL,
        sku TEXT,
        unit TEXT,
        default_cost REAL,
        default_price REAL,
        quantity REAL DEFAULT 0,
        average_cost REAL,
        average_price REAL,
        reorder_level REAL,
        is_active INTEGER DEFAULT 1,
        is_synced INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        client_server_id INTEGER,
        status_id INTEGER NOT NULL DEFAULT 1,
        payment_type_id INTEGER NOT NULL DEFAULT 1,
        order_date TEXT NOT NULL,
        notes TEXT,
        total_amount REAL DEFAULT 0,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS order_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_server_id INTEGER,
        qty REAL NOT NULL,
        unit_price REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        supplier_server_id INTEGER,
        status_id INTEGER NOT NULL DEFAULT 1,
        payment_type_id INTEGER NOT NULL DEFAULT 1,
        purchase_date TEXT NOT NULL,
        notes TEXT,
        total_amount REAL DEFAULT 0,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS purchase_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id INTEGER NOT NULL,
        product_server_id INTEGER,
        qty REAL NOT NULL,
        unit_cost REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        party_client_server_id INTEGER,
        payment_direction_id INTEGER NOT NULL DEFAULT 1,
        trans_mode_id INTEGER NOT NULL DEFAULT 1,
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        notes TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        expense_type_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        trans_mode_id INTEGER NOT NULL DEFAULT 1,
        trans_category_id INTEGER,
        expense_date TEXT NOT NULL,
        notes TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        product_server_id INTEGER,
        movement_type_id INTEGER NOT NULL,
        movement_source_id INTEGER NOT NULL,
        qty REAL NOT NULL,
        unit_cost REAL,
        unit_price REAL,
        movement_date TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT NOT NULL,
        server_id INTEGER,
        invoice_number TEXT,
        order_server_id INTEGER,
        purchase_server_id INTEGER,
        client_server_id INTEGER,
        status_id INTEGER NOT NULL DEFAULT 1,
        total_amount REAL NOT NULL DEFAULT 0,
        notes TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS invoice_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        qty REAL NOT NULL,
        unit_price REAL NOT NULL,
        line_total REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER NOT NULL,
        client_id INTEGER,
        order_id INTEGER,
        purchase_id INTEGER,
        user_id INTEGER,
        trans_type_id INTEGER,
        trans_mode_id INTEGER,
        trans_category_id INTEGER,
        amount REAL,
        trans_date TEXT,
        notes TEXT
      );
      CREATE TABLE IF NOT EXISTS lookups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        server_id INTEGER NOT NULL,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sync_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `,
  },
];

export const runMigrations = async (): Promise<void> => {
  await sqlite.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await sqlite.getAllAsync<{ version: number }>(
    'SELECT version FROM _migrations ORDER BY version ASC',
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      await sqlite.execAsync(migration.sql);
      await sqlite.runAsync('INSERT INTO _migrations (version, applied_at) VALUES (?, ?)', [
        migration.version,
        new Date().toISOString(),
      ]);
    }
  }
};
