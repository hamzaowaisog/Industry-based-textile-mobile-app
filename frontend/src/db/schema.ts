import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  clientTypeId: integer('client_type_id').notNull().default(1),
  creditLimit: real('credit_limit'),
  openingBalance: real('opening_balance'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  name: text('name').notNull(),
  sku: text('sku'),
  unit: text('unit'),
  defaultCost: real('default_cost'),
  defaultPrice: real('default_price'),
  quantity: real('quantity').default(0),
  averageCost: real('average_cost'),
  averagePrice: real('average_price'),
  reorderLevel: real('reorder_level'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  clientServerId: integer('client_server_id'),
  statusId: integer('status_id').notNull().default(1),
  paymentTypeId: integer('payment_type_id').notNull().default(1),
  orderDate: text('order_date').notNull(),
  notes: text('notes'),
  totalAmount: real('total_amount').default(0),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
});

export const orderLines = sqliteTable('order_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull(),
  productServerId: integer('product_server_id'),
  qty: real('qty').notNull(),
  unitPrice: real('unit_price').notNull(),
});

export const purchases = sqliteTable('purchases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  supplierServerId: integer('supplier_server_id'),
  statusId: integer('status_id').notNull().default(1),
  paymentTypeId: integer('payment_type_id').notNull().default(1),
  purchaseDate: text('purchase_date').notNull(),
  notes: text('notes'),
  totalAmount: real('total_amount').default(0),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
});

export const purchaseLines = sqliteTable('purchase_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  purchaseId: integer('purchase_id').notNull(),
  productServerId: integer('product_server_id'),
  qty: real('qty').notNull(),
  unitCost: real('unit_cost').notNull(),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  partyClientServerId: integer('party_client_server_id'),
  paymentDirectionId: integer('payment_direction_id').notNull().default(1),
  transModeId: integer('trans_mode_id').notNull().default(1),
  amount: real('amount').notNull(),
  paymentDate: text('payment_date').notNull(),
  notes: text('notes'),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
});

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  expenseTypeId: integer('expense_type_id').notNull(),
  amount: real('amount').notNull(),
  transModeId: integer('trans_mode_id').notNull().default(1),
  transCategoryId: integer('trans_category_id'),
  expenseDate: text('expense_date').notNull(),
  notes: text('notes'),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
});

export const stockMovements = sqliteTable('stock_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  productServerId: integer('product_server_id'),
  movementTypeId: integer('movement_type_id').notNull(),
  movementSourceId: integer('movement_source_id').notNull(),
  qty: real('qty').notNull(),
  unitCost: real('unit_cost'),
  unitPrice: real('unit_price'),
  movementDate: text('movement_date').notNull(),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
});

export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  localId: text('local_id').notNull(),
  serverId: integer('server_id'),
  invoiceNumber: text('invoice_number'),
  orderServerId: integer('order_server_id'),
  purchaseServerId: integer('purchase_server_id'),
  clientServerId: integer('client_server_id'),
  statusId: integer('status_id').notNull().default(1),
  totalAmount: real('total_amount').notNull().default(0),
  notes: text('notes'),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at'),
});

export const invoiceLines = sqliteTable('invoice_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull(),
  productName: text('product_name').notNull(),
  qty: real('qty').notNull(),
  unitPrice: real('unit_price').notNull(),
  lineTotal: real('line_total').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serverId: integer('server_id').notNull(),
  clientId: integer('client_id'),
  orderId: integer('order_id'),
  purchaseId: integer('purchase_id'),
  userId: integer('user_id'),
  transTypeId: integer('trans_type_id'),
  transModeId: integer('trans_mode_id'),
  transCategoryId: integer('trans_category_id'),
  amount: real('amount'),
  transDate: text('trans_date'),
  notes: text('notes'),
});

export const lookups = sqliteTable('lookups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  serverId: integer('server_id').notNull(),
  name: text('name').notNull(),
});

export const syncMeta = sqliteTable('sync_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
