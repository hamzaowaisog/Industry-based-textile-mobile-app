import { DrawerNavSection } from '../types/drawer.types';

export const DRAWER_NAV: DrawerNavSection[] = [
  {
    sectionKey: 'main',
    items: [
      { id: 'Dashboard', labelKey: 'drawer.items.dashboard', icon: 'home' },
      { id: 'ClientsStack', labelKey: 'drawer.items.clients', icon: 'users' },
      { id: 'OrdersStack', labelKey: 'drawer.items.orders', icon: 'shopping-bag' },
      { id: 'ProductsStack', labelKey: 'drawer.items.products', icon: 'box' },
      { id: 'PurchasesStack', labelKey: 'drawer.items.purchases', icon: 'truck' },
    ],
  },
  {
    sectionKey: 'finance',
    items: [
      { id: 'PaymentsStack', labelKey: 'drawer.items.payments', icon: 'credit-card' },
      { id: 'InvoicesStack', labelKey: 'drawer.items.invoices', icon: 'file-text' },
      { id: 'ExpensesStack', labelKey: 'drawer.items.expenses', icon: 'receipt' },
    ],
  },
  {
    sectionKey: 'inventory',
    items: [
      { id: 'StockStack', labelKey: 'drawer.items.stockMoves', icon: 'tag' },
      { id: 'LedgerStack', labelKey: 'drawer.items.transactions', icon: 'coins' },
    ],
  },
  {
    sectionKey: 'insights',
    items: [
      { id: 'ReportsStack', labelKey: 'drawer.items.reports', icon: 'bar-chart', adminOnly: true },
      { id: 'UsersStack', labelKey: 'drawer.items.users', icon: 'user', adminOnly: true },
    ],
  },
];
