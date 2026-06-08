import { sqlite } from '../index';

const TABLES_TO_CLEAR = [
  'clients',
  'products',
  'orders',
  'order_lines',
  'purchases',
  'purchase_lines',
  'payments',
  'payment_allocations',
  'expenses',
  'stock_movements',
  'invoices',
  'invoice_lines',
  'transactions',
  'lookups',
  'sync_meta',
];

export const clearAllTables = async (): Promise<void> => {
  for (const table of TABLES_TO_CLEAR) {
    await sqlite.execAsync(`DELETE FROM ${table};`);
  }
};
