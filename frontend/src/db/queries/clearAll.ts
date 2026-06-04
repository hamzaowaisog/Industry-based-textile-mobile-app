import { sqlite } from '../index';

export const clearAllTables = async (): Promise<void> => {
  await sqlite.execAsync(`
    DELETE FROM clients;
    DELETE FROM products;
    DELETE FROM orders;
    DELETE FROM order_lines;
    DELETE FROM purchases;
    DELETE FROM purchase_lines;
    DELETE FROM payments;
    DELETE FROM payment_allocations;
    DELETE FROM expenses;
    DELETE FROM stock_movements;
    DELETE FROM invoices;
    DELETE FROM invoice_lines;
    DELETE FROM transactions;
    DELETE FROM lookups;
    DELETE FROM sync_meta;
  `);
};
