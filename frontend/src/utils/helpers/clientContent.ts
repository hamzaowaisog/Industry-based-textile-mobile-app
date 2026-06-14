import type { ClientFilterOption } from '../../types/clients.types';

export const CLIENT_FILTER_OPTIONS: ClientFilterOption[] = [
  { value: 'all', labelKey: 'clients.filterAll' },
  { value: 'customers', labelKey: 'clients.filterCustomers' },
  { value: 'suppliers', labelKey: 'clients.filterSuppliers' },
];
