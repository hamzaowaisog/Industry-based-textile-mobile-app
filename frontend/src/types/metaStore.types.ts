import type { LookupDto, LookupsAllDto } from '@api/models';

export type MetaKey = keyof LookupsAllDto;

export type MetaStore = {
  meta: LookupsAllDto | null;
  isLoaded: boolean;
  fetchMeta: () => Promise<void>;
  getLookupById: (key: MetaKey, id: number) => LookupDto | undefined;
  getLookupName: (key: MetaKey, id: number) => string;
  getList: (key: MetaKey) => LookupDto[];
};
