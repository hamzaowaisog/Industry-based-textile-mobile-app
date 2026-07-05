import type { PaymentDto } from '@api/models';

import type { PaymentDetail, PaymentRow } from '../../types/payments.types';

export const mapApiPaymentToRow = (p: PaymentDto): PaymentRow => ({
  id: p.id ?? 0,
  partyClientId: p.partyClientId ?? 0,
  partyClientName: p.partyClientName ?? '',
  paymentDirectionId: p.paymentDirectionId ?? 1,
  paymentDirectionName: p.paymentDirectionName ?? '',
  transModeId: p.transModeId ?? 1,
  transModeName: p.transModeName ?? '',
  amount: p.amount ?? 0,
  paymentDate: p.paymentDate ?? '',
  isReversed: !!p.isReversed,
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
  notes: p.notes ?? null,
  createdAt: p.createdAt ?? null,
  recordedByName: p.recordedByName ?? null,
  isReversed: !!p.isReversed,
  reversedByPaymentId: p.reversedByPaymentId ?? null,
  originalPaymentId: p.originalPaymentId ?? null,
  isCashSettled: !!p.isCashSettled,
  allocations: p.allocations ?? [],
});
