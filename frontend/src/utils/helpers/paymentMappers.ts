import type { PaymentDto, PaymentSummaryDto } from '@api/models';

import type { PaymentDetail, PaymentRow, PaymentSummary } from '../../types/payments.types';

const collectBillNos = (p: PaymentDto): string[] => {
  const fromAllocations = (p.allocations ?? [])
    .map((a) => a.billNo?.trim())
    .filter((b): b is string => !!b);
  if (fromAllocations.length > 0) return [...new Set(fromAllocations)];

  const flat = (p.allocatedBillNos ?? '')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
  return [...new Set(flat)];
};

export const mapApiPaymentToRow = (p: PaymentDto): PaymentRow => {
  const billNos = collectBillNos(p);
  return {
    id: p.id ?? 0,
    partyClientId: p.partyClientId ?? 0,
    partyClientName: p.partyClientName ?? '',
    paymentDirectionId: p.paymentDirectionId ?? 1,
    paymentDirectionName: p.paymentDirectionName ?? '',
    transModeId: p.transModeId ?? 1,
    transModeName: p.transModeName ?? '',
    amount: p.amount ?? 0,
    paymentDate: p.paymentDate ?? '',
    paymentDateHijriDisplay: p.paymentDateHijriDisplay ?? null,
    isReversed: !!p.isReversed,
    allocatedBillNos: billNos.join(', '),
    billNos,
  };
};

export const mapApiPaymentSummary = (s: PaymentSummaryDto): PaymentSummary => ({
  totalReceived: s.totalReceived ?? 0,
  totalPaid: s.totalPaid ?? 0,
  totalCount: s.totalCount ?? 0,
});

export const mapApiPaymentDetail = (p: PaymentDto): PaymentDetail => ({
  id: p.id ?? 0,
  partyClientId: p.partyClientId ?? 0,
  partyClientName: p.partyClientName ?? '',
  paymentDirectionId: p.paymentDirectionId ?? 1,
  paymentDirectionName: p.paymentDirectionName ?? '',
  transModeId: p.transModeId ?? 1,
  transModeName: p.transModeName ?? '',
  amount: p.amount ?? 0,
  paymentDate: p.paymentDate ?? '',
  paymentDateHijriDisplay: p.paymentDateHijriDisplay ?? null,
  notes: p.notes ?? null,
  createdAt: p.createdAt ?? null,
  recordedByName: p.recordedByName ?? null,
  isReversed: !!p.isReversed,
  reversedByPaymentId: p.reversedByPaymentId ?? null,
  originalPaymentId: p.originalPaymentId ?? null,
  isCashSettled: !!p.isCashSettled,
  allocations: p.allocations ?? [],
  billNos: collectBillNos(p),
});
