import { LookupDto, LookupsAllDto } from '@api/models';

export type LookupsStore = {
  lookups: LookupsAllDto | null;
  isLoaded: boolean;
  setLookups: (lookups: LookupsAllDto) => void;
  getLookupById: (type: keyof LookupsAllDto, id: number) => LookupDto | undefined;
};
