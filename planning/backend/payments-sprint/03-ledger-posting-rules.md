# Payments Sprint — Ledger Posting Rules

## Overview

Every payment creates exactly one `Transaction` record for cash-flow tracking. The `ClientId` on the transaction is `NULL` — payments are cash movements, not client obligations. Client balance is derived separately from the `v_client_balance` view.

## Posting Matrix

| Direction | TransCategoryId | TransTypeId | Sign | View Impact |
|---|---|---|---|---|
| Received (1) — customer pays | 5 (Cash In) | 2 (Credit) | positive | Increases cash |
| Paid (2) — we pay supplier | 6 (Cash Out) | 1 (Debit) | positive | Decreases cash |
| Adjustment (3) | 5 (Cash In) | 2 (Credit) | positive | Increases cash |

## Reversal Posting

When a payment is reversed:
1. A new `Transaction` is created with the **opposite** `TransTypeId`
2. A new `Payment` row is created with `OriginalPaymentId` pointing to the reversed payment
3. Original payment `IsReversed = true`
4. Original `PaymentAllocation` rows are deleted

Reversed payments are excluded from `v_client_balance` via `WHERE is_reversed = 0`.

## Views Affected

| View | How payments affect it |
|---|---|
| `v_monthly_profit_loss` | Not directly — only `TransCategoryId` 1/2/3/4 (Sales, Purchases, Expenses) included |
| `v_client_balance` | Directly reads payments table: `SUM(received)` subtracted from order totals for customers, `SUM(paid)` subtracted from purchase totals for suppliers |
| `v_monthly_credit_debit` | Reads `TransTypeId` from transactions — cash In/Out payments contribute to monthly credit/debit totals |

## Key Rule: Payment Transaction Has No ClientId

Unlike Order/Purchase transactions where `ClientId` is set to the client, payment transactions set `ClientId = NULL`. This prevents double-counting client balances — the balance is derived from the payment amounts directly in the view, not from the transaction.
