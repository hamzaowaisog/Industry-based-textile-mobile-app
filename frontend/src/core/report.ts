import {
  reportGetClientBalances,
  reportGetClientDetailById,
  reportGetClientDetails,
  reportGetCreditDebit,
  reportGetProfitLoss,
  reportGetSummary,
} from '@api/generated/report/report';
import type {
  ClientBalanceViewModel,
  ClientDetailViewModel,
  CreditDebitViewModel,
  ProfitLossViewModel,
  SummaryTotalsViewModel,
} from '@api/models';

import { parseApiResponse } from '@utils/helpers/apiResponse';
import {
  mapApiClientBalanceRow,
  mapApiClientDetail,
  mapApiCreditDebitRow,
  mapApiProfitLossRow,
  mapApiSummaryTotals,
} from '@utils/helpers/reportMappers';

import type {
  ClientBalanceRow,
  ClientDetailReportData,
  CreditDebitRow,
  ProfitLossRow,
  SummaryTotals,
} from '../types/reports.types';

export const fetchProfitLossAsync = async (
  year?: number,
  month?: number,
): Promise<ProfitLossRow[]> => {
  try {
    const res = await reportGetProfitLoss({ year, month });
    const r = parseApiResponse<ProfitLossViewModel[]>(res, '');
    if (!r.success || !r.data) return [];
    return r.data.map(mapApiProfitLossRow);
  } catch {
    return [];
  }
};

export const fetchClientBalancesAsync = async (): Promise<ClientBalanceRow[]> => {
  try {
    const res = await reportGetClientBalances();
    const r = parseApiResponse<ClientBalanceViewModel[]>(res, '');
    if (!r.success || !r.data) return [];
    return r.data.map(mapApiClientBalanceRow);
  } catch {
    return [];
  }
};

export const fetchCreditDebitAsync = async (
  year?: number,
  month?: number,
): Promise<CreditDebitRow[]> => {
  try {
    const res = await reportGetCreditDebit({ year, month });
    const r = parseApiResponse<CreditDebitViewModel[]>(res, '');
    if (!r.success || !r.data) return [];
    return r.data.map(mapApiCreditDebitRow);
  } catch {
    return [];
  }
};

export const fetchSummaryTotalsAsync = async (): Promise<SummaryTotals | null> => {
  try {
    const res = await reportGetSummary();
    const r = parseApiResponse<SummaryTotalsViewModel>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiSummaryTotals(r.data);
  } catch {
    return null;
  }
};

export const fetchClientDetailsAsync = async (): Promise<ClientDetailReportData[]> => {
  try {
    const res = await reportGetClientDetails();
    const r = parseApiResponse<ClientDetailViewModel[]>(res, '');
    if (!r.success || !r.data) return [];
    return r.data.map(mapApiClientDetail);
  } catch {
    return [];
  }
};

export const fetchClientDetailByIdAsync = async (
  clientId: number,
): Promise<ClientDetailReportData | null> => {
  try {
    const res = await reportGetClientDetailById(clientId);
    const r = parseApiResponse<ClientDetailViewModel>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiClientDetail(r.data);
  } catch {
    return null;
  }
};
