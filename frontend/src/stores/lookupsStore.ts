import { create } from 'zustand';

import { LookupDto, LookupsAllDto } from '@api/models';

interface LookupsStore {
  lookups: LookupsAllDto | null;
  isLoaded: boolean;
  setLookups: (lookups: LookupsAllDto) => void;
  getLookupById: (type: keyof LookupsAllDto, id: number) => LookupDto | undefined;
}

export const useLookupsStore = create<LookupsStore>((set, get) => ({
  lookups: null,
  isLoaded: false,

  setLookups: (lookups) => set({ lookups, isLoaded: true }),

  getLookupById: (type, id) => {
    const list = get().lookups?.[type] as LookupDto[] | undefined;
    return list?.find((item) => item.id === id);
  },
}));
