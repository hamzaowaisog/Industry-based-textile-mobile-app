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
      CREATE TABLE IF NOT EXISTS payment_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      local_id TEXT NOT NULL,
      server_id INTEGER,
      payment_server_id INTEGER,
      order_server_id INTEGER,
      purchase_server_id INTEGER,
      invoice_server_id INTEGER,
      allocated_amount REAL NOT NULL
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

migrations.push({
  version: 2,
  sql: `
    ALTER TABLE payments ADD COLUMN is_reversed INTEGER DEFAULT 0;
    ALTER TABLE payments ADD COLUMN original_payment_server_id INTEGER;
  `,
});

migrations.push({
  version: 3,
  sql: `
    ALTER TABLE invoices ADD COLUMN issue_date TEXT;
    ALTER TABLE invoices ADD COLUMN due_date TEXT;
  `,
});

migrations.push({
  version: 4,
  sql: `
    ALTER TABLE clients ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE clients ADD COLUMN updated_at TEXT;

    ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN updated_at TEXT;
    ALTER TABLE products ADD COLUMN cost_change_count INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN price_change_count INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN total_quantity_sold REAL DEFAULT 0;
    ALTER TABLE products ADD COLUMN total_quantity_purchased REAL DEFAULT 0;

    ALTER TABLE orders ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE orders ADD COLUMN updated_at TEXT;

    ALTER TABLE order_lines ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE order_lines ADD COLUMN updated_at TEXT;

    ALTER TABLE purchases ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE purchases ADD COLUMN updated_at TEXT;

    ALTER TABLE purchase_lines ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE purchase_lines ADD COLUMN updated_at TEXT;

    ALTER TABLE payments ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE payments ADD COLUMN updated_at TEXT;

    ALTER TABLE payment_allocations ADD COLUMN is_synced INTEGER DEFAULT 0;
    ALTER TABLE payment_allocations ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE payment_allocations ADD COLUMN updated_at TEXT;

    ALTER TABLE expenses ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE expenses ADD COLUMN updated_at TEXT;

    ALTER TABLE stock_movements ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE stock_movements ADD COLUMN updated_at TEXT;
    ALTER TABLE stock_movements ADD COLUMN average_cost_at_movement REAL;
    ALTER TABLE stock_movements ADD COLUMN average_price_at_movement REAL;

    ALTER TABLE invoices ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE invoices ADD COLUMN updated_at TEXT;
    ALTER TABLE invoices ADD COLUMN created_by_user_server_id INTEGER;

    ALTER TABLE invoice_lines ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE invoice_lines ADD COLUMN updated_at TEXT;

    ALTER TABLE transactions ADD COLUMN version INTEGER DEFAULT 0;
    ALTER TABLE transactions ADD COLUMN updated_at TEXT;
    ALTER TABLE transactions ADD COLUMN local_id TEXT;
    ALTER TABLE transactions ADD COLUMN invoice_id INTEGER;
  `,
});

migrations.push({
  version: 5,
  sql: `
    ALTER TABLE payment_allocations ADD COLUMN payment_local_id TEXT;
  `,
});

migrations.push({
  version: 6,
  sql: `
    ALTER TABLE payment_allocations ADD COLUMN created_at TEXT;
  `,
});

// Remediation: devices that had v1 applied before payment_allocations was added
// will have failed v4/v5/v6 silently. This creates the table with all columns
// if it still doesn't exist, so those deferred ALTER TABLE statements can safely
// be retried (the runner below tolerates duplicate-column errors per statement).
migrations.push({
  version: 7,
  sql: `
    CREATE TABLE IF NOT EXISTS payment_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      local_id TEXT NOT NULL,
      server_id INTEGER,
      payment_server_id INTEGER,
      payment_local_id TEXT,
      order_server_id INTEGER,
      purchase_server_id INTEGER,
      invoice_server_id INTEGER,
      allocated_amount REAL NOT NULL,
      is_synced INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      updated_at TEXT,
      created_at TEXT
    );
  `,
});

migrations.push({
  version: 8,
  sql: `
    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT    PRIMARY KEY,
      type       TEXT    NOT NULL,
      title      TEXT    NOT NULL,
      body       TEXT    NOT NULL,
      entity_id  INTEGER,
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL
    );
  `,
});

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
      const statements = migration.sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await sqlite.execAsync(statement + ';');
        } catch (e) {
          console.warn(`Migration v${migration.version} statement skipped:`, e);
        }
      }

      await sqlite.runAsync('INSERT INTO _migrations (version, applied_at) VALUES (?, ?)', [
        migration.version,
        new Date().toISOString(),
      ]);
    }
  }
};
