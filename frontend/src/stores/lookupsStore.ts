import { create } from 'zustand';

import { LookupDto } from '@api/models';
import { LookupsStore } from '../types/lookupsStore.types';

export const useLookupsStore = create<LookupsStore>((set, get) => ({
  lookups: null,
  isLoaded: false,

  setLookups: (lookups) => set({ lookups, isLoaded: true }),

  getLookupById: (type, id) => {
    const list = get().lookups?.[type] as LookupDto[] | undefined;
    return list?.find((item) => item.id === id);
  },
}));
