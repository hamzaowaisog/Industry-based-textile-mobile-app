import { create } from 'zustand';

import { metaGetAll } from '../api/generated/meta/meta';
import type { LookupDto, LookupsAllDto } from '../api/models';
import type { MetaStore } from '../types/metaStore.types';
import { parseApiResponse } from '../utils/helpers/apiResponse';

export const useMetaStore = create<MetaStore>((set, get) => ({
  meta: null,
  isLoaded: false,

  fetchMeta: async () => {
    try {
      const res = await metaGetAll();
      const r = parseApiResponse<LookupsAllDto>(res as unknown, '');
      if (r.success && r.data) {
        set({ meta: r.data, isLoaded: true });
      }
    } catch {
      // fail silently — app still works, just without lookup names
    }
  },

  getLookupById: (type, id) => {
    const list = get().meta?.[type] as LookupDto[] | undefined;
    return list?.find((item) => item.id === id);
  },

  getLookupName: (type, id) => {
    const item = get().getLookupById(type, id);
    return item?.name ?? '';
  },

  getList: (type) => {
    const list = get().meta?.[type] as LookupDto[] | undefined;
    return list ?? [];
  },
}));
